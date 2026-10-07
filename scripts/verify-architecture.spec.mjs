import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  buildModuleGraph,
  findLayerConfigProblems,
  findLayerViolations,
  findModuleCycles,
  runArchitectureAudit,
} from './verify-architecture.mjs';

const lib = 'projects/ui/src/lib';

const defaultLayers = {
  order: ['foundation', 'core', 'primitives', 'composites', 'root'],
  modules: {
    foundation: ['types', 'utils'],
    core: ['providers'],
    primitives: ['components/button', 'components/a', 'components/b'],
    composites: ['components/select'],
    root: ['root'],
  },
};

/** The default layers limited to the modules the fixture files actually create. */
function layersFor(files) {
  const present = new Set(
    Object.keys(files).map((path) => {
      const parts = path.split('/');
      return parts[0] === 'components' ? `components/${parts[1]}` : parts[0];
    }),
  );

  return {
    order: defaultLayers.order,
    modules: Object.fromEntries(
      Object.entries(defaultLayers.modules).map(([layer, modules]) => [
        layer,
        modules.filter((module) => present.has(module)),
      ]),
    ),
  };
}

function makeRepo(files, { baseline, layers = layersFor(files) } = {}) {
  const root = mkdtempSync(join(tmpdir(), 'kui-architecture-'));
  for (const [path, content] of Object.entries(files)) {
    const target = join(root, lib, path);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, content);
  }
  mkdirSync(join(root, 'scripts'), { recursive: true });
  writeFileSync(join(root, 'scripts/architecture-layers.json'), JSON.stringify(layers));
  if (baseline) {
    writeFileSync(join(root, 'scripts/architecture-baseline.json'), JSON.stringify(baseline));
  }
  return root;
}

describe('verify-architecture', () => {
  it('accepts acyclic modules that only import downwards', () => {
    const root = makeRepo({
      'types/size.ts': 'export type KuiSize = "md";\nexport const SIZE = 1;\n',
      'components/button/button.ts':
        "import { SIZE } from '../../types/size';\nexport const b = SIZE;\n",
      'components/select/select.ts': "import { b } from '../button/button';\nexport const s = b;\n",
    });

    expect(runArchitectureAudit(root)).toEqual([]);
  });

  it('reports a new cycle between two component folders', () => {
    const root = makeRepo({
      'components/a/a.ts': "import { b } from '../b/b';\nexport const a = b;\n",
      'components/b/b.ts': "import { a } from '../a/a';\nexport const b = a;\n",
    });

    expect(runArchitectureAudit(root)).toContain('new module cycle: components/a <-> components/b');
  });

  it('accepts a cycle that is listed in the baseline and reports it once it is fixed', () => {
    const files = {
      'components/a/a.ts': "import { b } from '../b/b';\nexport const a = b;\n",
      'components/b/b.ts': "import { a } from '../a/a';\nexport const b = a;\n",
    };
    const listed = { cycles: ['components/a <-> components/b'], layerViolations: [] };

    expect(runArchitectureAudit(makeRepo(files, { baseline: listed }))).toEqual([]);

    const fixed = makeRepo(
      { ...files, 'components/b/b.ts': 'export const b = 1;\n' },
      { baseline: listed },
    );
    expect(runArchitectureAudit(fixed)).toEqual([
      expect.stringContaining('stale module cycle in scripts/architecture-baseline.json'),
    ]);
  });

  it('reports an import from a lower layer to a component and names the file', () => {
    const root = makeRepo({
      'utils/helper.ts': "import { b } from '../components/button/button';\nexport const h = b;\n",
      'components/button/button.ts': 'export const b = 1;\n',
    });

    const failures = runArchitectureAudit(root);

    expect(failures).toHaveLength(1);
    expect(failures[0]).toContain(
      'new layer violation: utils (foundation) -> components/button (primitives)',
    );
    expect(failures[0]).toContain('utils/helper.ts');
  });

  it('reports a primitive that imports a composite', () => {
    const root = makeRepo({
      'components/button/button.ts': "import { s } from '../select/select';\nexport const b = s;\n",
      'components/select/select.ts': 'export const s = 1;\n',
    });

    expect(runArchitectureAudit(root)).toEqual([
      expect.stringContaining(
        'new layer violation: components/button (primitives) -> components/select (composites)',
      ),
    ]);
  });

  it('lets a composite import another composite and the root import everything', () => {
    const root = makeRepo(
      {
        'components/select/select.ts': 'export const s = 1;\n',
        'components/other/other.ts': "import { s } from '../select/select';\nexport const o = s;\n",
        'root/provide.ts': "import { o } from '../components/other/other';\nexport const p = o;\n",
      },
      {
        layers: {
          order: defaultLayers.order,
          modules: { composites: ['components/select', 'components/other'], root: ['root'] },
        },
      },
    );

    expect(runArchitectureAudit(root)).toEqual([]);
  });

  it('reports a module that has no layer and a layer entry for a module that is gone', () => {
    const root = makeRepo(
      { 'components/new-thing/new-thing.ts': 'export const n = 1;\n' },
      { layers: defaultLayers },
    );

    const failures = runArchitectureAudit(root);

    expect(failures).toContain(
      'module components/new-thing has no layer in scripts/architecture-layers.json',
    );
    expect(failures).toContain(
      'scripts/architecture-layers.json lists components/button, which no longer exists',
    );
  });

  it('ignores type-only imports, inline type specifiers and files that export only types', () => {
    const root = makeRepo({
      'components/a/a.ts': [
        "import type { B } from '../b/b';",
        "import { type C } from '../c/c';",
        "import { D } from '../d/d';",
        'export const a = 1;',
        '',
      ].join('\n'),
      'components/b/b.ts': "import { a } from '../a/a';\nexport interface B { a: typeof a }\n",
      'components/c/c.ts':
        "import { a } from '../a/a';\nexport const c = a;\nexport type C = number;\n",
      'components/d/d.ts': "import { a } from '../a/a';\nexport interface D { a: typeof a }\n",
    });

    const failures = runArchitectureAudit(root).filter((failure) => !failure.includes('layer'));

    expect(failures).toEqual([]);
  });

  it('does not count a barrel as a consumer of the modules it re-exports', () => {
    const root = makeRepo({
      'providers/index.ts': "export * from '../components/button/button';\n",
      'providers/kui-defaults.ts': 'export const d = 1;\n',
      'components/button/button.ts': 'export const b = 1;\n',
    });

    expect(runArchitectureAudit(root).filter((failure) => !failure.includes('layer'))).toEqual([]);
    expect(
      runArchitectureAudit(root).filter((failure) => failure.includes('new layer violation')),
    ).toEqual([]);
  });

  it('finds cycles, violations and layer-file problems from a graph directly', () => {
    const edges = new Map([
      ['utils', new Map([['components/a', []]])],
      ['components/a', new Map([['utils', []]])],
    ]);
    const layers = {
      order: defaultLayers.order,
      layerOf: new Map([
        ['utils', { layer: 'foundation', rank: 0 }],
        ['components/a', { layer: 'primitives', rank: 2 }],
      ]),
    };

    expect(findModuleCycles(edges)).toEqual(['components/a <-> utils']);
    expect(findLayerViolations(edges, layers)).toEqual([
      'utils (foundation) -> components/a (primitives)',
    ]);
    expect(findLayerConfigProblems(edges, layers)).toEqual([]);
  });

  it('builds the graph of the real library without throwing', () => {
    expect(buildModuleGraph().size).toBeGreaterThan(30);
  });
});

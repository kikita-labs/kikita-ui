import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  buildModuleGraph,
  findLayerViolations,
  findModuleCycles,
  runArchitectureAudit,
} from './verify-architecture.mjs';

const lib = 'projects/ui/src/lib';

function makeRepo(files, baseline) {
  const root = mkdtempSync(join(tmpdir(), 'kui-architecture-'));
  for (const [path, content] of Object.entries(files)) {
    const target = join(root, lib, path);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, content);
  }
  if (baseline) {
    mkdirSync(join(root, 'scripts'), { recursive: true });
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

    expect(runArchitectureAudit(makeRepo(files, listed))).toEqual([]);

    const fixed = makeRepo({ ...files, 'components/b/b.ts': 'export const b = 1;\n' }, listed);
    expect(runArchitectureAudit(fixed)).toEqual([
      expect.stringContaining('stale module cycle in scripts/architecture-baseline.json'),
    ]);
  });

  it('reports an import from a lower group to a component and names the file', () => {
    const root = makeRepo({
      'utils/helper.ts': "import { b } from '../components/button/button';\nexport const h = b;\n",
      'components/button/button.ts': 'export const b = 1;\n',
    });

    const failures = runArchitectureAudit(root);

    expect(failures).toHaveLength(1);
    expect(failures[0]).toContain('new layer violation: utils -> components/button');
    expect(failures[0]).toContain('utils/helper.ts');
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

    expect(runArchitectureAudit(root)).toEqual([]);
  });

  it('does not count a barrel as a consumer of the modules it re-exports', () => {
    const root = makeRepo({
      'tokens/index.ts': "export * from '../components/button/button';\n",
      'components/button/button.ts': 'export const b = 1;\n',
    });

    expect(runArchitectureAudit(root)).toEqual([]);
  });

  it('finds cycles and violations from a graph directly', () => {
    const edges = new Map([
      ['utils', new Map([['components/a', []]])],
      ['components/a', new Map([['utils', []]])],
    ]);

    expect(findModuleCycles(edges)).toEqual(['components/a <-> utils']);
    expect(findLayerViolations(edges)).toEqual(['utils -> components/a']);
  });

  it('builds the graph of the real library without throwing', () => {
    expect(buildModuleGraph().size).toBeGreaterThan(30);
  });
});

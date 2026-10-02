import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { describe, expect, it } from 'vitest';

import { runStaticAudit } from './verify-static-audit.mjs';

const playgroundRouteEnumPath =
  'projects/kikita-ui-playground/src/app/enums/playground-route.enum.ts';

function playgroundRouteEnum(components) {
  const members = components.map((name) => `  ${name} = '${name}',`);

  return [
    'export enum PlaygroundRoute {',
    "  Root = '',",
    "  Components = 'components',",
    "  ComponentId = ':componentId',",
    ...members,
    '}',
    '',
  ].join('\n');
}

describe('verify-static-audit', () => {
  it('accepts a minimal valid repository surface', () => {
    const root = makeValidRepo();

    expect(runStaticAudit(root)).toEqual([]);
  });

  it('reports a component style that reads a raw palette step', () => {
    const root = makeValidRepo();
    writeFileSync(
      join(root, 'projects/ui/src/styles/button.css'),
      '.kui-button \n  --_fill-hover: var(--kui-success-4);\n}\n',
    );

    expect(runStaticAudit(root)).toContain(
      'projects/ui/src/styles/button.css:2 reads --kui-success-4 directly; use a semantic or component token',
    );
  });

  it('reports a component style that reads a raw seed variable', () => {
    const root = makeValidRepo();
    writeFileSync(
      join(root, 'projects/ui/src/styles/button.css'),
      '.kui-button { color: var(--kui-seed-primary); }\n',
    );

    expect(runStaticAudit(root)).toContain(
      'projects/ui/src/styles/button.css:1 reads --kui-seed-primary directly; use a semantic or component token',
    );
  });

  it('allows palette steps inside the theme generator and in comments or specs', () => {
    const root = makeValidRepo();
    mkdirSync(join(root, 'projects/ui/src/lib/theme'), { recursive: true });
    writeFileSync(
      join(root, 'projects/ui/src/lib/theme/create-kui-theme.ts'),
      "export const x = { '--kui-color-primary-fill': 'var(--kui-primary-6)' };\n",
    );
    writeFileSync(
      join(root, 'projects/ui/src/styles/button.css'),
      '/* --kui-primary-6 is the seed step */\n.kui-button { color: var(--kui-button-color, var(--kui-color-text)); }\n',
    );
    writeFileSync(
      join(root, 'projects/ui/src/lib/components/button/kui-button.directive.spec.ts'),
      "import { describe, it } from 'vitest';\n\ndescribe('button', () => { it('reads var(--kui-primary-6)', () => {}); });\n",
    );

    expect(runStaticAudit(root)).toEqual([]);
  });

  it('does not flag longer variable names that merely start with a palette scale', () => {
    const root = makeValidRepo();
    writeFileSync(
      join(root, 'projects/ui/src/styles/button.css'),
      '.kui-button { color: var(--kui-primary-fill-token); }\n',
    );

    expect(runStaticAudit(root)).toEqual([]);
  });

  it('reports a colour literal in a component style', () => {
    const root = makeValidRepo();
    writeFileSync(
      join(root, 'projects/ui/src/styles/button.css'),
      '.kui-button {\n  background: var(--kui-button-bg, oklch(0.97 0.01 80));\n}\n',
    );

    expect(runStaticAudit(root)).toContain(
      'projects/ui/src/styles/button.css:2 writes the colour literal oklch(0.97 0.01 80); read a colour role, or use black or white',
    );
  });

  it('reports hex and rgb colour literals in a component style', () => {
    const root = makeValidRepo();
    writeFileSync(
      join(root, 'projects/ui/src/styles/button.css'),
      '.kui-button {\n  color: #fff;\n  border-color: rgb(1 2 3);\n}\n',
    );

    expect(runStaticAudit(root)).toEqual([
      'projects/ui/src/styles/button.css:2 writes the colour literal #fff; read a colour role, or use black or white',
      'projects/ui/src/styles/button.css:3 writes the colour literal rgb(1 2 3); read a colour role, or use black or white',
    ]);
  });

  it('reports a layer z-index literal but allows local stacking and token reads', () => {
    const root = makeValidRepo();
    writeFileSync(
      join(root, 'projects/ui/src/styles/button.css'),
      '.kui-button {\n  z-index: 1000;\n}\n.kui-button:focus-visible {\n  z-index: 2;\n}\n.kui-button--x {\n  z-index: var(--kui-z-dropdown);\n}\n',
    );

    expect(runStaticAudit(root)).toEqual([
      'projects/ui/src/styles/button.css:2 writes the layer z-index 1000; read a --kui-z-* token',
    ]);
  });

  it('allows black and white, with alpha, as a colour literal', () => {
    const root = makeValidRepo();
    writeFileSync(
      join(root, 'projects/ui/src/styles/button.css'),
      '.kui-button {\n  box-shadow: 0 1px 2px oklch(0 0 0 / 0.22), inset 0 0 0 1px oklch(1 0 0 / 0.6);\n  --_kui-button-scrim: oklch(0 0 0);\n  color: oklch(1 0 0);\n}\n',
    );

    expect(runStaticAudit(root)).toEqual([]);
  });

  it('reports a colour literal in the theme generator but allows black, white and the palettes', () => {
    const root = makeValidRepo();
    mkdirSync(join(root, 'projects/ui/src/lib/theme'), { recursive: true });
    writeFileSync(
      join(root, 'projects/ui/src/lib/theme/create-kui-theme.ts'),
      [
        "const FALLBACK_INFO_SEED = 'oklch(0.58 0.16 215)';",
        "const a = { '--kui-avatar-p1-bg': 'oklch(0.87 0.08 285)' };",
        "const b = { '--kui-x': '0 0 0 1px oklch(0 0 0 / 0.2)' };",
        "const c = { '--kui-slider-halo': '0 0 0 5px oklch(0.67 0.2125 285 / 0.22)' };",
        '',
      ].join('\n'),
    );

    expect(runStaticAudit(root)).toEqual([
      'projects/ui/src/lib/theme/create-kui-theme.ts:4 writes the colour literal oklch(0.67 0.2125 285 / 0.22); derive it from a seed, or use black or white',
    ]);
  });

  it('skips the generated default theme in the token checks', () => {
    const root = makeValidRepo();
    writeFileSync(
      join(root, 'projects/ui/src/styles/kikita-ui.css'),
      "@import './theme-default.css';\n@import './button.css';\n",
    );
    writeFileSync(
      join(root, 'projects/ui/src/styles/theme-default.css'),
      '@layer kui.tokens {\n  :root {\n    --kui-primary-6: oklch(0.52 0.25 285);\n    --kui-color-primary-fill: var(--kui-primary-6);\n  }\n}\n',
    );

    expect(runStaticAudit(root)).toEqual([]);
  });

  it('reports a colour role read without a component token', () => {
    const root = makeValidRepo();
    writeFileSync(
      join(root, 'projects/ui/src/styles/button.css'),
      '.kui-button {\n  color: var(--kui-color-text);\n}\n',
    );

    expect(runStaticAudit(root)).toContain(
      'projects/ui/src/styles/button.css:2 reads --kui-color-text without a component token; use var(--kui-<component>-<part>-<property>, var(--kui-color-text))',
    );
  });

  it('accepts a colour role read as the default of a component token', () => {
    const root = makeValidRepo();
    writeFileSync(
      join(root, 'projects/ui/src/styles/button.css'),
      '.kui-button {\n  color: var(--kui-button-color, var(--kui-color-text, CanvasText));\n  border: 1px solid var(--kui-button-border, var(--kui-color-border-strong, var(--kui-color-border)));\n}\n',
    );

    expect(runStaticAudit(root)).toEqual([]);
  });

  it('reports every role in a chain that has no component token', () => {
    const root = makeValidRepo();
    writeFileSync(
      join(root, 'projects/ui/src/styles/button.css'),
      '.kui-button { color: var(--kui-color-text-secondary, var(--kui-color-text)); }\n',
    );

    expect(runStaticAudit(root)).toHaveLength(2);
  });

  it('allows the typography layer to read colour roles directly', () => {
    const root = makeValidRepo();
    writeFileSync(
      join(root, 'projects/ui/src/styles/typography.css'),
      '.kui-text-muted { color: var(--kui-color-text-secondary); }\n',
    );
    writeFileSync(
      join(root, 'projects/ui/src/styles/kikita-ui.css'),
      "@import './button.css';\n@import './typography.css';\n",
    );

    expect(runStaticAudit(root)).toEqual([]);
  });

  it('reports a component that defines a public token on its own element', () => {
    const root = makeValidRepo();
    writeFileSync(
      join(root, 'projects/ui/src/styles/button.css'),
      '.kui-button {\n  --kui-button-radius: 8px;\n  border-radius: var(--kui-button-radius);\n}\n',
    );

    expect(runStaticAudit(root)).toContain(
      'projects/ui/src/styles/button.css:2 defines the public token --kui-button-radius on a component; define a private --_kui-button-radius default and read var(--kui-button-radius, var(--_kui-button-radius))',
    );
  });

  it('accepts a private default behind a public token and parent-assigned tokens', () => {
    const root = makeValidRepo();
    writeFileSync(
      join(root, 'projects/ui/src/styles/button.css'),
      '.kui-button {\n  --_kui-button-radius: 8px;\n  border-radius: var(--kui-button-radius, var(--_kui-button-radius));\n}\n.kui-group { --kui-btn-height: 28px; }\n',
    );

    expect(runStaticAudit(root)).toEqual([]);
  });

  it('reports replacement Playground routes missing from state coverage', () => {
    const root = makeValidRepo();
    writeFileSync(join(root, playgroundRouteEnumPath), playgroundRouteEnum(['button', 'select']));

    expect(runStaticAudit(root)).toContain(
      '/components/select is missing from docs/state-coverage.md',
    );
  });

  it('fails instead of skipping route coverage when the route enum is missing', () => {
    const root = makeValidRepo();
    rmSync(join(root, playgroundRouteEnumPath));

    expect(runStaticAudit(root)).toContain(
      `${playgroundRouteEnumPath} is missing, so route coverage cannot be checked`,
    );
  });

  it('reports invalid skills and missing component docs', () => {
    const root = makeValidRepo();
    mkdirSync(join(root, '.agents', 'skills', 'BadSkill'), { recursive: true });
    writeFileSync(
      join(root, '.agents', 'skills', 'BadSkill', 'SKILL.md'),
      '---\nname: BadSkill\n---\n\n# Bad\n',
    );
    mkdirSync(join(root, 'projects/ui/src/lib/components/missing-doc'), { recursive: true });

    const failures = runStaticAudit(root);

    expect(failures).toEqual(
      expect.arrayContaining([
        '.agents/skills/BadSkill is not lowercase hyphen-case',
        'docs/missing-doc.md is missing for public primitive missing-doc',
        'projects/ui/src/lib/components/missing-doc has no unit spec',
      ]),
    );
  });

  it('allows native text and checks matching keys in scoped locale catalogues', () => {
    const root = makeValidRepo();
    const scopeDirectory = join(root, 'projects/kikita-ui-playground/public/i18n/button');
    const nativeText = String.fromCodePoint(0x041a, 0x043e, 0x043f, 0x043a, 0x0430);
    mkdirSync(scopeDirectory, { recursive: true });
    writeFileSync(join(scopeDirectory, 'en.json'), '{"title":"Button"}');
    writeFileSync(join(scopeDirectory, 'ru.json'), JSON.stringify({ title: nativeText }));

    expect(runStaticAudit(root)).toEqual([]);

    writeFileSync(join(scopeDirectory, 'ru.json'), JSON.stringify({ heading: nativeText }));

    expect(runStaticAudit(root)).toContain(
      'projects/kikita-ui-playground/public/i18n/button/ru.json does not have the same key paths as projects/kikita-ui-playground/public/i18n/button/en.json',
    );
  });

  it('reports internal context exports from public primitive barrels', () => {
    const root = makeValidRepo();
    writeFileSync(
      join(root, 'projects/ui/src/lib/components/button/index.ts'),
      "export { KUI_BUTTON_CONTEXT } from './kui-button-context.token';\n",
    );

    expect(runStaticAudit(root)).toEqual(
      expect.arrayContaining([
        'projects/ui/src/lib/components/button/index.ts exports an internal context token',
      ]),
    );
  });

  it('reports package barrel imports from library implementation files', () => {
    const root = makeValidRepo();
    writeFileSync(
      join(root, 'projects/ui/src/lib/components/button/kui-button.directive.ts'),
      "import { provideKikitaUi } from '@kikita-labs/ui';\n\n/** Button directive. */\nexport class KuiButtonDirective {}\n",
    );

    expect(runStaticAudit(root)).toEqual(
      expect.arrayContaining([
        'projects/ui/src/lib/components/button/kui-button.directive.ts imports @kikita-labs/ui from inside the library source',
      ]),
    );
  });
});

function makeValidRepo() {
  const root = mkdtempSync(join(tmpdir(), 'kui-audit-'));
  mkdirSync(join(root, '.agents', 'skills', 'kikita-ui-demo'), { recursive: true });
  mkdirSync(join(root, 'docs'), { recursive: true });
  mkdirSync(join(root, 'projects/ui/src/styles'), { recursive: true });
  mkdirSync(join(root, 'projects/ui/src/lib/components/button'), { recursive: true });
  mkdirSync(join(root, 'projects/kikita-ui-playground/src/app/enums'), { recursive: true });
  writeFileSync(join(root, 'AGENTS.md'), '- `.agents/workflow.md`\n');
  mkdirSync(join(root, '.agents'), { recursive: true });
  writeFileSync(join(root, '.agents', 'workflow.md'), '# Workflow\n');
  writeFileSync(
    join(root, '.agents', 'skills', 'kikita-ui-demo', 'SKILL.md'),
    '---\nname: kikita-ui-demo\ndescription: Demo skill.\n---\n\n# Demo\n',
  );
  writeFileSync(join(root, 'docs', 'button.md'), '# Button\n');
  writeFileSync(join(root, 'docs', 'state-coverage.md'), '| `/components/button` |\n');
  writeFileSync(join(root, 'projects/ui/src/styles/kikita-ui.css'), "@import './button.css';\n");
  writeFileSync(join(root, 'projects/ui/src/styles/button.css'), '.kui-button {}\n');
  writeFileSync(
    join(root, 'projects/ui/src/lib/components/button/kui-button.directive.ts'),
    '/** Button directive. */\nexport class KuiButtonDirective {}\n',
  );
  writeFileSync(
    join(root, 'projects/ui/src/lib/components/button/kui-button.directive.spec.ts'),
    "import { describe, it } from 'vitest';\n\ndescribe('button', () => { it('has a spec', () => {}); });\n",
  );
  writeFileSync(
    join(root, 'projects/ui/src/lib/components/button/index.ts'),
    "export { KuiButtonDirective } from './kui-button.directive';\n",
  );
  writeFileSync(join(root, playgroundRouteEnumPath), playgroundRouteEnum(['button']));
  return root;
}

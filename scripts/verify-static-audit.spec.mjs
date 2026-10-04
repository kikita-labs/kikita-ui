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

  it('reports a top-level initialiser call unless it is annotated pure or is an injection token', () => {
    const root = makeValidRepo();
    mkdirSync(join(root, 'projects/ui/src/lib/utils'), { recursive: true });
    writeFileSync(
      join(root, 'projects/ui/src/lib/utils/state.ts'),
      [
        'const TAGS = new Set(["a"]);',
        'export const RESOLVER = createResolver();',
        'const OK_SET = /* @__PURE__ */ new Set(["a"]);',
        'export const OK_TOKEN = new InjectionToken<string>("x");',
        'const inner = () => new Set(["a"]);',
        'function f() {',
        '  const local = new Set(["a"]);',
        '  return local;',
        '}',
        '',
      ].join('\n'),
    );

    expect(runStaticAudit(root)).toEqual([
      'projects/ui/src/lib/utils/state.ts:1 calls Set() at module level; annotate it /* @__PURE__ */ or initialise it lazily',
      'projects/ui/src/lib/utils/state.ts:2 calls createResolver() at module level; annotate it /* @__PURE__ */ or initialise it lazily',
    ]);
  });

  it('reports an inline template longer than three lines', () => {
    const root = makeValidRepo();
    mkdirSync(join(root, 'projects/ui/src/lib/utils'), { recursive: true });
    writeFileSync(
      join(root, 'projects/ui/src/lib/utils/inline-template.ts'),
      [
        '@Component({',
        '  template: `',
        '    <a></a>',
        '    <b></b>',
        '    <i></i>',
        '    <u></u>',
        '  `,',
        '})',
        'class Demo {}',
        '@Component({ template: `<a></a>` })',
        'class Short {}',
        '',
      ].join('\n'),
    );

    expect(runStaticAudit(root)).toEqual([
      'projects/ui/src/lib/utils/inline-template.ts:2 has an inline template of 4 lines; move it to a .html file (limit 3)',
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
    mkdirSync(join(root, 'projects/ui/src/lib/components/typography'), { recursive: true });
    writeFileSync(
      join(root, 'projects/ui/src/lib/components/typography/kui-text.directive.spec.ts'),
      'export {};\n',
    );
    writeFileSync(join(root, 'docs/typography.md'), '# Typography\n');
    writeFileSync(
      join(root, 'projects/ui/src/lib/components/typography/kui-typography.css'),
      '.kui-text-muted { color: var(--kui-color-text-secondary); }\n',
    );
    writeFileSync(
      join(root, 'projects/ui/src/styles/kikita-ui.css'),
      "@import './button.css';\n@import '../lib/components/typography/kui-typography.css';\n",
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
      "import { provideKikitaUi } from '@kikita-labs/ui';\n\n/** Button directive. */\nexport class KuiButton {}\n",
    );

    expect(runStaticAudit(root)).toEqual(
      expect.arrayContaining([
        'projects/ui/src/lib/components/button/kui-button.directive.ts imports @kikita-labs/ui from inside the library source',
      ]),
    );
  });
});

describe('verify-static-audit: library text', () => {
  function writeComponent(root, source) {
    writeFileSync(
      join(root, 'projects/ui/src/lib/components/button/kui-button.directive.ts'),
      `/** Button directive. */\n${source}\nexport class KuiButton {}\n`,
    );
  }

  it('reports a literal accessible name in a template', () => {
    const root = makeValidRepo();
    writeComponent(root, 'const template = \'<button aria-label="Close panel"></button>\';');

    expect(runStaticAudit(root)).toEqual(
      expect.arrayContaining([
        expect.stringContaining(
          'writes the literal text "Close panel" in an accessible or placeholder attribute',
        ),
      ]),
    );
  });

  it('reports a literal bound name, a Renderer2 name and a Renderer2 text node', () => {
    const root = makeValidRepo();
    writeComponent(
      root,
      [
        "const a = '<button [attr.aria-label]=\"\'Open menu\'\"></button>';",
        "renderer.setAttribute(btn, 'aria-label', 'Copy value');",
        "renderer.appendChild(btn, renderer.createText('Copy value'));",
      ].join('\n'),
    );

    const failures = runStaticAudit(root);

    expect(failures).toEqual(
      expect.arrayContaining([
        expect.stringContaining('"Open menu" in a bound attribute'),
        expect.stringContaining('"Copy value" in a Renderer2 attribute'),
        expect.stringContaining('"Copy value" in a Renderer2 text node'),
      ]),
    );
  });

  it('reports a literal word between tags', () => {
    const root = makeValidRepo();
    writeComponent(root, "const template = '<span>Queued</span>';");

    expect(runStaticAudit(root)).toEqual(
      expect.arrayContaining([expect.stringContaining('"Queued" in a template text node')]),
    );
  });

  it('accepts message reads, interpolations, generics and comments', () => {
    const root = makeValidRepo();
    writeComponent(
      root,
      [
        'const a = \'<button [attr.aria-label]="t().close"></button>\';',
        "const b = '<span>{{ t().queued }}</span>';",
        '// aria-label="Close panel" is described here',
        'let c: Observable<boolean>;',
      ].join('\n'),
    );

    expect(runStaticAudit(root)).toEqual([]);
  });
});

describe('verify-static-audit: message coverage', () => {
  function writeMessages(root, { interfaceBody, catalogue }) {
    mkdirSync(join(root, 'projects/ui/src/lib/i18n'), { recursive: true });
    mkdirSync(join(root, 'projects/kikita-ui-playground/public/i18n'), { recursive: true });
    writeFileSync(
      join(root, 'projects/ui/src/lib/i18n/kui-messages.interface.ts'),
      [
        '/** Button messages. */',
        'export interface KuiButtonMessages {',
        interfaceBody,
        '}',
        '',
        '/** All messages. */',
        'export interface KuiMessages {',
        '  /** Button. */',
        '  readonly button: KuiButtonMessages;',
        '}',
        '',
      ].join('\n'),
    );
    for (const language of ['en', 'ru']) {
      writeFileSync(
        join(root, `projects/kikita-ui-playground/public/i18n/${language}.json`),
        JSON.stringify({ kui: catalogue(language) }),
      );
    }
    writeFileSync(
      join(root, 'projects/ui/src/lib/components/button/kui-button.directive.ts'),
      '/** Button directive. */\nexport class KuiButton { readonly label = t().loadingLabel; }\n',
    );
  }

  const documented =
    '  /** Name while loading. Default `Loading`. */\n  readonly loadingLabel: string;';

  it('accepts documented, read and translated messages', () => {
    const root = makeValidRepo();
    writeMessages(root, {
      interfaceBody: documented,
      catalogue: () => ({ button: { loadingLabel: 'x' } }),
    });

    expect(runStaticAudit(root)).toEqual([]);
  });

  it('reports a message that has no JSDoc', () => {
    const root = makeValidRepo();
    writeMessages(root, {
      interfaceBody: '  readonly loadingLabel: string;',
      catalogue: () => ({ button: { loadingLabel: 'x' } }),
    });

    expect(runStaticAudit(root)).toContain(
      'KuiMessages.button.loadingLabel has no JSDoc with its English default',
    );
  });

  it('reports a message that no component reads', () => {
    const root = makeValidRepo();
    writeMessages(root, {
      interfaceBody: `${documented}\n  /** Unused. Default \`x\`. */\n  readonly neverRead: string;`,
      catalogue: () => ({ button: { loadingLabel: 'x', neverRead: 'y' } }),
    });

    expect(runStaticAudit(root)).toContain(
      'KuiMessages.button.neverRead is not read by any component',
    );
  });

  it('reports a Playground catalogue that misses or adds a key', () => {
    const root = makeValidRepo();
    writeMessages(root, {
      interfaceBody: documented,
      catalogue: (language) =>
        language === 'ru'
          ? { button: { loadingLabel: 'x', extra: 'y' }, other: {} }
          : { button: {} },
    });

    const failures = runStaticAudit(root);

    expect(failures).toEqual(
      expect.arrayContaining([
        expect.stringContaining('ru.json kui.button must hold exactly the library keys'),
        expect.stringContaining('en.json kui.button must hold exactly the library keys'),
        'ru.json kui.other is not a library message group',
      ]),
    );
  });
});

describe('verify-static-audit: Signal Forms control member names', () => {
  function writeControl(root, members, implementsClause = 'implements FormValueControl<string>') {
    writeFileSync(
      join(root, 'projects/ui/src/lib/components/button/kui-code.component.ts'),
      [
        '/** Code control. */',
        `export class KuiCode ${implementsClause} {`,
        ...members.map((member) => `  ${member}`),
        '}',
        '',
      ].join('\n'),
    );
  }

  it('reports an input that differs from a contract member only by case', () => {
    const root = makeValidRepo();
    writeControl(root, ["readonly value = model('');", 'readonly readOnly = input(false);']);

    expect(runStaticAudit(root)).toContain(
      'projects/ui/src/lib/components/button/kui-code.component.ts declares readOnly, which Signal Forms binds only as readonly',
    );
  });

  it('reports a near miss on an output and a model', () => {
    const root = makeValidRepo();
    writeControl(root, ["readonly Value = model('');", 'readonly Touch = output<void>();']);

    const failures = runStaticAudit(root);

    expect(failures).toContain(
      'projects/ui/src/lib/components/button/kui-code.component.ts declares Value, which Signal Forms binds only as value',
    );
    expect(failures).toContain(
      'projects/ui/src/lib/components/button/kui-code.component.ts declares Touch, which Signal Forms binds only as touch',
    );
  });

  it('accepts exact member names and unrelated members', () => {
    const root = makeValidRepo();
    writeControl(root, [
      "readonly value = model('');",
      'readonly readonly = input(false);',
      'readonly maxLength = input<number | undefined>();',
      'readonly autoFocus = input(false);',
    ]);

    expect(runStaticAudit(root)).toEqual([]);
  });

  it('ignores classes that do not implement a Signal Forms contract', () => {
    const root = makeValidRepo();
    writeControl(root, ['readonly readOnly = input(false);'], '');

    expect(runStaticAudit(root)).toEqual([]);
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
    '/** Button directive. */\nexport class KuiButton {}\n',
  );
  writeFileSync(
    join(root, 'projects/ui/src/lib/components/button/kui-button.directive.spec.ts'),
    "import { describe, it } from 'vitest';\n\ndescribe('button', () => { it('has a spec', () => {}); });\n",
  );
  writeFileSync(
    join(root, 'projects/ui/src/lib/components/button/index.ts'),
    "export { KuiButton } from './kui-button.directive';\n",
  );
  writeFileSync(join(root, playgroundRouteEnumPath), playgroundRouteEnum(['button']));
  return root;
}

describe('verify-static-audit: class and file naming', () => {
  function writeSource(root, path, source) {
    mkdirSync(join(root, path, '..'), { recursive: true });
    writeFileSync(join(root, path), source);
  }

  it('reports a class that keeps a Component, Directive or Service suffix', () => {
    const root = makeValidRepo();
    writeSource(
      root,
      'projects/ui/src/lib/components/button/kui-old.ts',
      '/** Old. */\nexport class KuiOldDirective {}\n',
    );
    writeSource(
      root,
      'projects/kikita-ui-playground/src/app/data.ts',
      'export class DataService {}\n',
    );

    const failures = runStaticAudit(root);

    expect(failures).toContain(
      'projects/ui/src/lib/components/button/kui-old.ts declares class KuiOldDirective; Angular classes carry no Component, Directive or Service suffix',
    );
    expect(failures).toContain(
      'projects/kikita-ui-playground/src/app/data.ts declares class DataService; Angular classes carry no Component, Directive or Service suffix',
    );
  });

  it('accepts suffix-free classes and spec test hosts', () => {
    const root = makeValidRepo();
    writeSource(
      root,
      'projects/ui/src/lib/components/button/kui-new.ts',
      '/** New. */\nexport class KuiNew {}\n',
    );
    writeSource(
      root,
      'projects/ui/src/lib/components/button/kui-new.spec.ts',
      'class HostComponent {}\n',
    );

    expect(runStaticAudit(root).filter((failure) => failure.includes('declares'))).toEqual([]);
  });
});

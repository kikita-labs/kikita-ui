import { createKuiTheme, createKuiThemeStyleSheet } from './create-kui-theme';
import { DEFAULT_KUI_THEME } from './default-kui-theme.const';
import type { KuiThemeContrast } from './kui-theme-contrast.type';
import { KUI_CONTRAST_PROFILES } from './semantic/kui-theme-contrast-profiles';

function themeWith(contrast?: KuiThemeContrast) {
  return createKuiTheme({ ...DEFAULT_KUI_THEME, contrast });
}

function changedVariables(a: Record<string, string>, b: Record<string, string>): string[] {
  return Object.keys(a).filter((name) => a[name] !== b[name]);
}

/*
 * Contrast profiles re-point neutral roles and nothing else. The default profile is what the theme
 * declares directly; every other profile is emitted as the variables it changes, behind the
 * `data-kui-contrast` attribute and, where the profile has one, a media query.
 */
describe('contrast profiles', () => {
  it('uses strict when no profile is requested', () => {
    expect(themeWith().light).toEqual(themeWith('strict').light);
    expect(themeWith().light['--kui-color-border-control']).toBe('var(--kui-neutral-10)');
  });

  it('changes only the roles the soft profile lists', () => {
    const strict = themeWith('strict');
    const soft = themeWith('soft');
    const listed = Object.keys(KUI_CONTRAST_PROFILES.soft.steps)
      .map((role) => `--kui-color-${role}`)
      .sort();

    expect(changedVariables(strict.light, soft.light).sort()).toEqual(listed);
    expect(changedVariables(strict.dark, soft.dark).sort()).toEqual(listed);
    expect(soft.light['--kui-color-border-control']).toBe('var(--kui-neutral-6)');
  });

  it('keeps text and focus identical in every profile', () => {
    const strict = themeWith('strict');
    const soft = themeWith('soft');

    for (const name of [
      '--kui-color-text',
      '--kui-color-text-secondary',
      '--kui-color-text-placeholder',
      '--kui-color-focus',
    ] as const) {
      expect(soft.light[name]).toBe(strict.light[name]);
      expect(soft.dark[name]).toBe(strict.dark[name]);
    }
  });

  it('emits the other profiles as attribute rules that win in both modes', () => {
    const css = createKuiThemeStyleSheet(themeWith('strict'));

    expect(css).toContain(
      ':root[data-kui-contrast="soft"], [data-kui-theme="light"][data-kui-contrast="soft"] {',
    );
    expect(css).toContain('[data-kui-theme="dark"][data-kui-contrast="soft"] {');
    expect(css.indexOf('[data-kui-theme="dark"][data-kui-contrast="soft"]')).toBeGreaterThan(
      css.indexOf(':root[data-kui-contrast="soft"]'),
    );
    expect(css).not.toContain('prefers-contrast');
  });

  it('applies strict from the system preference when soft is the default', () => {
    const css = createKuiThemeStyleSheet(themeWith('soft'));

    expect(css).toContain('@media (prefers-contrast: more) {');
    expect(css).toContain(':root:not([data-kui-contrast]) {');
    expect(css).toContain('[data-kui-theme="dark"]:not([data-kui-contrast]) {');
    expect(css).toContain('--kui-color-border-control: var(--kui-neutral-10);');
  });
});

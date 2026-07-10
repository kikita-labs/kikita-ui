import { DEFAULT_KUI_THEME } from './default-kui-theme.const';
import {
  createKuiTheme,
  createKuiThemeStyleSheet,
  createKuiThemeVariableMap,
} from './create-kui-theme';

describe('createKuiTheme', () => {
  it('generates seed, palette, semantic, and component variables from the default theme', () => {
    const theme = createKuiTheme(DEFAULT_KUI_THEME);

    expect(theme.seeds['--kui-seed-primary']).toBe('oklch(0.52 0.25 285)');
    expect(theme.palettes.primary).toHaveLength(12);
    expect(theme.palettes.primary[5]).toBe('oklch(0.52 0.25 285)');
    expect(theme.paletteVariables['--kui-primary-6']).toBe('oklch(0.52 0.25 285)');
    expect(theme.light['--kui-color-bg']).toBe('oklch(0.97 0.01 80)');
    expect(theme.light['--kui-color-surface-sunken']).toBe('oklch(0.95 0.01 80)');
    expect(theme.light['--kui-color-primary-fill']).toBe('var(--kui-primary-6)');
    expect(theme.dark['--kui-color-surface']).toBe('oklch(0.14 0.01 80)');
    expect(theme.dark['--kui-color-surface-elevated']).toBe('oklch(0.18 0.01 80)');
    expect(theme.dark['--kui-color-surface-sunken']).toBe('oklch(0.08 0.01 80)');
    expect(theme.dark['--kui-color-primary-fill']).toBe('var(--kui-primary-5)');
    expect(theme.dark['--kui-color-primary-fill-active']).toBe('var(--kui-primary-6)');
    expect(theme.dark['--kui-color-primary-soft-bg-active']).toBe('var(--kui-primary-9)');
    expect(theme.dark['--kui-color-success-soft-bg']).toBe('var(--kui-success-11)');
    expect(theme.dark['--kui-color-info-soft-bg']).toBe('var(--kui-info-11)');
    expect(theme.light['--kui-color-danger-fill-hover']).toBe('var(--kui-danger-7)');
    expect(theme.dark['--kui-color-danger-fill-active']).toBe('var(--kui-danger-6)');
    expect(theme.component['--kui-btn-solid-bg']).toBe('var(--kui-color-primary-fill)');
    expect(theme.component['--kui-btn-danger-bg-hov']).toBe('var(--kui-color-danger-fill-hover)');
    expect(theme.component['--kui-btn-ghost-bg-hov']).toBe('var(--kui-color-surface-sunken)');
    expect(theme.component['--kui-btn-height']).toBe('var(--kui-btn-height-regular)');
    expect(theme.component['--kui-input-height']).toBe('var(--kui-control-height-md)');
    expect(theme.component['--kui-btn-bg']).toBe('var(--kui-btn-solid-bg)');
    expect(theme.component['--kui-seg-padding']).toBe('2px');
    expect(theme.component['--kui-badge-info-bg']).toBe('var(--kui-color-info-soft-bg)');
    expect(theme.component['--kui-card-shadow-elevated']).toBe('0 10px 28px oklch(0 0 0 / 0.18)');
    expect(theme.component['--kui-card-shadow-sunken']).toBe('none');
    expect(theme.component['--kui-avatar-size-2xl']).toBe('64px');
    expect(theme.light['--kui-avatar-p1-bg']).toBe('oklch(0.87 0.08 285)');
    expect(theme.dark['--kui-avatar-p1-bg']).toBe('oklch(0.28 0.16 285)');
  });

  it('emits a mode-specific flat CSS variable map', () => {
    const theme = createKuiTheme(DEFAULT_KUI_THEME);

    const lightVariables = createKuiThemeVariableMap(theme, 'light');
    const darkVariables = createKuiThemeVariableMap(theme, 'dark');

    expect(lightVariables['--kui-color-bg']).toBe('oklch(0.97 0.01 80)');
    expect(darkVariables['--kui-color-bg']).toBe('oklch(0.10 0.01 80)');
    expect(lightVariables['--kui-avatar-p1-bg']).toBe('oklch(0.87 0.08 285)');
    expect(darkVariables['--kui-avatar-p1-bg']).toBe('oklch(0.28 0.16 285)');
    expect(lightVariables['--kui-input-focus-ring']).toBe(
      '0 0 0 3px var(--kui-color-primary-focus-ring)',
    );
  });

  it('serializes light and dark theme selectors into one stylesheet', () => {
    const theme = createKuiTheme(DEFAULT_KUI_THEME);

    const stylesheet = createKuiThemeStyleSheet(theme);

    expect(stylesheet).toContain(':root, [data-kui-theme="light"]');
    expect(stylesheet).toContain('[data-kui-theme="dark"]');
    expect(stylesheet).toContain('--kui-seed-info: oklch(0.58 0.16 215);');
    expect(stylesheet).toContain('--kui-btn-height: var(--kui-btn-height-regular);');
  });

  it('accepts hex seed colors for custom themes', () => {
    const theme = createKuiTheme({
      seeds: {
        color: {
          primary: '#5865f2',
          neutral: '#737782',
          success: '#22c55e',
          warning: '#f59e0b',
          danger: '#ef4444',
        },
        radius: 10,
        density: 'compact',
      },
    });

    expect(theme.palettes.primary).toHaveLength(12);
    expect(theme.palettes.primary[5]).toMatch(/^oklch\(/);
    expect(theme.component['--kui-radius-md']).toBe('10px');
    expect(theme.component['--kui-btn-height']).toBe('var(--kui-btn-height-compact)');
    expect(theme.seeds['--kui-seed-info']).toBe('oklch(0.58 0.16 215)');
  });
});

import {
  DEFAULT_KUI_THEME,
  KuiColorScaleName,
  KuiGeneratedTheme,
  KuiThemeMode,
  createKuiThemeCssText,
  createKuiThemeVariableMap,
} from '@kikita-labs/ui';

export interface SeedRow {
  readonly name: string;
  readonly token: `--kui-seed-${KuiColorScaleName}`;
  readonly value: string;
  readonly purpose: string;
}

export interface PaletteRow {
  readonly name: string;
  readonly token: `--kui-${KuiColorScaleName}-*`;
  readonly stops: readonly string[];
}

export interface VariableRow {
  readonly token: string;
  readonly value: string;
}

export const COLOR_ORDER: readonly KuiColorScaleName[] = [
  'primary',
  'neutral',
  'success',
  'warning',
  'danger',
  'info',
];

export const COLOR_LABELS: Readonly<Record<KuiColorScaleName, string>> = {
  primary: 'Primary',
  neutral: 'Neutral',
  success: 'Success',
  warning: 'Warning',
  danger: 'Danger',
  info: 'Info',
};

export const COLOR_PURPOSES: Readonly<Record<KuiColorScaleName, string>> = {
  primary: 'Brand action',
  neutral: 'Surfaces and text',
  success: 'Positive state',
  warning: 'Caution state',
  danger: 'Error state',
  info: 'Informational state',
};

export const DEFAULT_COLOR_SEEDS: Readonly<Record<KuiColorScaleName, string>> = {
  primary: DEFAULT_KUI_THEME.seeds.color.primary,
  neutral: DEFAULT_KUI_THEME.seeds.color.neutral,
  success: DEFAULT_KUI_THEME.seeds.color.success,
  warning: DEFAULT_KUI_THEME.seeds.color.warning,
  danger: DEFAULT_KUI_THEME.seeds.color.danger,
  info: DEFAULT_KUI_THEME.seeds.color.info ?? 'oklch(0.58 0.16 215)',
};

export const SEMANTIC_KEYS: readonly `--kui-${string}`[] = [
  '--kui-color-bg',
  '--kui-color-surface',
  '--kui-color-surface-elevated',
  '--kui-color-surface-sunken',
  '--kui-color-border',
  '--kui-color-text',
  '--kui-color-text-secondary',
  '--kui-color-primary-fill',
  '--kui-color-primary-fill-hover',
  '--kui-color-primary-fill-active',
  '--kui-color-primary-focus-ring',
  '--kui-color-primary-soft-bg',
  '--kui-color-primary-soft-bg-hover',
  '--kui-color-primary-soft-bg-active',
  '--kui-color-danger-fill',
  '--kui-color-success-fill',
  '--kui-btn-solid-bg',
  '--kui-btn-solid-bg-hov',
  '--kui-btn-solid-bg-act',
  '--kui-input-bg',
  '--kui-input-border',
  '--kui-input-focus-ring',
];

export function createSeedRows(): readonly SeedRow[] {
  return COLOR_ORDER.map((name) => ({
    name: COLOR_LABELS[name],
    token: `--kui-seed-${name}`,
    value: DEFAULT_COLOR_SEEDS[name],
    purpose: COLOR_PURPOSES[name],
  }));
}

export function createPaletteRows(theme: KuiGeneratedTheme): readonly PaletteRow[] {
  return COLOR_ORDER.map((name) => ({
    name: COLOR_LABELS[name],
    token: `--kui-${name}-*`,
    stops: theme.palettes[name],
  }));
}

export function createSemanticRows(
  theme: KuiGeneratedTheme,
  mode: KuiThemeMode,
): readonly VariableRow[] {
  const variables = createKuiThemeVariableMap(theme, mode);

  return SEMANTIC_KEYS.map((token) => ({
    token,
    value: variables[token],
  }));
}

export function createPreviewStyle(theme: KuiGeneratedTheme, mode: KuiThemeMode): string {
  const variables = createKuiThemeVariableMap(theme, mode);

  return Object.entries(variables)
    .map(([name, value]) => `${name}: ${value}`)
    .join('; ');
}

export function createCssText(theme: KuiGeneratedTheme, mode: KuiThemeMode): string {
  const selector = mode === 'light' ? ':root' : '[data-kui-theme="dark"]';

  return createKuiThemeCssText(theme, selector, mode);
}

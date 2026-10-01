import { DEFAULT_KUI_THEME } from './default-kui-theme.const';
import type { KuiOklchColor } from './kui-theme-color.interface';
import type { KuiThemeMode } from './kui-theme-mode.type';
import type { KuiThemeOptions } from './kui-theme-options.interface';
import type {
  KuiColorScaleName,
  KuiCssVariableMap,
  KuiGeneratedTheme,
  KuiPaletteMap,
} from './kui-theme-tokens.interface';

const LIGHTNESS_STOPS = [
  0.97,
  0.93,
  0.87,
  0.78,
  0.67,
  null,
  0.42,
  0.32,
  0.23,
  0.16,
  0.12,
  0.08,
] as const;
const CHROMA_SCALE = [0.08, 0.15, 0.35, 0.6, 0.85, 1, 0.9, 0.75, 0.55, 0.35, 0.22, 0.12] as const;
const SCALE_NAMES: readonly KuiColorScaleName[] = [
  'primary',
  'neutral',
  'success',
  'warning',
  'danger',
  'info',
];
const FALLBACK_INFO_SEED = 'oklch(0.58 0.16 215)';

/** Creates a generated Kikita UI theme from seed tokens. */
export function createKuiTheme(options: KuiThemeOptions = DEFAULT_KUI_THEME): KuiGeneratedTheme {
  const colorSeeds = options.seeds.color;
  const parsedSeeds: Record<KuiColorScaleName, KuiOklchColor> = {
    primary: parseKuiColor(colorSeeds.primary),
    neutral: parseKuiColor(colorSeeds.neutral),
    success: parseKuiColor(colorSeeds.success),
    warning: parseKuiColor(colorSeeds.warning),
    danger: parseKuiColor(colorSeeds.danger),
    info: parseKuiColor(colorSeeds.info ?? FALLBACK_INFO_SEED),
  };

  const palettes = Object.fromEntries(
    SCALE_NAMES.map((scaleName) => [scaleName, createPalette(parsedSeeds[scaleName])]),
  ) as KuiPaletteMap;

  return {
    seeds: createSeedVariables(parsedSeeds),
    palettes,
    paletteVariables: createPaletteVariables(palettes),
    light: createLightSemanticVariables(parsedSeeds),
    dark: createDarkSemanticVariables(parsedSeeds),
    component: createComponentVariables(options),
  };
}

/** Converts a generated theme into a flat CSS variable map for the requested mode. */
export function createKuiThemeVariableMap(
  theme: KuiGeneratedTheme,
  mode: KuiThemeMode = 'light',
): KuiCssVariableMap {
  return {
    ...theme.seeds,
    ...theme.paletteVariables,
    ...(mode === 'light' ? theme.light : theme.dark),
    ...theme.component,
  };
}

/** Serializes CSS variables for a selector. */
export function createKuiThemeCssText(
  theme: KuiGeneratedTheme,
  selector: string,
  mode: KuiThemeMode = 'light',
): string {
  const variables = createKuiThemeVariableMap(theme, mode);
  const declarations = Object.entries(variables)
    .map(([name, value]) => `  ${name}: ${value};`)
    .join('\n');

  return `${selector} {\n${declarations}\n}`;
}

/** Serializes both default light and attribute-driven dark theme CSS. */
export function createKuiThemeStyleSheet(theme: KuiGeneratedTheme): string {
  return [
    createKuiThemeCssText(theme, ':root, [data-kui-theme="light"]', 'light'),
    createKuiThemeCssText(theme, '[data-kui-theme="dark"]', 'dark'),
  ].join('\n\n');
}

function createPalette(seed: KuiOklchColor): readonly string[] {
  return LIGHTNESS_STOPS.map((lightness, index) =>
    formatOklch({
      lightness: lightness ?? seed.lightness,
      chroma: seed.chroma * CHROMA_SCALE[index],
      hue: seed.hue,
    }),
  );
}

function createSeedVariables(seeds: Record<KuiColorScaleName, KuiOklchColor>): KuiCssVariableMap {
  return Object.fromEntries(
    SCALE_NAMES.map((scaleName) => [`--kui-seed-${scaleName}`, formatOklch(seeds[scaleName])]),
  );
}

function createPaletteVariables(palettes: KuiPaletteMap): KuiCssVariableMap {
  return Object.fromEntries(
    SCALE_NAMES.flatMap((scaleName) =>
      palettes[scaleName].map((value, index) => [`--kui-${scaleName}-${index + 1}`, value]),
    ),
  );
}

function createLightSemanticVariables(
  seeds: Record<KuiColorScaleName, KuiOklchColor>,
): KuiCssVariableMap {
  return {
    '--kui-color-bg': 'oklch(0.97 0.01 80)',
    '--kui-color-surface': 'oklch(1 0 0)',
    '--kui-color-surface-elevated': 'oklch(0.99 0.005 80)',
    '--kui-color-surface-sunken': 'oklch(0.95 0.01 80)',
    '--kui-color-border-subtle': 'oklch(0.92 0.008 80)',
    '--kui-color-border': 'oklch(0.88 0.01 80)',
    '--kui-color-border-strong': 'oklch(0.75 0.015 80)',
    '--kui-color-text': 'oklch(0.18 0.01 80)',
    '--kui-color-text-secondary': 'oklch(0.46 0.01 80)',
    '--kui-color-text-disabled': 'oklch(0.70 0.01 80)',
    '--kui-color-primary-fill': 'var(--kui-primary-6)',
    '--kui-color-primary-fill-hover': 'var(--kui-primary-7)',
    '--kui-color-primary-fill-active': 'var(--kui-primary-8)',
    '--kui-color-primary-soft-bg': 'var(--kui-primary-1)',
    '--kui-color-primary-soft-bg-hover': 'var(--kui-primary-2)',
    '--kui-color-primary-soft-bg-active': 'var(--kui-primary-3)',
    '--kui-color-primary-soft-text': 'var(--kui-primary-8)',
    '--kui-color-primary-focus-ring': formatOklch({ ...seeds.primary, alpha: 0.4 }),
    '--kui-color-success-fill': 'var(--kui-success-6)',
    '--kui-color-success-fill-hover': 'var(--kui-success-4)',
    '--kui-color-success-fill-active': 'var(--kui-success-6)',
    '--kui-color-success-soft-bg': 'var(--kui-success-1)',
    '--kui-color-success-soft-text': 'var(--kui-success-8)',
    '--kui-color-success-soft-border': 'var(--kui-success-4)',
    '--kui-color-warning-fill': 'var(--kui-warning-6)',
    '--kui-color-warning-fill-hover': 'var(--kui-warning-4)',
    '--kui-color-warning-fill-active': 'var(--kui-warning-7)',
    '--kui-color-warning-soft-bg': 'var(--kui-warning-1)',
    '--kui-color-warning-soft-text': 'var(--kui-warning-8)',
    '--kui-color-warning-soft-border': 'var(--kui-warning-4)',
    '--kui-color-danger-fill': 'var(--kui-danger-6)',
    '--kui-color-danger-fill-hover': 'var(--kui-danger-7)',
    '--kui-color-danger-fill-active': 'var(--kui-danger-8)',
    '--kui-color-danger-soft-bg': 'var(--kui-danger-1)',
    '--kui-color-danger-soft-bg-hover': 'var(--kui-danger-2)',
    '--kui-color-danger-soft-bg-active': 'var(--kui-danger-3)',
    '--kui-color-danger-soft-text': 'var(--kui-danger-8)',
    '--kui-color-danger-soft-border': 'var(--kui-danger-4)',
    '--kui-color-info-fill': 'var(--kui-info-6)',
    '--kui-color-info-soft-bg': 'var(--kui-info-1)',
    '--kui-color-info-soft-text': 'var(--kui-info-8)',
    '--kui-color-info-soft-border': 'var(--kui-info-4)',
    '--kui-color-skeleton-bg': 'oklch(0.90 0.01 80)',
    '--kui-color-skeleton-highlight': 'oklch(0.955 0.005 80)',
    '--kui-color-scrollbar-thumb': 'oklch(0.78 0.01 80)',
    '--kui-color-scrollbar-thumb-hover': 'oklch(0.66 0.01 80)',
    '--kui-color-scrollbar-thumb-active': 'oklch(0.60 0.01 80)',
    '--kui-avatar-p1-bg': 'oklch(0.87 0.08 285)',
    '--kui-avatar-p1-fg': 'oklch(0.25 0.14 285)',
    '--kui-avatar-p2-bg': 'oklch(0.87 0.07 15)',
    '--kui-avatar-p2-fg': 'oklch(0.25 0.12 15)',
    '--kui-avatar-p3-bg': 'oklch(0.87 0.09 55)',
    '--kui-avatar-p3-fg': 'oklch(0.28 0.09 55)',
    '--kui-avatar-p4-bg': 'oklch(0.87 0.08 145)',
    '--kui-avatar-p4-fg': 'oklch(0.25 0.09 145)',
    '--kui-avatar-p5-bg': 'oklch(0.87 0.07 185)',
    '--kui-avatar-p5-fg': 'oklch(0.25 0.09 185)',
    '--kui-avatar-p6-bg': 'oklch(0.87 0.07 220)',
    '--kui-avatar-p6-fg': 'oklch(0.25 0.11 220)',
    '--kui-avatar-p7-bg': 'oklch(0.87 0.08 260)',
    '--kui-avatar-p7-fg': 'oklch(0.25 0.13 260)',
    '--kui-chart-series-1': 'oklch(0.56 0.18 285)',
    '--kui-chart-series-2': 'oklch(0.55 0.11 190)',
    '--kui-chart-series-3': 'oklch(0.58 0.17 25)',
    '--kui-chart-series-4': 'oklch(0.55 0.13 145)',
    '--kui-chart-series-5': 'oklch(0.58 0.18 350)',
    '--kui-chart-series-6': 'oklch(0.62 0.15 75)',
    '--kui-chart-series-7': 'oklch(0.54 0.14 215)',
    '--kui-chart-series-8': 'oklch(0.64 0.15 55)',
    '--kui-chart-grid-color': 'var(--kui-color-border)',
    '--kui-chart-axis-label-color': 'var(--kui-color-text-secondary)',
    '--kui-chart-tooltip-bg': 'var(--kui-color-surface-elevated)',
    '--kui-chart-tooltip-text': 'var(--kui-color-text)',
    '--kui-chart-tooltip-border': 'var(--kui-color-border)',
  };
}

function createDarkSemanticVariables(
  seeds: Record<KuiColorScaleName, KuiOklchColor>,
): KuiCssVariableMap {
  return {
    '--kui-color-bg': 'oklch(0.10 0.01 80)',
    '--kui-color-surface': 'oklch(0.14 0.01 80)',
    '--kui-color-surface-elevated': 'oklch(0.18 0.01 80)',
    '--kui-color-surface-sunken': 'oklch(0.08 0.01 80)',
    '--kui-color-border-subtle': 'oklch(0.18 0.01 80)',
    '--kui-color-border': 'oklch(0.22 0.01 80)',
    '--kui-color-border-strong': 'oklch(0.32 0.01 80)',
    '--kui-color-text': 'oklch(0.93 0.01 80)',
    '--kui-color-text-secondary': 'oklch(0.60 0.01 80)',
    '--kui-color-text-disabled': 'oklch(0.35 0.01 80)',
    '--kui-color-primary-fill': 'var(--kui-primary-5)',
    '--kui-color-primary-fill-hover': 'var(--kui-primary-4)',
    '--kui-color-primary-fill-active': 'var(--kui-primary-6)',
    '--kui-color-primary-soft-bg': 'var(--kui-primary-11)',
    '--kui-color-primary-soft-bg-hover': 'var(--kui-primary-10)',
    '--kui-color-primary-soft-bg-active': 'var(--kui-primary-9)',
    '--kui-color-primary-soft-text': 'var(--kui-primary-4)',
    '--kui-color-primary-focus-ring': formatOklch({
      ...seeds.primary,
      lightness: 0.65,
      chroma: seeds.primary.chroma * 0.88,
      alpha: 0.5,
    }),
    '--kui-color-success-fill': 'var(--kui-success-5)',
    '--kui-color-success-fill-hover': 'var(--kui-success-4)',
    '--kui-color-success-fill-active': 'var(--kui-success-6)',
    '--kui-color-success-soft-bg': 'var(--kui-success-11)',
    '--kui-color-success-soft-text': 'var(--kui-success-4)',
    '--kui-color-success-soft-border': 'var(--kui-success-8)',
    '--kui-color-warning-fill': 'var(--kui-warning-5)',
    '--kui-color-warning-fill-hover': 'var(--kui-warning-4)',
    '--kui-color-warning-fill-active': 'var(--kui-warning-7)',
    '--kui-color-warning-soft-bg': 'var(--kui-warning-11)',
    '--kui-color-warning-soft-text': 'var(--kui-warning-4)',
    '--kui-color-warning-soft-border': 'var(--kui-warning-8)',
    '--kui-color-danger-fill': 'var(--kui-danger-5)',
    '--kui-color-danger-fill-hover': 'var(--kui-danger-4)',
    '--kui-color-danger-fill-active': 'var(--kui-danger-6)',
    '--kui-color-danger-soft-bg': 'var(--kui-danger-11)',
    '--kui-color-danger-soft-bg-hover': 'var(--kui-danger-10)',
    '--kui-color-danger-soft-bg-active': 'var(--kui-danger-9)',
    '--kui-color-danger-soft-text': 'var(--kui-danger-4)',
    '--kui-color-danger-soft-border': 'var(--kui-danger-8)',
    '--kui-color-info-fill': 'var(--kui-info-5)',
    '--kui-color-info-soft-bg': 'var(--kui-info-11)',
    '--kui-color-info-soft-text': 'var(--kui-info-4)',
    '--kui-color-info-soft-border': 'var(--kui-info-8)',
    '--kui-color-skeleton-bg': 'oklch(0.20 0.01 80)',
    '--kui-color-skeleton-highlight': 'oklch(0.27 0.012 80)',
    '--kui-color-scrollbar-thumb': 'oklch(0.32 0.01 80)',
    '--kui-color-scrollbar-thumb-hover': 'oklch(0.42 0.01 80)',
    '--kui-color-scrollbar-thumb-active': 'oklch(0.48 0.01 80)',
    '--kui-avatar-p1-bg': 'oklch(0.28 0.16 285)',
    '--kui-avatar-p1-fg': 'oklch(0.87 0.08 285)',
    '--kui-avatar-p2-bg': 'oklch(0.28 0.14 15)',
    '--kui-avatar-p2-fg': 'oklch(0.87 0.07 15)',
    '--kui-avatar-p3-bg': 'oklch(0.30 0.10 55)',
    '--kui-avatar-p3-fg': 'oklch(0.87 0.09 55)',
    '--kui-avatar-p4-bg': 'oklch(0.28 0.10 145)',
    '--kui-avatar-p4-fg': 'oklch(0.87 0.08 145)',
    '--kui-avatar-p5-bg': 'oklch(0.28 0.10 185)',
    '--kui-avatar-p5-fg': 'oklch(0.87 0.07 185)',
    '--kui-avatar-p6-bg': 'oklch(0.28 0.12 220)',
    '--kui-avatar-p6-fg': 'oklch(0.87 0.07 220)',
    '--kui-avatar-p7-bg': 'oklch(0.28 0.14 260)',
    '--kui-avatar-p7-fg': 'oklch(0.87 0.08 260)',
    '--kui-chart-series-1': 'oklch(0.72 0.17 285)',
    '--kui-chart-series-2': 'oklch(0.72 0.13 190)',
    '--kui-chart-series-3': 'oklch(0.72 0.16 25)',
    '--kui-chart-series-4': 'oklch(0.72 0.15 145)',
    '--kui-chart-series-5': 'oklch(0.72 0.17 350)',
    '--kui-chart-series-6': 'oklch(0.75 0.15 75)',
    '--kui-chart-series-7': 'oklch(0.70 0.13 215)',
    '--kui-chart-series-8': 'oklch(0.78 0.15 55)',
    '--kui-chart-grid-color': 'var(--kui-color-border)',
    '--kui-chart-axis-label-color': 'var(--kui-color-text-secondary)',
    '--kui-chart-tooltip-bg': 'var(--kui-color-surface-elevated)',
    '--kui-chart-tooltip-text': 'var(--kui-color-text)',
    '--kui-chart-tooltip-border': 'var(--kui-color-border)',
  };
}

function createComponentVariables(options: KuiThemeOptions): KuiCssVariableMap {
  const radius = `${options.seeds.radius}px`;
  const density = options.seeds.density;

  return {
    '--kui-font-sans':
      'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    '--kui-font-mono': 'ui-monospace, "SFMono-Regular", Consolas, "Liberation Mono", monospace',
    '--kui-radius-none': '0',
    '--kui-radius-xs': `${Math.max(2, options.seeds.radius - 4)}px`,
    '--kui-radius-sm': `${Math.max(4, options.seeds.radius - 2)}px`,
    '--kui-radius-md': radius,
    '--kui-radius-lg': `${options.seeds.radius + 2}px`,
    '--kui-radius-xl': `${options.seeds.radius + 6}px`,
    '--kui-radius-full': '9999px',
    '--kui-color-on-fill': 'oklch(1 0 0)',
    '--kui-border-width-hairline': '1px',
    '--kui-border-width-thick': '1.5px',
    '--kui-space-1': '4px',
    '--kui-space-2': '8px',
    '--kui-space-3': '12px',
    '--kui-space-4': '16px',
    '--kui-space-5': '20px',
    '--kui-space-6': '24px',
    '--kui-space-8': '32px',
    '--kui-space-12': '48px',
    '--kui-space-16': '64px',
    '--kui-text-2xs-size': '9px',
    '--kui-text-xs-size': '11px',
    '--kui-text-sm-size': '13px',
    '--kui-text-base-size': '14px',
    '--kui-text-md-size': '15px',
    '--kui-text-lg-size': '18px',
    '--kui-text-xl-size': '22px',
    '--kui-text-2xl-size': '28px',
    '--kui-text-3xl-size': '36px',
    '--kui-font-weight-regular': '400',
    '--kui-font-weight-medium': '500',
    '--kui-font-weight-semibold': '600',
    '--kui-font-weight-bold': '700',
    '--kui-type-display-size': 'var(--kui-text-3xl-size)',
    '--kui-type-display-line-height': '1.15',
    '--kui-type-display-weight': 'var(--kui-font-weight-bold)',
    '--kui-type-heading-lg-size': 'var(--kui-text-2xl-size)',
    '--kui-type-heading-lg-line-height': '1.2',
    '--kui-type-heading-lg-weight': 'var(--kui-font-weight-bold)',
    '--kui-type-heading-md-size': 'var(--kui-text-xl-size)',
    '--kui-type-heading-md-line-height': '1.25',
    '--kui-type-heading-md-weight': 'var(--kui-font-weight-semibold)',
    '--kui-type-heading-sm-size': 'var(--kui-text-lg-size)',
    '--kui-type-heading-sm-line-height': '1.3',
    '--kui-type-heading-sm-weight': 'var(--kui-font-weight-semibold)',
    '--kui-type-title-size': 'var(--kui-text-base-size)',
    '--kui-type-title-line-height': '1.4',
    '--kui-type-title-weight': 'var(--kui-font-weight-semibold)',
    '--kui-type-body-lg-size': 'var(--kui-text-md-size)',
    '--kui-type-body-lg-line-height': '1.6',
    '--kui-type-body-lg-weight': 'var(--kui-font-weight-regular)',
    '--kui-type-body-size': 'var(--kui-text-base-size)',
    '--kui-type-body-line-height': '1.5',
    '--kui-type-body-weight': 'var(--kui-font-weight-regular)',
    '--kui-type-body-sm-size': 'var(--kui-text-sm-size)',
    '--kui-type-body-sm-line-height': '1.5',
    '--kui-type-body-sm-weight': 'var(--kui-font-weight-regular)',
    '--kui-type-caption-size': 'var(--kui-text-xs-size)',
    '--kui-type-caption-line-height': '1.5',
    '--kui-type-caption-weight': 'var(--kui-font-weight-regular)',
    '--kui-type-overline-size': 'var(--kui-text-2xs-size)',
    '--kui-type-overline-line-height': '1.4',
    '--kui-type-overline-weight': 'var(--kui-font-weight-semibold)',
    '--kui-type-code-size': 'var(--kui-text-sm-size)',
    '--kui-type-code-line-height': '1.5',
    '--kui-type-code-weight': 'var(--kui-font-weight-regular)',
    '--kui-control-height-xs': '28px',
    '--kui-control-height-sm': '32px',
    '--kui-control-height-md': '40px',
    '--kui-control-height-lg': '44px',
    '--kui-btn-px-compact': '8px',
    '--kui-btn-px-regular': '12px',
    '--kui-btn-px-comfortable': '16px',
    '--kui-btn-px': `var(--kui-btn-px-${density})`,
    '--kui-btn-gap': '6px',
    '--kui-btn-font-weight': '500',
    '--kui-btn-focus-ring-w': '3px',
    '--kui-btn-focus-ring-off': '2px',
    '--kui-btn-disabled-opacity': '0.5',
    '--kui-duration-fast': '100ms',
    '--kui-duration-base': '160ms',
    '--kui-duration-normal': '200ms',
    '--kui-ease': 'cubic-bezier(0.16, 1, 0.3, 1)',
    '--kui-group-collapsed-gap': '-1px',
    '--kui-field-label-weight': '600',
    '--kui-field-affix-icon-size': '16px',
    '--kui-field-affix-max-inline-size': '40%',
    '--kui-field-message-icon-size': '12px',
    '--kui-field-message-icon-offset': '1px',
    '--kui-field-spinner-size': '14px',
    '--kui-field-spinner-border-width': '2px',
    '--kui-field-spinner-duration': '800ms',
    '--kui-field-spinner-duration-reduced': '2000ms',
    '--kui-input-border-width': '1px',
    '--kui-input-border-width-focus': '1px',
    '--kui-checkbox-size': '18px',
    '--kui-checkbox-border-width': '1px',
    '--kui-checkbox-focus-ring-w': '3px',
    '--kui-checkbox-focus-ring-off': '2px',
    '--kui-radio-border-width': '1px',
    '--kui-radio-focus-ring-w': '3px',
    '--kui-radio-focus-ring-off': '2px',
    '--kui-switch-thumb-offset': '2px',
    '--kui-switch-radius': '999px',
    '--kui-switch-border-width': '1px',
    '--kui-switch-focus-ring-w': '3px',
    '--kui-switch-focus-ring-off': '2px',
    '--kui-switch-thumb-shadow': '0 1px 2px oklch(0 0 0 / 0.22)',
    '--kui-badge-font-weight': '600',
    '--kui-loader-duration': '800ms',
    '--kui-skeleton-duration': '1600ms',
    '--kui-skeleton-line-height': '12px',
    '--kui-skeleton-heading-height': '22px',
    '--kui-skeleton-gap': 'var(--kui-space-2)',
    '--kui-scrollbar-size': '10px',
    '--kui-scrollbar-track': 'transparent',
    '--kui-scrollbar-thumb-min': '32px',
    '--kui-scrollbar-thumb-inset': '2px',
    '--kui-empty-max-width': '360px',
    '--kui-empty-max-width-lg': '440px',
    '--kui-empty-icon-size-sm': '20px',
    '--kui-empty-icon-size-md': '40px',
    '--kui-empty-icon-size-lg': '56px',
    '--kui-empty-title-weight': '650',
    '--kui-avatar-size-xs': '20px',
    '--kui-avatar-size-sm': '24px',
    '--kui-avatar-size-md': '32px',
    '--kui-avatar-size-lg': '40px',
    '--kui-avatar-size-xl': '48px',
    '--kui-avatar-size-2xl': '64px',
    '--kui-avatar-radius-circle': '50%',
    '--kui-avatar-font-weight': '600',
    '--kui-avatar-border': '0',
    '--kui-avatar-status-size-xs': '5px',
    '--kui-avatar-status-size-sm': '6px',
    '--kui-avatar-status-size-md': '9px',
    '--kui-avatar-status-size-lg': '11px',
    '--kui-avatar-status-size-xl': '13px',
    '--kui-avatar-status-size-2xl': '17px',
    '--kui-avatar-status-border-width-xs': '1px',
    '--kui-avatar-status-border-width-sm': '1.5px',
    '--kui-avatar-status-border-width-md': '2px',
    '--kui-avatar-status-border-width-lg': '2px',
    '--kui-avatar-status-border-width-xl': '2.5px',
    '--kui-avatar-status-border-width-2xl': '3px',
    '--kui-avatar-group-overlap-xs': '5px',
    '--kui-avatar-group-overlap-sm': '6px',
    '--kui-avatar-group-overlap-md': '8px',
    '--kui-avatar-group-overlap-lg': '10px',
    '--kui-avatar-group-overlap-xl': '12px',
    '--kui-avatar-group-overlap-2xl': '16px',
    '--kui-avatar-overlay-hover': 'oklch(0 0 0 / 0.20)',
    '--kui-avatar-overlay-active': 'oklch(0 0 0 / 0.30)',
    '--kui-avatar-focus-ring-w': '3px',
    '--kui-avatar-focus-ring-off': '2px',
    '--kui-slider-thumb-shadow': '0 1px 3px oklch(0 0 0 / 0.45), 0 0 0 1.5px oklch(0 0 0 / 0.12)',
    '--kui-slider-thumb-shadow-hover':
      '0 0 0 5px oklch(0.67 0.2125 285 / 0.22), 0 1px 3px oklch(0 0 0 / 0.30)',
    '--kui-slider-thumb-shadow-active':
      '0 2px 8px oklch(0 0 0 / 0.50), 0 0 0 4px oklch(0.67 0.2125 285 / 0.15)',
    '--kui-card-shadow': 'none',
    '--kui-card-shadow-elevated': '0 10px 28px oklch(0 0 0 / 0.18)',
    '--kui-card-shadow-sunken': 'none',
    '--kui-card-shadow-hover': '0 10px 30px oklch(0 0 0 / 0.14)',
    '--kui-shadow-lg': '0 8px 24px oklch(0 0 0 / 0.18), 0 2px 8px oklch(0 0 0 / 0.10)',
    '--kui-tooltip-px': '9px',
    '--kui-tooltip-py': '5px',
    '--kui-tabs-gap': '2px',
    '--kui-tab-font-weight': '500',
    '--kui-tab-font-weight-active': '600',
    '--kui-seg-padding': '2px',
    '--kui-seg-gap': '2px',
    '--kui-seg-font-weight': '500',
    '--kui-seg-font-weight-active': '600',
    '--kui-seg-item-shadow-active': 'none',
    '--kui-field-action-size': '24px',
    '--kui-field-action-icon-size': '14px',
    '--kui-field-action-focus-ring-width': '2px',
    '--kui-field-action-disabled-opacity': '0.5',
    '--kui-color-input-swatch-size-xs': '16px',
    '--kui-color-input-swatch-size': '20px',
    '--kui-color-input-swatch-size-lg': '24px',
    '--kui-color-input-swatch-border-width': '1px',
    '--kui-color-input-checker-size': '8px',
    '--kui-color-input-picker-width': '260px',
    '--kui-color-input-picker-height': '160px',
    '--kui-color-input-preview-swatch-size': '48px',
    '--kui-color-input-thumb-size': '16px',
    '--kui-color-input-hue-track-height': '12px',
    '--kui-select-dropdown-bg': 'var(--kui-color-surface-elevated)',
    '--kui-select-option-selected-bg': 'var(--kui-color-primary-soft-bg)',
    '--kui-select-option-selected-fg': 'var(--kui-color-primary-soft-text)',
    '--kui-select-affordance-size': '20px',
    '--kui-select-suffix-inline-end': '10px',
    '--kui-select-chip-layer-inline-end': '64px',
    '--kui-dialog-backdrop': 'oklch(0 0 0 / 0.5)',
    '--kui-toast-min-width': '280px',
    '--kui-toast-max-width': '400px',
    '--kui-z-toast': '1100',
    '--kui-popover-min-width': '160px',
    '--kui-popover-max-width': '320px',
    '--kui-popover-arrow-size': '10px',
    '--kui-z-popover': '400',
    '--kui-menu-border-width': '1px',
    '--kui-menu-min-width': '160px',
    '--kui-menu-item-height': '32px',
    '--kui-menu-item-height-mobile': '44px',
    '--kui-menu-item-font-weight': '500',
    '--kui-menu-item-icon-size': '16px',
    '--kui-menu-group-header-font-weight': '600',
    '--kui-z-menu': '420',
    '--kui-separator-thickness': '1px',
    '--kui-separator-spacing-none': '0',
    '--kui-drawer-border-width': '1px',
    '--kui-drawer-backdrop-bg': 'oklch(0 0 0 / 0.5)',
    '--kui-drawer-shadow-right': '-4px 0 24px oklch(0 0 0 / 0.18)',
    '--kui-drawer-shadow-left': '4px 0 24px oklch(0 0 0 / 0.18)',
    '--kui-drawer-shadow-bottom': '0 -4px 24px oklch(0 0 0 / 0.18)',
    '--kui-drawer-shadow-top': '0 4px 24px oklch(0 0 0 / 0.18)',
    '--kui-drawer-header-height': '56px',
    '--kui-drawer-title-weight': '600',
    '--kui-drawer-close-size': '28px',
    '--kui-drawer-footer-height': '56px',
    '--kui-drawer-width-sm': '320px',
    '--kui-drawer-width-md': '480px',
    '--kui-drawer-width-lg': '640px',
    '--kui-drawer-height-sm': '40vh',
    '--kui-drawer-height-md': '50vh',
    '--kui-drawer-height-lg': '70vh',
    '--kui-drawer-duration-open': '280ms',
    '--kui-drawer-duration-close': '220ms',
    '--kui-z-drawer-backdrop': '500',
    '--kui-z-drawer': '510',
    '--kui-chip-border-width': '1px',
    '--kui-chip-height-xs': '18px',
    '--kui-chip-height-sm': '22px',
    '--kui-chip-height-md': '26px',
    '--kui-chip-height-lg': '32px',
    '--kui-chip-padding-x': '10px',
    '--kui-chip-gap-xs': '3px',
    '--kui-chip-font-weight': '600',
    '--kui-chip-disabled-opacity': '0.4',
    '--kui-chip-focus-ring-width': '3px',
    '--kui-chip-icon-opacity': '0.75',
    '--kui-chip-avatar-font-weight': '700',
    '--kui-chip-remove-radius': '2px',
    '--kui-chip-remove-size-xs': '10px',
    '--kui-chip-remove-size-sm': '12px',
    '--kui-chip-remove-size-md': '14px',
    '--kui-chip-remove-size-lg': '18px',
    '--kui-chip-remove-focus-ring-width': '2px',
    '--kui-combobox-suffix-gap': '2px',
    '--kui-combobox-affordance-size': '20px',
    '--kui-combobox-loader-size': '16px',
    '--kui-combobox-loader-border-width': '2px',
    '--kui-combobox-loader-duration': '700ms',
    '--kui-command-backdrop-bg': 'oklch(0 0 0 / 0.5)',
    '--kui-command-width': 'min(640px, 90vw)',
    '--kui-command-max-height': '78vh',
    '--kui-command-offset-block-start': '12vh',
    '--kui-command-search-height': '52px',
    '--kui-command-list-max-height': '320px',
    '--kui-command-item-height': '40px',
    '--kui-z-command-palette': '460',
    '--kui-breadcrumb-font-weight-current': '600',
    '--kui-date-picker-suffix-gap': '2px',
    '--kui-date-picker-affordance-size': '20px',
    '--kui-tree-indent': '24px',
    '--kui-file-upload-dropzone-bg': 'transparent',
    '--kui-timepicker-affordance-size': '20px',
    '--kui-chart-height-sm': '160px',
    '--kui-chart-height-md': '240px',
    '--kui-chart-height-lg': '320px',
    '--kui-chart-stroke-width': '2px',
    '--kui-chart-point-radius': '4px',
    '--kui-chart-donut-thickness': '28px',
    '--kui-chart-tooltip-radius': 'var(--kui-radius-md)',
  };
}

function parseKuiColor(color: string): KuiOklchColor {
  if (color.startsWith('#')) {
    return hexToOklch(color);
  }

  const match = /^oklch\(\s*([0-9.]+%?)\s+([0-9.]+)\s+([0-9.]+)(?:\s*\/\s*([0-9.]+))?\s*\)$/i.exec(
    color,
  );

  if (!match) {
    throw new Error(`Unsupported Kikita UI seed color "${color}". Use hex or oklch().`);
  }

  return {
    lightness: parseLightness(match[1]),
    chroma: Number(match[2]),
    hue: normalizeHue(Number(match[3])),
    alpha: match[4] === undefined ? undefined : Number(match[4]),
  };
}

function parseLightness(value: string): number {
  return value.endsWith('%') ? Number(value.slice(0, -1)) / 100 : Number(value);
}

function hexToOklch(hex: string): KuiOklchColor {
  const normalized =
    hex.length === 4 ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}` : hex;

  if (!/^#[0-9a-f]{6}$/i.test(normalized)) {
    throw new Error(`Unsupported hex color "${hex}". Use #rgb or #rrggbb.`);
  }

  const red = srgbToLinear(parseInt(normalized.slice(1, 3), 16) / 255);
  const green = srgbToLinear(parseInt(normalized.slice(3, 5), 16) / 255);
  const blue = srgbToLinear(parseInt(normalized.slice(5, 7), 16) / 255);

  const l = Math.cbrt(0.4122214708 * red + 0.5363325363 * green + 0.0514459929 * blue);
  const m = Math.cbrt(0.2119034982 * red + 0.6806995451 * green + 0.1073969566 * blue);
  const s = Math.cbrt(0.0883024619 * red + 0.2817188376 * green + 0.6299787005 * blue);

  const lightness = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const b = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const chroma = Math.sqrt(a * a + b * b);
  const hue = normalizeHue((Math.atan2(b, a) * 180) / Math.PI);

  return { lightness, chroma, hue };
}

function srgbToLinear(value: number): number {
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

function formatOklch(color: KuiOklchColor): string {
  const base = `oklch(${round(color.lightness)} ${round(color.chroma)} ${round(color.hue)})`;
  return color.alpha === undefined ? base : base.replace(')', ` / ${round(color.alpha)})`);
}

function round(value: number): string {
  return Number(value.toFixed(4)).toString();
}

function normalizeHue(hue: number): number {
  return ((hue % 360) + 360) % 360;
}

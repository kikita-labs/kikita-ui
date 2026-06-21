import { DEFAULT_KUI_THEME } from './default-kui-theme.const';
import { KuiOklchColor } from './kui-theme-color.interface';
import { KuiThemeMode } from './kui-theme-mode.type';
import { KuiThemeOptions } from './kui-theme-options.interface';
import {
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
    '--kui-color-primary-soft-text': 'var(--kui-primary-7)',
    '--kui-color-primary-focus-ring': formatOklch({ ...seeds.primary, alpha: 0.4 }),
    '--kui-color-success-fill': 'var(--kui-success-6)',
    '--kui-color-success-soft-bg': 'var(--kui-success-1)',
    '--kui-color-success-soft-text': 'var(--kui-success-7)',
    '--kui-color-success-soft-border': 'var(--kui-success-4)',
    '--kui-color-warning-fill': 'var(--kui-warning-6)',
    '--kui-color-warning-soft-bg': 'var(--kui-warning-1)',
    '--kui-color-warning-soft-text': 'var(--kui-warning-7)',
    '--kui-color-warning-soft-border': 'var(--kui-warning-4)',
    '--kui-color-danger-fill': 'var(--kui-danger-6)',
    '--kui-color-danger-fill-hover': 'var(--kui-danger-7)',
    '--kui-color-danger-fill-active': 'var(--kui-danger-8)',
    '--kui-color-danger-soft-bg': 'var(--kui-danger-1)',
    '--kui-color-danger-soft-text': 'var(--kui-danger-7)',
    '--kui-color-danger-soft-border': 'var(--kui-danger-4)',
    '--kui-color-info-fill': 'var(--kui-info-6)',
    '--kui-color-info-soft-bg': 'var(--kui-info-1)',
    '--kui-color-info-soft-text': 'var(--kui-info-7)',
    '--kui-color-info-soft-border': 'var(--kui-info-4)',
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
    '--kui-color-success-soft-bg': 'var(--kui-success-11)',
    '--kui-color-success-soft-text': 'var(--kui-success-4)',
    '--kui-color-success-soft-border': 'var(--kui-success-8)',
    '--kui-color-warning-fill': 'var(--kui-warning-5)',
    '--kui-color-warning-soft-bg': 'var(--kui-warning-11)',
    '--kui-color-warning-soft-text': 'var(--kui-warning-4)',
    '--kui-color-warning-soft-border': 'var(--kui-warning-8)',
    '--kui-color-danger-fill': 'var(--kui-danger-5)',
    '--kui-color-danger-fill-hover': 'var(--kui-danger-4)',
    '--kui-color-danger-fill-active': 'var(--kui-danger-6)',
    '--kui-color-danger-soft-bg': 'var(--kui-danger-11)',
    '--kui-color-danger-soft-text': 'var(--kui-danger-4)',
    '--kui-color-danger-soft-border': 'var(--kui-danger-8)',
    '--kui-color-info-fill': 'var(--kui-info-5)',
    '--kui-color-info-soft-bg': 'var(--kui-info-11)',
    '--kui-color-info-soft-text': 'var(--kui-info-4)',
    '--kui-color-info-soft-border': 'var(--kui-info-8)',
  };
}

function createComponentVariables(options: KuiThemeOptions): KuiCssVariableMap {
  const radius = `${options.seeds.radius}px`;
  const density = options.seeds.density;

  return {
    '--kui-radius-none': '0',
    '--kui-radius-xs': `${Math.max(2, options.seeds.radius - 4)}px`,
    '--kui-radius-sm': `${Math.max(4, options.seeds.radius - 2)}px`,
    '--kui-radius-md': radius,
    '--kui-radius-lg': `${options.seeds.radius + 2}px`,
    '--kui-radius-xl': `${options.seeds.radius + 6}px`,
    '--kui-radius-full': '9999px',
    '--kui-space-1': '4px',
    '--kui-space-2': '8px',
    '--kui-space-3': '12px',
    '--kui-space-4': '16px',
    '--kui-space-5': '20px',
    '--kui-space-6': '24px',
    '--kui-space-8': '32px',
    '--kui-space-12': '48px',
    '--kui-space-16': '64px',
    '--kui-text-xs-size': '11px',
    '--kui-text-sm-size': '13px',
    '--kui-text-base-size': '14px',
    '--kui-text-md-size': '15px',
    '--kui-text-lg-size': '18px',
    '--kui-text-xl-size': '22px',
    '--kui-text-2xl-size': '28px',
    '--kui-text-3xl-size': '36px',
    '--kui-control-height-xs': '28px',
    '--kui-control-height-sm': '32px',
    '--kui-control-height-md': '40px',
    '--kui-control-height-lg': '44px',
    '--kui-btn-height-compact': '24px',
    '--kui-btn-height-regular': '32px',
    '--kui-btn-height-comfortable': '40px',
    '--kui-btn-px-compact': '8px',
    '--kui-btn-px-regular': '12px',
    '--kui-btn-px-comfortable': '16px',
    '--kui-btn-height': `var(--kui-btn-height-${density})`,
    '--kui-btn-px': `var(--kui-btn-px-${density})`,
    '--kui-btn-padding-inline': 'var(--kui-btn-px)',
    '--kui-btn-radius': 'var(--kui-radius-md)',
    '--kui-btn-gap': '6px',
    '--kui-btn-font-size': 'var(--kui-text-sm-size)',
    '--kui-btn-font-weight': '500',
    '--kui-btn-solid-bg': 'var(--kui-color-primary-fill)',
    '--kui-btn-solid-bg-hov': 'var(--kui-color-primary-fill-hover)',
    '--kui-btn-solid-bg-act': 'var(--kui-color-primary-fill-active)',
    '--kui-btn-solid-fg': 'oklch(1 0 0)',
    '--kui-btn-soft-bg': 'var(--kui-color-primary-soft-bg)',
    '--kui-btn-soft-bg-hov': 'var(--kui-color-primary-soft-bg-hover)',
    '--kui-btn-soft-bg-act': 'var(--kui-color-primary-soft-bg-active)',
    '--kui-btn-soft-fg': 'var(--kui-color-primary-soft-text)',
    '--kui-btn-outline-border': 'var(--kui-color-primary-fill)',
    '--kui-btn-outline-fg': 'var(--kui-color-primary-fill)',
    '--kui-btn-outline-bg-hov': 'var(--kui-color-surface-elevated)',
    '--kui-btn-outline-bg-act': 'var(--kui-color-surface-sunken)',
    '--kui-btn-ghost-fg': 'var(--kui-color-text-secondary)',
    '--kui-btn-ghost-bg-hov': 'var(--kui-color-surface-sunken)',
    '--kui-btn-ghost-bg-act': 'var(--kui-color-surface-elevated)',
    '--kui-btn-danger-bg': 'var(--kui-color-danger-fill)',
    '--kui-btn-danger-bg-hov': 'var(--kui-color-danger-fill-hover)',
    '--kui-btn-danger-bg-act': 'var(--kui-color-danger-fill-active)',
    '--kui-btn-danger-fg': 'oklch(1 0 0)',
    '--kui-btn-bg': 'var(--kui-btn-solid-bg)',
    '--kui-btn-bg-hover': 'var(--kui-btn-solid-bg-hov)',
    '--kui-btn-bg-active': 'var(--kui-btn-solid-bg-act)',
    '--kui-btn-color': 'var(--kui-btn-solid-fg)',
    '--kui-btn-secondary-bg': 'var(--kui-btn-soft-bg)',
    '--kui-btn-secondary-bg-hover': 'var(--kui-btn-soft-bg-hov)',
    '--kui-btn-secondary-color': 'var(--kui-btn-soft-fg)',
    '--kui-btn-outline-bg-hover': 'var(--kui-btn-outline-bg-hov)',
    '--kui-btn-ghost-bg-hover': 'var(--kui-btn-ghost-bg-hov)',
    '--kui-btn-focus-ring-w': '3px',
    '--kui-btn-focus-ring-off': '2px',
    '--kui-btn-focus-ring-color': 'var(--kui-color-primary-focus-ring)',
    '--kui-btn-focus-ring-width': 'var(--kui-btn-focus-ring-w)',
    '--kui-btn-focus-ring-offset': 'var(--kui-btn-focus-ring-off)',
    '--kui-btn-focus-ring': '0 0 0 3px var(--kui-color-primary-focus-ring)',
    '--kui-btn-disabled-opacity': '0.5',
    '--kui-duration-fast': '100ms',
    '--kui-duration-base': '160ms',
    '--kui-ease': 'cubic-bezier(0.16, 1, 0.3, 1)',
    '--kui-group-gap': 'var(--kui-space-2)',
    '--kui-group-collapsed-gap': '-1px',
    '--kui-field-gap': 'var(--kui-space-1)',
    '--kui-field-label-size': 'var(--kui-text-sm-size)',
    '--kui-field-label-weight': '600',
    '--kui-field-label-color': 'var(--kui-color-text)',
    '--kui-field-hint-size': 'var(--kui-text-xs-size)',
    '--kui-field-hint-color': 'var(--kui-color-text-secondary)',
    '--kui-field-error-color': 'var(--kui-color-danger-fill)',
    '--kui-field-required-color': 'var(--kui-color-danger-fill)',
    '--kui-input-height': 'var(--kui-btn-height)',
    '--kui-input-px': 'var(--kui-btn-px)',
    '--kui-input-padding-inline': 'var(--kui-input-px)',
    '--kui-input-radius': 'var(--kui-radius-md)',
    '--kui-input-bg': 'var(--kui-color-surface)',
    '--kui-input-bg-disabled': 'var(--kui-color-surface-sunken)',
    '--kui-input-text': 'var(--kui-color-text)',
    '--kui-input-color': 'var(--kui-color-text)',
    '--kui-input-border': 'var(--kui-color-border)',
    '--kui-input-border-hover': 'var(--kui-color-border-strong)',
    '--kui-input-border-focus': 'var(--kui-color-primary-fill)',
    '--kui-input-border-error': 'var(--kui-color-danger-fill)',
    '--kui-input-border-invalid': 'var(--kui-color-danger-fill)',
    '--kui-input-border-width': '1px',
    '--kui-input-border-width-focus': '1px',
    '--kui-input-placeholder': 'var(--kui-color-text-disabled)',
    '--kui-input-placeholder-color': 'var(--kui-input-placeholder)',
    '--kui-input-focus-ring': '0 0 0 3px var(--kui-color-primary-focus-ring)',
    '--kui-checkbox-size': '18px',
    '--kui-checkbox-radius': 'var(--kui-radius-sm)',
    '--kui-checkbox-bg': 'var(--kui-color-surface)',
    '--kui-checkbox-border': 'var(--kui-color-border)',
    '--kui-checkbox-border-hover': 'var(--kui-color-border-strong)',
    '--kui-checkbox-border-error': 'var(--kui-color-danger-fill)',
    '--kui-checkbox-checked-bg': 'var(--kui-color-primary-fill)',
    '--kui-checkbox-checked-border': 'var(--kui-color-primary-fill)',
    '--kui-checkbox-mark': 'oklch(1 0 0)',
    '--kui-checkbox-border-width': '1px',
    '--kui-checkbox-focus-ring-w': '3px',
    '--kui-checkbox-focus-ring-off': '2px',
    '--kui-checkbox-focus-ring-color': 'var(--kui-color-primary-focus-ring)',
    '--kui-radio-size': '18px',
    '--kui-radio-bg': 'var(--kui-color-surface)',
    '--kui-radio-border': 'var(--kui-color-border)',
    '--kui-radio-border-hover': 'var(--kui-color-border-strong)',
    '--kui-radio-border-error': 'var(--kui-color-danger-fill)',
    '--kui-radio-checked-bg': 'var(--kui-color-primary-fill)',
    '--kui-radio-checked-border': 'var(--kui-color-primary-fill)',
    '--kui-radio-dot': 'oklch(1 0 0)',
    '--kui-radio-border-width': '1px',
    '--kui-radio-focus-ring-w': '3px',
    '--kui-radio-focus-ring-off': '2px',
    '--kui-radio-focus-ring-color': 'var(--kui-color-primary-focus-ring)',
    '--kui-switch-width': '38px',
    '--kui-switch-height': '22px',
    '--kui-switch-thumb-size': '16px',
    '--kui-switch-thumb-offset': '2px',
    '--kui-switch-thumb-translate': '16px',
    '--kui-switch-radius': '999px',
    '--kui-switch-bg': 'var(--kui-color-surface-sunken)',
    '--kui-switch-border': 'var(--kui-color-border)',
    '--kui-switch-border-hover': 'var(--kui-color-border-strong)',
    '--kui-switch-border-error': 'var(--kui-color-danger-fill)',
    '--kui-switch-checked-bg': 'var(--kui-color-primary-fill)',
    '--kui-switch-checked-border': 'var(--kui-color-primary-fill)',
    '--kui-switch-thumb-bg': 'var(--kui-color-text-secondary)',
    '--kui-switch-checked-thumb-bg': 'oklch(1 0 0)',
    '--kui-switch-border-width': '1px',
    '--kui-switch-focus-ring-w': '3px',
    '--kui-switch-focus-ring-off': '2px',
    '--kui-switch-focus-ring-color': 'var(--kui-color-primary-focus-ring)',
    '--kui-switch-thumb-shadow': '0 1px 2px oklch(0 0 0 / 0.22)',
    '--kui-badge-height': '22px',
    '--kui-badge-px': 'var(--kui-space-2)',
    '--kui-badge-gap': 'var(--kui-space-1)',
    '--kui-badge-radius': 'var(--kui-radius-full)',
    '--kui-badge-font-size': 'var(--kui-text-xs-size)',
    '--kui-badge-font-weight': '600',
    '--kui-badge-neutral-bg': 'var(--kui-color-surface-elevated)',
    '--kui-badge-neutral-fg': 'var(--kui-color-text-secondary)',
    '--kui-badge-neutral-border': 'var(--kui-color-border)',
    '--kui-badge-primary-bg': 'var(--kui-color-primary-soft-bg)',
    '--kui-badge-primary-fg': 'var(--kui-color-primary-soft-text)',
    '--kui-badge-primary-border': 'var(--kui-color-primary-fill)',
    '--kui-badge-success-bg': 'var(--kui-color-success-soft-bg)',
    '--kui-badge-success-fg': 'var(--kui-color-success-soft-text)',
    '--kui-badge-success-border': 'var(--kui-color-success-soft-border)',
    '--kui-badge-warning-bg': 'var(--kui-color-warning-soft-bg)',
    '--kui-badge-warning-fg': 'var(--kui-color-warning-soft-text)',
    '--kui-badge-warning-border': 'var(--kui-color-warning-soft-border)',
    '--kui-badge-danger-bg': 'var(--kui-color-danger-soft-bg)',
    '--kui-badge-danger-fg': 'var(--kui-color-danger-soft-text)',
    '--kui-badge-danger-border': 'var(--kui-color-danger-soft-border)',
    '--kui-badge-info-bg': 'var(--kui-color-info-soft-bg)',
    '--kui-badge-info-fg': 'var(--kui-color-info-soft-text)',
    '--kui-badge-info-border': 'var(--kui-color-info-soft-border)',
    '--kui-loader-size': '20px',
    '--kui-loader-track': 'var(--kui-color-surface-sunken)',
    '--kui-loader-fill': 'var(--kui-color-primary-fill)',
    '--kui-loader-border-width': '2px',
    '--kui-loader-duration': '800ms',
    '--kui-card-bg': 'var(--kui-color-surface)',
    '--kui-card-bg-elevated': 'var(--kui-color-surface-elevated)',
    '--kui-card-bg-sunken': 'var(--kui-color-surface-sunken)',
    '--kui-card-border': 'var(--kui-color-border)',
    '--kui-card-border-elevated': 'var(--kui-color-border-strong)',
    '--kui-card-border-sunken': 'var(--kui-color-border)',
    '--kui-card-border-hover': 'var(--kui-color-border-strong)',
    '--kui-card-radius': 'var(--kui-radius-md)',
    '--kui-card-padding': 'var(--kui-space-4)',
    '--kui-card-shadow': 'none',
    '--kui-card-shadow-elevated': '0 10px 28px oklch(0 0 0 / 0.18)',
    '--kui-card-shadow-sunken': 'none',
    '--kui-card-shadow-hover': '0 10px 30px oklch(0 0 0 / 0.14)',
    '--kui-shadow-lg': '0 8px 24px oklch(0 0 0 / 0.18), 0 2px 8px oklch(0 0 0 / 0.10)',
    '--kui-tooltip-bg': 'var(--kui-color-text)',
    '--kui-tooltip-fg': 'var(--kui-color-bg)',
    '--kui-tooltip-px': '9px',
    '--kui-tooltip-py': '5px',
    '--kui-tooltip-radius': 'var(--kui-radius-sm)',
    '--kui-tooltip-shadow': 'var(--kui-shadow-lg)',
    '--kui-tabs-border': 'var(--kui-color-border)',
    '--kui-tabs-gap': '2px',
    '--kui-tabs-panel-gap': 'var(--kui-space-4)',
    '--kui-tab-height': 'var(--kui-btn-height)',
    '--kui-tab-px': 'var(--kui-btn-px)',
    '--kui-tab-gap': 'var(--kui-space-1)',
    '--kui-tab-radius': 'var(--kui-radius-sm)',
    '--kui-tab-font-size': 'var(--kui-btn-font-size)',
    '--kui-tab-font-weight': '500',
    '--kui-tab-font-weight-active': '600',
    '--kui-tab-fg': 'var(--kui-color-text-secondary)',
    '--kui-tab-fg-hover': 'var(--kui-color-text)',
    '--kui-tab-fg-active': 'var(--kui-color-text)',
    '--kui-tab-bg-hover': 'var(--kui-color-surface-sunken)',
    '--kui-tab-indicator': 'var(--kui-color-primary-fill)',
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

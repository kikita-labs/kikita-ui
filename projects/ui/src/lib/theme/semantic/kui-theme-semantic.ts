import type { KuiOklchColor } from '../kui-theme-color.interface';
import type { KuiThemeMode } from '../kui-theme-mode.type';
import type { KuiCssVariableMap } from '../kui-theme-tokens.interface';
import { formatOklch } from '../palette/kui-theme-color-format';
import type { KuiAccentName, KuiParsedSeeds } from '../palette/kui-theme-palette';
import { ACCENT_NAMES } from '../palette/kui-theme-palette';
import { createAccentVariables, WHITE_TEXT } from './kui-theme-accent-roles';

/** Neutral step read by each neutral role: [light, dark]. */
const NEUTRAL_ROLE_STEPS = {
  surface: [1, 3],
  'surface-elevated': [1, 4],
  bg: [2, 2],
  'surface-sunken': [3, 1],
  'skeleton-highlight': [3, 6],
  'border-subtle': [4, 4],
  'skeleton-bg': [4, 4],
  border: [5, 5],
  'scrollbar-thumb': [6, 7],
  'border-strong': [7, 7],
  'text-disabled': [8, 8],
  'scrollbar-thumb-hover': [9, 9],
  'scrollbar-thumb-active': [10, 10],
  'border-control': [10, 10],
  'border-control-hover': [11, 11],
  'text-secondary': [11, 11],
  'text-placeholder': [11, 11],
  text: [12, 12],
  'neutral-fill': [11, 7],
} as const satisfies Record<string, readonly [number, number]>;
/** Categorical palettes: avatar tints and chart series are deliberately independent of the seeds. */
const CATEGORICAL_VARIABLES = {
  light: {
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
  },
  dark: {
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
  },
} as const satisfies Record<KuiThemeMode, KuiCssVariableMap>;

const CHART_ROLE_ALIASES = {
  '--kui-chart-grid-color': 'var(--kui-color-border)',
  '--kui-chart-axis-label-color': 'var(--kui-color-text-secondary)',
  '--kui-chart-tooltip-bg': 'var(--kui-color-surface-elevated)',
  '--kui-chart-tooltip-text': 'var(--kui-color-text)',
  '--kui-chart-tooltip-border': 'var(--kui-color-border)',
} as const satisfies KuiCssVariableMap;

/** The role variables of one mode: neutral roles, accent roles, categorical palettes, chart roles. */
export function createSemanticVariables(
  mode: KuiThemeMode,
  seeds: KuiParsedSeeds,
  ramps: Record<KuiAccentName, readonly KuiOklchColor[]>,
  neutral: Record<KuiThemeMode, readonly KuiOklchColor[]>,
): KuiCssVariableMap {
  const modeIndex = mode === 'light' ? 0 : 1;
  const variables: Record<`--kui-${string}`, string> = {
    '--kui-color-on-scrim': WHITE_TEXT,
    '--kui-color-scrim': 'oklch(0 0 0 / 0.5)',
    '--kui-color-scrim-strong': 'oklch(0 0 0 / 0.92)',
    // A translucent layer of the text colour: lighter than the surface in dark mode and darker in light
    // mode, on any surface, so a hover or pressed fill never disappears or turns into a hole.
    '--kui-color-state-hover': 'color-mix(in oklab, var(--kui-color-text) 8%, transparent)',
    '--kui-color-state-active': 'color-mix(in oklab, var(--kui-color-text) 14%, transparent)',
    '--kui-color-neutral-on-fill': WHITE_TEXT,
    '--kui-color-focus': 'var(--kui-color-primary-indicator)',
    /** @deprecated Translucent halo kept for 2.x consumers. Use `--kui-color-focus`. Removed in 3.0. */
    '--kui-color-primary-focus-ring': formatOklch(
      mode === 'light'
        ? { ...seeds.primary, alpha: 0.4 }
        : {
            ...seeds.primary,
            lightness: 0.65,
            chroma: seeds.primary.chroma * 0.88,
            alpha: 0.5,
          },
    ),
    ...CATEGORICAL_VARIABLES[mode],
    ...CHART_ROLE_ALIASES,
  };

  neutral[mode].forEach((color, index) => {
    variables[`--kui-neutral-${index + 1}`] = formatOklch(color);
  });

  for (const [role, steps] of Object.entries(NEUTRAL_ROLE_STEPS)) {
    variables[`--kui-color-${role}`] = `var(--kui-neutral-${steps[modeIndex]})`;
  }

  for (const name of ACCENT_NAMES) {
    Object.assign(variables, createAccentVariables(mode, name, ramps[name], neutral[mode]));
  }

  return variables;
}

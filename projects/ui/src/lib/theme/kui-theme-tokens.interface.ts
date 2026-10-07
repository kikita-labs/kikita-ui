import type { KuiThemeContrast } from './kui-theme-contrast.type';

/** Supported generated color scale names. */
export type KuiColorScaleName = 'primary' | 'neutral' | 'success' | 'warning' | 'danger' | 'info';

/** Generated 12-step OKLCH palette map. */
export type KuiPaletteMap = Readonly<Record<KuiColorScaleName, readonly string[]>>;

/** Public CSS variable map emitted by the theme generator. */
export type KuiCssVariableMap = Readonly<Record<`--kui-${string}`, string>>;

/** Generated Kikita UI theme ready to be exposed as CSS variables. */
export interface KuiGeneratedTheme {
  /** Seed CSS variables. */
  readonly seeds: KuiCssVariableMap;

  /**
   * Generated OKLCH palette steps keyed by scale name. Accent scales have a fixed tone per step;
   * `neutral` is the light-mode scale, the dark scale is part of `dark`.
   */
  readonly palettes: KuiPaletteMap;

  /** Accent palette CSS variables; the neutral scales differ per mode and are part of `light` and `dark`. */
  readonly paletteVariables: KuiCssVariableMap;

  /** Light-mode neutral scale and semantic CSS variables. */
  readonly light: KuiCssVariableMap;

  /** Dark-mode neutral scale and semantic CSS variables. */
  readonly dark: KuiCssVariableMap;

  /** Component and base scale CSS variables shared by light and dark themes. */
  readonly component: KuiCssVariableMap;

  /** Every contrast profile other than the default one, as the variables it changes. */
  readonly contrast: readonly KuiGeneratedContrast[];
}

/**
 * The variables one contrast profile changes relative to the theme's default profile. They are
 * emitted as `[data-kui-contrast]` rules and, when `media` is set, as a media query rule.
 */
export interface KuiGeneratedContrast {
  /** Profile name, the value of the `data-kui-contrast` attribute. */
  readonly name: KuiThemeContrast;

  /** Media query condition under which the profile applies without the attribute, if any. */
  readonly media?: string;

  /** Variables that differ from the default profile in light mode. */
  readonly light: KuiCssVariableMap;

  /** Variables that differ from the default profile in dark mode. */
  readonly dark: KuiCssVariableMap;
}

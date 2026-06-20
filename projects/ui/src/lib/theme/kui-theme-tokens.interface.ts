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

  /** Generated OKLCH palette steps keyed by scale name. */
  readonly palettes: KuiPaletteMap;

  /** Palette CSS variables. */
  readonly paletteVariables: KuiCssVariableMap;

  /** Light semantic CSS variables. */
  readonly light: KuiCssVariableMap;

  /** Dark semantic CSS variables. */
  readonly dark: KuiCssVariableMap;

  /** Component and base scale CSS variables shared by light and dark themes. */
  readonly component: KuiCssVariableMap;
}

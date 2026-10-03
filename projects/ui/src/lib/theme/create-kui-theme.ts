import { createComponentVariables } from './component-tokens/kui-theme-component-tokens';
import { DEFAULT_KUI_THEME } from './default-kui-theme.const';
import type { KuiOklchColor } from './kui-theme-color.interface';
import type { KuiThemeMode } from './kui-theme-mode.type';
import type { KuiThemeOptions } from './kui-theme-options.interface';
import type {
  KuiCssVariableMap,
  KuiGeneratedTheme,
  KuiPaletteMap,
} from './kui-theme-tokens.interface';
import { formatOklch, parseKuiColor } from './palette/kui-theme-color-format';
import type { KuiAccentName, KuiParsedSeeds } from './palette/kui-theme-palette';
import {
  ACCENT_NAMES,
  createAccentRamp,
  createNeutralScale,
  createPaletteVariables,
  createSeedVariables,
  FALLBACK_INFO_SEED,
} from './palette/kui-theme-palette';
import { createSemanticVariables } from './semantic/kui-theme-semantic';

/**
 * Creates a generated Kikita UI theme from seed tokens.
 *
 * @remarks
 * Accent steps 1 to 5 and 7 to 12 sit at fixed tones, so contrast between steps does not depend on
 * the hue; step 6 is the seed. Neutral steps are two scales, one per mode, tinted with the neutral
 * seed. Every pair of roles the library draws meets WCAG 2.x (4.5:1 text, 3:1 non-text) for any
 * seed: the solid-fill text colour is chosen by measured contrast, and a seed that neither white
 * nor near-black text reaches 4.5:1 on gets a slightly corrected solid fill.
 */
export function createKuiTheme(options: KuiThemeOptions = DEFAULT_KUI_THEME): KuiGeneratedTheme {
  const colorSeeds = options.seeds.color;
  const parsedSeeds: KuiParsedSeeds = {
    primary: parseKuiColor(colorSeeds.primary),
    neutral: parseKuiColor(colorSeeds.neutral),
    success: parseKuiColor(colorSeeds.success),
    warning: parseKuiColor(colorSeeds.warning),
    danger: parseKuiColor(colorSeeds.danger),
    info: parseKuiColor(colorSeeds.info ?? FALLBACK_INFO_SEED),
  };

  const ramps = Object.fromEntries(
    ACCENT_NAMES.map((name) => [name, createAccentRamp(parsedSeeds[name])]),
  ) as Record<KuiAccentName, readonly KuiOklchColor[]>;
  const neutral = {
    light: createNeutralScale(parsedSeeds.neutral, 'light'),
    dark: createNeutralScale(parsedSeeds.neutral, 'dark'),
  };
  const palettes = Object.fromEntries([
    ...ACCENT_NAMES.map((name) => [name, ramps[name].map((color) => formatOklch(color))]),
    ['neutral', neutral.light.map((color) => formatOklch(color))],
  ]) as KuiPaletteMap;

  return {
    seeds: createSeedVariables(parsedSeeds),
    palettes,
    paletteVariables: createPaletteVariables(palettes),
    light: createSemanticVariables('light', parsedSeeds, ramps, neutral),
    dark: createSemanticVariables('dark', parsedSeeds, ramps, neutral),
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

/**
 * Serializes both default light and attribute-driven dark theme CSS inside the `kui.tokens` cascade
 * layer, so a declaration of the same variable that a consumer writes outside any layer always wins,
 * whatever the order of the style sheets.
 */
export function createKuiThemeStyleSheet(theme: KuiGeneratedTheme): string {
  const rules = [
    createKuiThemeCssText(theme, ':root, [data-kui-theme="light"]', 'light'),
    createKuiThemeCssText(theme, '[data-kui-theme="dark"]', 'dark'),
  ].join('\n\n');

  return `@layer kui.tokens {\n${rules.replace(/^(?=.)/gm, '  ')}\n}`;
}

import { createComponentVariables } from './component-tokens/kui-theme-component-tokens';
import { DEFAULT_KUI_THEME, DEFAULT_KUI_THEME_CONTRAST } from './default-kui-theme.const';
import type { KuiOklchColor } from './kui-theme-color.interface';
import type { KuiThemeContrast } from './kui-theme-contrast.type';
import type { KuiThemeMode } from './kui-theme-mode.type';
import type { KuiThemeOptions } from './kui-theme-options.interface';
import type {
  KuiCssVariableMap,
  KuiGeneratedContrast,
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
import { KUI_CONTRAST_PROFILES } from './semantic/kui-theme-contrast-profiles';
import { createContrastDelta } from './semantic/kui-theme-neutral-roles';
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

  const defaultContrast = options.contrast ?? DEFAULT_KUI_THEME_CONTRAST;

  return {
    seeds: createSeedVariables(parsedSeeds),
    palettes,
    paletteVariables: createPaletteVariables(palettes),
    light: createSemanticVariables('light', parsedSeeds, ramps, neutral, defaultContrast),
    dark: createSemanticVariables('dark', parsedSeeds, ramps, neutral, defaultContrast),
    component: createComponentVariables(options),
    contrast: createContrastProfiles(defaultContrast),
  };
}

/** The variables every other contrast profile changes relative to the default one. */
function createContrastProfiles(defaultContrast: KuiThemeContrast): KuiGeneratedContrast[] {
  return (Object.keys(KUI_CONTRAST_PROFILES) as KuiThemeContrast[])
    .filter((name) => name !== defaultContrast)
    .map((name) => ({
      name,
      media: KUI_CONTRAST_PROFILES[name].media,
      ...createContrastDelta(defaultContrast, name),
    }))
    .filter((rule) => Object.keys(rule.light).length > 0 || Object.keys(rule.dark).length > 0);
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

/** Selector of the default light theme; it is also the document-level default. */
const LIGHT_SELECTOR = ':root, [data-kui-theme="light"]';

/** Selector of the dark theme. */
const DARK_SELECTOR = '[data-kui-theme="dark"]';

/** Serializes one rule: a selector and its declarations. */
function createRule(selector: string, variables: KuiCssVariableMap): string {
  const declarations = Object.entries(variables)
    .map(([name, value]) => `  ${name}: ${value};`)
    .join('\n');

  return `${selector} {\n${declarations}\n}`;
}

/** Indents every non-empty line of a block by two spaces. */
function indent(text: string): string {
  return text.replace(/^(?=.)/gm, '  ');
}

/** Serializes CSS variables for a selector. */
export function createKuiThemeCssText(
  theme: KuiGeneratedTheme,
  selector: string,
  mode: KuiThemeMode = 'light',
): string {
  return createRule(selector, createKuiThemeVariableMap(theme, mode));
}

/**
 * Serializes both default light and attribute-driven dark theme CSS inside the `kui.tokens` cascade
 * layer, so a declaration of the same variable that a consumer writes outside any layer always wins,
 * whatever the order of the style sheets.
 *
 * @remarks
 * Every contrast profile other than the default one adds the variables it changes, chosen by the
 * `data-kui-contrast` attribute on `<html>`. A profile with a media query also applies on its own
 * while the attribute is absent, so an explicit attribute always beats the user's system setting.
 */
export function createKuiThemeStyleSheet(theme: KuiGeneratedTheme): string {
  const rules = [
    createKuiThemeCssText(theme, LIGHT_SELECTOR, 'light'),
    createKuiThemeCssText(theme, DARK_SELECTOR, 'dark'),
    ...theme.contrast.flatMap(createContrastRules),
  ].join('\n\n');

  return `@layer kui.tokens {\n${indent(rules)}\n}`;
}

/**
 * The rules of one contrast profile: an attribute rule per mode, and for a profile with a media
 * query the same variables again behind the media query while no attribute is set.
 */
function createContrastRules(profile: KuiGeneratedContrast): string[] {
  const chosen = `[data-kui-contrast="${profile.name}"]`;
  const rules = [
    createRule(`:root${chosen}, [data-kui-theme="light"]${chosen}`, profile.light),
    createRule(`${DARK_SELECTOR}${chosen}`, profile.dark),
  ];

  if (profile.media) {
    const automatic = [
      createRule(':root:not([data-kui-contrast])', profile.light),
      createRule(`${DARK_SELECTOR}:not([data-kui-contrast])`, profile.dark),
    ].join('\n\n');

    rules.push(`@media ${profile.media} {\n${indent(automatic)}\n}`);
  }

  return rules;
}

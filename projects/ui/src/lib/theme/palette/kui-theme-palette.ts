import { lightnessForTone } from '../../foundation/color/kui-color-math';
import type { KuiOklchColor } from '../kui-theme-color.interface';
import type { KuiThemeMode } from '../kui-theme-mode.type';
import type {
  KuiColorScaleName,
  KuiCssVariableMap,
  KuiPaletteMap,
} from '../kui-theme-tokens.interface';
import { formatOklch } from './kui-theme-color-format';

/** The accent scales: every colour scale except the neutral one. */
export type KuiAccentName = Exclude<KuiColorScaleName, 'neutral'>;

/** The seed of each scale after parsing. */
export type KuiParsedSeeds = Record<KuiColorScaleName, KuiOklchColor>;

/** Tone (CIE L*) of accent steps 1-12; step 6 is the seed itself. */
const ACCENT_TONES = [97, 92, 85, 74, 62, null, 33, 22, 11, 4, 2, 0.5] as const;
const CHROMA_SCALE = [0.08, 0.15, 0.35, 0.6, 0.85, 1, 0.9, 0.75, 0.55, 0.35, 0.22, 0.12] as const;

/** OKLCH lightness of the twelve neutral steps in each mode; step 1 of light is pure white. */
const NEUTRAL_LIGHTNESS = {
  light: [1, 0.97, 0.95, 0.92, 0.88, 0.78, 0.75, 0.7, 0.66, 0.6, 0.46, 0.18],
  dark: [0.08, 0.1, 0.14, 0.18, 0.22, 0.27, 0.32, 0.35, 0.42, 0.52, 0.6, 0.93],
} as const;

/** Every colour scale, in the order its seed variable is written. */
export const SCALE_NAMES: readonly KuiColorScaleName[] = [
  'primary',
  'neutral',
  'success',
  'warning',
  'danger',
  'info',
];

/** The accent scales, in the order their palettes are written. */
export const ACCENT_NAMES: readonly KuiAccentName[] = [
  'primary',
  'success',
  'warning',
  'danger',
  'info',
];

/** Seed used for `info` when the options leave it out. */
export const FALLBACK_INFO_SEED = 'oklch(0.53 0.14 215)';

/**
 * Twelve steps of an accent: each step has a fixed tone, so contrast between steps does not depend
 * on the hue. Step 6 is the seed.
 */
export function createAccentRamp(seed: KuiOklchColor): readonly KuiOklchColor[] {
  return ACCENT_TONES.map((tone, index) => {
    if (tone === null) {
      return seed;
    }

    const chroma = seed.chroma * CHROMA_SCALE[index];
    return { lightness: lightnessForTone(chroma, seed.hue, tone), chroma, hue: seed.hue };
  });
}

/** Twelve neutral steps for one mode, tinted with the neutral seed's hue and chroma. */
export function createNeutralScale(
  seed: KuiOklchColor,
  mode: KuiThemeMode,
): readonly KuiOklchColor[] {
  return NEUTRAL_LIGHTNESS[mode].map((lightness, index) => ({
    lightness,
    chroma: mode === 'light' && index === 0 ? 0 : seed.chroma,
    hue: seed.hue,
  }));
}

/** The `--kui-seed-<scale>` variables. */
export function createSeedVariables(seeds: KuiParsedSeeds): KuiCssVariableMap {
  return Object.fromEntries(
    SCALE_NAMES.map((scaleName) => [`--kui-seed-${scaleName}`, formatOklch(seeds[scaleName])]),
  );
}

/** The `--kui-<accent>-<step>` variables of every accent palette. */
export function createPaletteVariables(palettes: KuiPaletteMap): KuiCssVariableMap {
  return Object.fromEntries(
    ACCENT_NAMES.flatMap((scaleName) =>
      palettes[scaleName].map((value, index) => [`--kui-${scaleName}-${index + 1}`, value]),
    ),
  );
}

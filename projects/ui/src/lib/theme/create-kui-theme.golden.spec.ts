import { createKuiTheme, createKuiThemeStyleSheet } from './create-kui-theme';
import { DEFAULT_KUI_THEME } from './default-kui-theme.const';
import type { KuiThemeOptions } from './kui-theme-options.interface';

/**
 * Pins the exact output of the theme generator for several seed sets: every variable, its value and
 * the order of the declarations. A structural change to the generator must leave these hashes
 * alone; a deliberate change to the theme updates them in the same commit, together with
 * `theme-default.css` (`pnpm generate:theme-css`).
 */
const SEED_SETS: Record<string, KuiThemeOptions> = {
  default: DEFAULT_KUI_THEME,
  roundedCompact: {
    seeds: { ...DEFAULT_KUI_THEME.seeds, radius: 14, density: 'compact' },
  },
  squareComfortable: {
    seeds: { ...DEFAULT_KUI_THEME.seeds, radius: 2, density: 'comfortable' },
  },
  warmBrand: {
    seeds: {
      ...DEFAULT_KUI_THEME.seeds,
      color: {
        ...DEFAULT_KUI_THEME.seeds.color,
        primary: '#e4572e',
        neutral: 'oklch(0.55 0.03 60)',
        success: '#2e9e5b',
      },
    },
  },
  coolBrand: {
    seeds: {
      ...DEFAULT_KUI_THEME.seeds,
      color: {
        ...DEFAULT_KUI_THEME.seeds.color,
        primary: 'oklch(62% 0.2 250)',
        neutral: 'oklch(0.5 0.02 250)',
        warning: 'oklch(0.7 0.16 90)',
        danger: '#c0152f',
        info: '#0a7fa8',
      },
    },
  },
  achromaticNeutral: {
    seeds: {
      ...DEFAULT_KUI_THEME.seeds,
      color: { ...DEFAULT_KUI_THEME.seeds.color, neutral: 'oklch(0.5 0 0)', primary: '#000' },
    },
  },
  midLightnessSeeds: {
    seeds: {
      ...DEFAULT_KUI_THEME.seeds,
      color: {
        primary: 'oklch(0.57 0.2 30)',
        neutral: 'oklch(0.57 0.01 120)',
        success: 'oklch(0.57 0.15 150)',
        warning: 'oklch(0.57 0.12 70)',
        danger: 'oklch(0.57 0.2 20)',
        info: 'oklch(0.57 0.1 230)',
      },
    },
  },
};

/** FNV-1a over the UTF-16 code units, enough to pin an output without storing it. */
function hash(text: string): string {
  let value = 0x811c9dc5;

  for (let index = 0; index < text.length; index += 1) {
    value ^= text.charCodeAt(index);
    value = Math.imul(value, 0x01000193) >>> 0;
  }

  return value.toString(16).padStart(8, '0');
}

const EXPECTED: Record<string, { readonly theme: string; readonly styleSheet: string }> = {
  default: { theme: 'ea807252', styleSheet: 'cee469c6' },
  roundedCompact: { theme: 'c8d9c9ff', styleSheet: '9e6acd72' },
  squareComfortable: { theme: '49f6ae00', styleSheet: '72b651a6' },
  warmBrand: { theme: '6b170280', styleSheet: '0bfb7a7a' },
  coolBrand: { theme: '8651a796', styleSheet: 'ca67c0a9' },
  achromaticNeutral: { theme: '69c32d46', styleSheet: 'ccffa5fd' },
  midLightnessSeeds: { theme: '8912ec73', styleSheet: 'edb1f62a' },
};

describe('createKuiTheme golden output', () => {
  for (const [name, options] of Object.entries(SEED_SETS)) {
    it(`keeps the exact output for ${name}`, () => {
      const theme = createKuiTheme(options);
      const actual = {
        theme: hash(JSON.stringify(theme)),
        styleSheet: hash(createKuiThemeStyleSheet(theme)),
      };

      expect(actual).toEqual(EXPECTED[name]);
    });
  }
});

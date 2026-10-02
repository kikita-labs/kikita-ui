import { createKuiTheme, createKuiThemeVariableMap } from './create-kui-theme';
import { DEFAULT_KUI_THEME } from './default-kui-theme.const';
import type { KuiOklchColor } from './kui-theme-color.interface';
import { contrastRatio, oklchToRgb8, toneOf } from './kui-theme-color-math';
import type { KuiThemeMode } from './kui-theme-mode.type';
import type { KuiThemeOptions } from './kui-theme-options.interface';
import type { KuiThemeColorSeeds } from './kui-theme-seeds.interface';

const OKLCH_PATTERN = /^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\s*\)$/;
const MIX_PATTERN = /^color-mix\(in oklab, (.+?) ([\d.]+)%, (.+)\)$/;
const REFERENCE_PATTERN = /^var\((--[\w-]+)\)$/;

function parseOklch(value: string): KuiOklchColor {
  const match = OKLCH_PATTERN.exec(value);

  if (!match) {
    throw new Error(`Not an oklch() colour: ${value}`);
  }

  return { lightness: Number(match[1]), chroma: Number(match[2]), hue: Number(match[3]) };
}

function toOklab(color: KuiOklchColor): readonly [number, number, number] {
  const angle = (color.hue * Math.PI) / 180;
  return [color.lightness, color.chroma * Math.cos(angle), color.chroma * Math.sin(angle)];
}

function mixInOklab(first: KuiOklchColor, share: number, second: KuiOklchColor): KuiOklchColor {
  const [l1, a1, b1] = toOklab(first);
  const [l2, a2, b2] = toOklab(second);
  const keep = share / 100;
  const a = a1 * keep + a2 * (1 - keep);
  const b = b1 * keep + b2 * (1 - keep);

  return {
    lightness: l1 * keep + l2 * (1 - keep),
    chroma: Math.hypot(a, b),
    hue: ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360,
  };
}

type Variables = Readonly<Record<string, string>>;

/** Resolves a value made of var() references, oklch() colours and color-mix() in OKLab. */
function resolveColor(variables: Variables, value: string): KuiOklchColor {
  const reference = REFERENCE_PATTERN.exec(value);

  if (reference) {
    const target = variables[reference[1]];

    if (target === undefined) {
      throw new Error(`Missing variable ${reference[1]}`);
    }

    return resolveColor(variables, target);
  }

  const mix = MIX_PATTERN.exec(value);

  if (mix) {
    return mixInOklab(
      resolveColor(variables, mix[1]),
      Number(mix[2]),
      resolveColor(variables, mix[3]),
    );
  }

  return parseOklch(value);
}

function role(variables: Variables, name: string): KuiOklchColor {
  return resolveColor(variables, `var(--kui-color-${name})`);
}

describe('colour maths', () => {
  it('measures the WCAG reference pairs', () => {
    const grey = (value: number): KuiOklchColor => {
      // Find the OKLab lightness of the grey whose sRGB byte is `value`.
      let low = 0;
      let high = 1;

      for (let step = 0; step < 40; step += 1) {
        const middle = (low + high) / 2;
        const [channel] = oklchToRgb8({ lightness: middle, chroma: 0, hue: 0 });

        if (channel < value) {
          low = middle;
        } else {
          high = middle;
        }
      }

      return { lightness: high, chroma: 0, hue: 0 };
    };
    const white = { lightness: 1, chroma: 0, hue: 0 };
    const black = { lightness: 0, chroma: 0, hue: 0 };

    expect(contrastRatio(black, white)).toBeCloseTo(21, 5);
    expect(contrastRatio(white, white)).toBeCloseTo(1, 5);
    expect(contrastRatio(grey(0x76), white)).toBeCloseTo(4.54, 2);
    expect(contrastRatio(grey(0x77), white)).toBeCloseTo(4.48, 2);
  });

  it('converts OKLCH reference colours to the expected sRGB bytes', () => {
    expect(oklchToRgb8({ lightness: 1, chroma: 0, hue: 0 })).toEqual([255, 255, 255]);
    expect(oklchToRgb8({ lightness: 0, chroma: 0, hue: 0 })).toEqual([0, 0, 0]);
    expect(oklchToRgb8({ lightness: 0.62796, chroma: 0.25768, hue: 29.2339 })).toEqual([255, 0, 0]);
  });

  it('keeps the tone of white and black at the ends of the scale', () => {
    expect(toneOf({ lightness: 1, chroma: 0, hue: 0 })).toBeCloseTo(100, 1);
    expect(toneOf({ lightness: 0, chroma: 0, hue: 0 })).toBeCloseTo(0, 1);
  });

  it('mixes in OKLab like the browser: 18% black into a purple fill', () => {
    const mixed = mixInOklab({ lightness: 0.52, chroma: 0.25, hue: 285 }, 82, {
      lightness: 0,
      chroma: 0,
      hue: 0,
    });

    expect(oklchToRgb8(mixed)).toEqual([76, 41, 183]);
  });
});

const ACCENTS = ['primary', 'success', 'warning', 'danger', 'info'] as const;
type Accent = (typeof ACCENTS)[number];
const SURFACES = ['bg', 'surface', 'surface-elevated', 'surface-sunken'] as const;

/** Seeds that exercise dark, light, saturated, grey and mid-lightness colours. */
const SEEDS_UNDER_TEST = [
  '#e11d48',
  '#f97316',
  '#facc15',
  '#84cc16',
  '#16a34a',
  '#0d9488',
  '#0ea5e9',
  '#2563eb',
  '#4f46e5',
  '#9333ea',
  '#db2777',
  '#93c5fd',
  '#1e3a8a',
  '#475569',
  '#f5f5f5',
  '#111111',
  '#8a8a8a',
  // The band where neither white nor near-black text reaches 4.5:1 on the raw seed.
  'oklch(0.565 0.05 30)',
  'oklch(0.575 0.05 30)',
  'oklch(0.585 0.05 30)',
  'oklch(0.575 0.12 150)',
  'oklch(0.575 0.15 250)',
  'oklch(0.57 0.2 300)',
] as const;

const NEUTRAL_SEEDS_UNDER_TEST = [
  'oklch(0.5 0.01 80)',
  'oklch(0.5 0.03 0)',
  'oklch(0.5 0.03 90)',
  'oklch(0.5 0.03 180)',
  'oklch(0.5 0.03 270)',
  'oklch(0.5 0 0)',
  'oklch(0.5 0.05 250)',
] as const;

function withColors(color: Partial<KuiThemeColorSeeds>): KuiThemeOptions {
  const { seeds } = DEFAULT_KUI_THEME;
  return { seeds: { ...seeds, color: { ...seeds.color, ...color } } };
}

interface ContrastPair {
  readonly id: string;
  readonly foreground: string;
  readonly background: string;
  readonly minimum: number;
}

function pairsFor(mode: KuiThemeMode, accents: readonly Accent[]): ContrastPair[] {
  const pairs: ContrastPair[] = [];
  const add = (group: string, foreground: string, background: string, minimum: number): void => {
    pairs.push({
      id: `${mode} ${group}: ${foreground} on ${background}`,
      foreground,
      background,
      minimum,
    });
  };

  for (const surface of SURFACES) {
    add('neutral text', 'text', surface, 4.5);
    add('neutral text', 'text-secondary', surface, 4.5);
    add('placeholder', 'text-placeholder', surface, 4.5);
    add('control border', 'border-control', surface, 3);
    add('control border hover', 'border-control-hover', surface, 3);
    add('focus indicator', 'focus', surface, 3);
  }

  add('neutral solid', 'neutral-on-fill', 'neutral-fill', 4.5);

  for (const accent of accents) {
    for (const state of ['fill', 'fill-hover', 'fill-active']) {
      add(`${accent} solid`, `${accent}-on-fill`, `${accent}-${state}`, 4.5);
    }

    for (const surface of SURFACES) {
      add(`${accent} indicator`, `${accent}-indicator`, surface, 3);
      add(`${accent} text`, `${accent}-text`, surface, 4.5);
    }

    for (const state of ['soft-bg', 'soft-bg-hover', 'soft-bg-active']) {
      if (state === 'soft-bg' || accent === 'primary' || accent === 'danger') {
        add(`${accent} soft`, `${accent}-soft-text`, `${accent}-${state}`, 4.5);
      }
    }
  }

  return pairs;
}

function failingPairs(options: KuiThemeOptions, accents: readonly Accent[] = ACCENTS): string[] {
  const theme = createKuiTheme(options);

  return (['light', 'dark'] as const).flatMap((mode) => {
    const variables: Variables = createKuiThemeVariableMap(theme, mode);

    return pairsFor(mode, accents)
      .filter(
        (pair) =>
          contrastRatio(role(variables, pair.foreground), role(variables, pair.background)) <
          pair.minimum,
      )
      .map((pair) => pair.id);
  });
}

/*
 * The contract: every colour pair the library draws meets WCAG 2.x (4.5:1 for text, 3:1 for
 * non-text), in both modes, for the default theme and for any seed. The same pairs, measured in
 * Chromium, Firefox and WebKit on the generated CSS, give the same result.
 */
describe('colour contrast contract', () => {
  it('holds for the default theme in both modes', () => {
    expect(failingPairs(DEFAULT_KUI_THEME)).toEqual([]);
  });

  it.each(ACCENTS)('holds for the %s role with every seed under test', (accent) => {
    const failures = SEEDS_UNDER_TEST.flatMap((seed) =>
      failingPairs(withColors({ [accent]: seed }), [accent]).map((id) => `${seed} ${id}`),
    );

    expect(failures).toEqual([]);
  });

  it('keeps neutral text, placeholders and control borders readable for any neutral seed', () => {
    const failures = NEUTRAL_SEEDS_UNDER_TEST.flatMap((neutral) =>
      failingPairs(withColors({ neutral }), []).map((id) => `${neutral} ${id}`),
    );

    expect(failures).toEqual([]);
  });
});

describe('accent ramp shape', () => {
  it('keeps the seed verbatim at step 6', () => {
    const theme = createKuiTheme(DEFAULT_KUI_THEME);

    for (const accent of ACCENTS) {
      expect(theme.palettes[accent][5]).toBe(theme.seeds[`--kui-seed-${accent}`]);
    }
  });

  it('gives steps other than 6 the same tone for every hue', () => {
    const toneSpread = (step: number): number => {
      const tones = Array.from({ length: 36 }, (_, index) => {
        const primary = `oklch(0.55 0.2 ${index * 10})`;
        const palette = createKuiTheme(withColors({ primary })).palettes.primary;

        return toneOf(parseOklch(palette[step - 1]));
      });

      return Math.max(...tones) - Math.min(...tones);
    };

    for (const step of [1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12]) {
      expect(toneSpread(step), `step ${step}`).toBeLessThan(0.05);
    }
  });

  it('places the steps at the documented tones', () => {
    const palette = createKuiTheme(DEFAULT_KUI_THEME).palettes.danger;
    const tones = [97, 92, 85, 74, 62, undefined, 33, 22, 11, 4, 2, 0.5];

    tones.forEach((tone, index) => {
      if (tone !== undefined) {
        expect(toneOf(parseOklch(palette[index])), `step ${index + 1}`).toBeCloseTo(tone, 0);
      }
    });
  });
});

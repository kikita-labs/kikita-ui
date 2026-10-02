import type { KuiOklchColor } from './kui-theme-color.interface';

/** An 8-bit sRGB colour as a browser paints it. */
export type KuiRgb8 = readonly [number, number, number];

const MAX_ITERATIONS = 50;

/** Converts OKLCH to linear sRGB without clipping; channels outside 0..1 are out of gamut. */
export function oklchToLinearSrgb(color: KuiOklchColor): readonly [number, number, number] {
  const a = color.chroma * Math.cos((color.hue * Math.PI) / 180);
  const b = color.chroma * Math.sin((color.hue * Math.PI) / 180);
  const l = (color.lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (color.lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (color.lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;

  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

function clip(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function encodeSrgb(linear: number): number {
  const value = clip(linear);
  return value <= 0.0031308 ? 12.92 * value : 1.055 * value ** (1 / 2.4) - 0.055;
}

/** The 8-bit sRGB colour a browser paints for an OKLCH value: out-of-gamut channels are clipped. */
export function oklchToRgb8(color: KuiOklchColor): KuiRgb8 {
  const [r, g, b] = oklchToLinearSrgb(color);
  return [
    Math.round(encodeSrgb(r) * 255),
    Math.round(encodeSrgb(g) * 255),
    Math.round(encodeSrgb(b) * 255),
  ];
}

function decodeSrgb(channel: number): number {
  const value = channel / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

/** WCAG 2.x contrast ratio of two colours as painted by a browser, from 1 to 21. */
export function contrastRatio(first: KuiOklchColor, second: KuiOklchColor): number {
  const luminance = (color: KuiOklchColor): number => {
    const [r, g, b] = oklchToRgb8(color);
    return 0.2126 * decodeSrgb(r) + 0.7152 * decodeSrgb(g) + 0.0722 * decodeSrgb(b);
  };
  const [lighter, darker] = [luminance(first), luminance(second)].sort((x, y) => y - x);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Tone of a colour: CIE L* of its luminance after clipping to sRGB. Contrast between two tones is
 * a function of their difference alone: a gap of 51 gives at least 4.5:1, a gap of 40 at least 3:1.
 */
export function toneOf(color: KuiOklchColor): number {
  const [r, g, b] = oklchToLinearSrgb(color).map(clip);
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

  return 116 * (luminance > 0.008856 ? Math.cbrt(luminance) : (903.3 * luminance + 16) / 116) - 16;
}

/** The OKLCH lightness at which a colour of the given chroma and hue reaches the target tone. */
export function lightnessForTone(chroma: number, hue: number, tone: number): number {
  let low = 0;
  let high = 1;

  for (let iteration = 0; iteration < MAX_ITERATIONS; iteration += 1) {
    const middle = (low + high) / 2;

    if (toneOf({ lightness: middle, chroma, hue }) < tone) {
      low = middle;
    } else {
      high = middle;
    }
  }

  return (low + high) / 2;
}

/** The three OKLCH components every conversion here needs; the theme's `KuiOklchColor` adds an alpha. */
export interface KuiOklch {
  /** Perceptual lightness from 0 to 1. */
  readonly lightness: number;

  /** Perceptual chroma. */
  readonly chroma: number;

  /** Hue angle in degrees. */
  readonly hue: number;
}

/** An 8-bit sRGB colour as a browser paints it. */
export type KuiRgb8 = readonly [number, number, number];

const MAX_ITERATIONS = 50;

/** Converts OKLCH to linear sRGB without clipping; channels outside 0..1 are out of gamut. */
export function oklchToLinearSrgb(color: KuiOklch): readonly [number, number, number] {
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
export function oklchToRgb8(color: KuiOklch): KuiRgb8 {
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
export function contrastRatio(first: KuiOklch, second: KuiOklch): number {
  const luminance = (color: KuiOklch): number => {
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
export function toneOf(color: KuiOklch): number {
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

/** Wraps a hue angle into the range from 0 (inclusive) to 360 (exclusive). */
export function normalizeHue(hue: number): number {
  return ((hue % 360) + 360) % 360;
}

/** The linear-light value of an sRGB channel given as 0..1. */
export function srgbToLinear(value: number): number {
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

/** The OKLCH colour of an 8-bit sRGB colour. The hue is wrapped into 0..360. */
export function srgb8ToOklch(red: number, green: number, blue: number): KuiOklch {
  const r = srgbToLinear(red / 255);
  const g = srgbToLinear(green / 255);
  const b = srgbToLinear(blue / 255);

  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);

  const lightness = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const bAxis = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;

  return {
    lightness,
    chroma: Math.sqrt(a * a + bAxis * bAxis),
    hue: normalizeHue((Math.atan2(bAxis, a) * 180) / Math.PI),
  };
}

/** The OKLCH colour of `#rgb` or `#rrggbb`, or `null` when the text is neither. */
export function hexToOklch(hex: string): KuiOklch | null {
  const normalized =
    hex.length === 4 ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}` : hex;

  if (!/^#[0-9a-f]{6}$/i.test(normalized)) {
    return null;
  }

  return srgb8ToOklch(
    parseInt(normalized.slice(1, 3), 16),
    parseInt(normalized.slice(3, 5), 16),
    parseInt(normalized.slice(5, 7), 16),
  );
}

/** Formats an 8-bit sRGB colour as lower-case `#rrggbb`. */
export function rgbToHex(red: number, green: number, blue: number): string {
  return `#${[red, green, blue].map((value) => value.toString(16).padStart(2, '0')).join('')}`;
}

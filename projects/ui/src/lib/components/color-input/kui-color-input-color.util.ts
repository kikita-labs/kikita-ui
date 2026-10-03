import { hexToOklch, oklchToRgb8, rgbToHex } from '../../foundation/color/kui-color-math';

const HEX_COLOR_RE = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;
const OKLCH_COLOR_RE =
  /^oklch\(\s*(?:0|1|0?\.\d+|\d+(?:\.\d+)?%)\s+\d*(?:\.\d+)?\s+\d+(?:\.\d+)?(?:\s*\/\s*(?:0|1|0?\.\d+|\d+(?:\.\d+)?%))?\s*\)$/i;

/** The highest chroma the picker offers; the right edge of its surface. */
export const KUI_COLOR_INPUT_MAX_CHROMA = 0.32;

/** A colour as the picker holds it: its hex value and its OKLCH components. */
export interface KuiParsedColor {
  /** Lower-case `#rrggbb`. */
  hex: string;

  /** OKLCH lightness from 0 to 1. */
  l: number;

  /** OKLCH chroma from 0 to the picker maximum. */
  c: number;

  /** OKLCH hue in degrees. */
  h: number;
}

/** Reads `#rgb`, `#rrggbb` or `oklch(L C H)` text, or returns `null` when it is neither. */
export function parseColor(value: string): KuiParsedColor | null {
  const trimmed = value.trim();
  const hex = normalizeHexForPicker(trimmed);
  if (hex) return hexToParsed(hex);
  return parseOklch(trimmed);
}

/** Clamps OKLCH components to what the picker can show and derives the hex value. */
export function normalizeOklch(l: number, c: number, h: number): KuiParsedColor {
  const nextL = Math.min(1, Math.max(0, l));
  const nextC = Math.min(KUI_COLOR_INPUT_MAX_CHROMA, Math.max(0, c));
  const nextH = h === 360 ? 360 : ((h % 360) + 360) % 360;
  const [r, g, b] = oklchToRgb8({ lightness: nextL, chroma: nextC, hue: nextH });
  return { hex: rgbToHex(r, g, b), l: nextL, c: nextC, h: nextH };
}

/** The picker colour of a hex value, or `null` when the text is not a hex colour. */
export function hexToParsed(hex: string): KuiParsedColor | null {
  const normalized = normalizeHexForPicker(hex);
  const oklch = normalized ? hexToOklch(normalized) : null;

  return normalized && oklch
    ? { hex: normalized, l: oklch.lightness, c: oklch.chroma, h: oklch.hue }
    : null;
}

function normalizeHexForPicker(value: string): string | null {
  if (!HEX_COLOR_RE.test(value)) return null;

  if (value.length === 4) {
    const [, r, g, b] = value;
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }

  return value.toLowerCase();
}

function parseOklch(value: string): KuiParsedColor | null {
  if (!OKLCH_COLOR_RE.test(value)) return null;
  const match = value.match(/^oklch\(\s*([^\s]+)\s+([^\s]+)\s+([^\s/)]+)/i);
  if (!match) return null;
  const l = match[1].endsWith('%') ? Number(match[1].slice(0, -1)) / 100 : Number(match[1]);
  const c = Number(match[2]);
  const h = Number(match[3]);
  if (!Number.isFinite(l) || !Number.isFinite(c) || !Number.isFinite(h)) return null;
  return normalizeOklch(l, c, h);
}

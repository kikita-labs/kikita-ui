import { hexToOklch, normalizeHue } from '../../foundation/color/kui-color-math';
import type { KuiOklchColor } from '../kui-theme-color.interface';

/** Parses a seed colour written as `#rgb`, `#rrggbb` or `oklch(L C H [/ A])`. */
export function parseKuiColor(color: string): KuiOklchColor {
  if (color.startsWith('#')) {
    const parsed = hexToOklch(color);

    if (!parsed) {
      throw new Error(`Unsupported hex color "${color}". Use #rgb or #rrggbb.`);
    }

    return parsed;
  }

  const match = /^oklch\(\s*([0-9.]+%?)\s+([0-9.]+)\s+([0-9.]+)(?:\s*\/\s*([0-9.]+))?\s*\)$/i.exec(
    color,
  );

  if (!match) {
    throw new Error(`Unsupported Kikita UI seed color "${color}". Use hex or oklch().`);
  }

  return {
    lightness: parseLightness(match[1]),
    chroma: Number(match[2]),
    hue: normalizeHue(Number(match[3])),
    alpha: match[4] === undefined ? undefined : Number(match[4]),
  };
}

function parseLightness(value: string): number {
  return value.endsWith('%') ? Number(value.slice(0, -1)) / 100 : Number(value);
}

/** Serialises a colour as `oklch(L C H)` or `oklch(L C H / A)` with four decimals at most. */
export function formatOklch(color: KuiOklchColor): string {
  const base = `oklch(${round(color.lightness)} ${round(color.chroma)} ${round(color.hue)})`;
  return color.alpha === undefined ? base : base.replace(')', ` / ${round(color.alpha)})`);
}

function round(value: number): string {
  return Number(value.toFixed(4)).toString();
}

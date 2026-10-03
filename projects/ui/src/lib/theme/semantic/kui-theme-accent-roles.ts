import { contrastRatio } from '../../foundation/color/kui-color-math';
import type { KuiOklchColor } from '../kui-theme-color.interface';
import type { KuiThemeMode } from '../kui-theme-mode.type';
import type { KuiCssVariableMap } from '../kui-theme-tokens.interface';
import { formatOklch } from '../palette/kui-theme-color-format';
import type { KuiAccentName } from '../palette/kui-theme-palette';

const WHITE: KuiOklchColor = { lightness: 1, chroma: 0, hue: 0 };
const NEAR_BLACK: KuiOklchColor = { lightness: 0.15, chroma: 0, hue: 0 };
const BLACK_TEXT = 'oklch(0 0 0)';

/** Pure white text, written as a colour value. */
export const WHITE_TEXT = 'oklch(1 0 0)';

const MIN_TEXT_CONTRAST = 4.5;
const MIN_NON_TEXT_CONTRAST = 3;

/** Share of the away colour mixed into a solid fill for hover and pressed states, by mode. */
const STATE_MIX = {
  light: { hover: 18, active: 36 },
  dark: { hover: 28, active: 8 },
} as const;

/** Best contrast either text colour reaches on a solid fill. */
function bestOnFillContrast(fill: KuiOklchColor): number {
  return Math.max(contrastRatio(WHITE, fill), contrastRatio(NEAR_BLACK, fill));
}

/** White or near-black, whichever reads better on the fill. */
function chooseOnFill(fill: KuiOklchColor): KuiOklchColor {
  return contrastRatio(WHITE, fill) >= contrastRatio(NEAR_BLACK, fill) ? WHITE : NEAR_BLACK;
}

/**
 * Moves the lightness of a seed by the smallest amount that lets white or near-black text reach
 * 4.5:1 on it. Seeds around OKLCH lightness 0.57 are the only ones that need it.
 */
function correctSolidFill(fill: KuiOklchColor): KuiOklchColor {
  if (bestOnFillContrast(fill) >= MIN_TEXT_CONTRAST) {
    return fill;
  }

  for (let step = 1; step <= 300; step += 1) {
    const darker = { ...fill, lightness: Math.max(0, fill.lightness - step / 1000) };
    const lighter = { ...fill, lightness: Math.min(1, fill.lightness + step / 1000) };
    const darkerPasses = bestOnFillContrast(darker) >= MIN_TEXT_CONTRAST;
    const lighterPasses = bestOnFillContrast(lighter) >= MIN_TEXT_CONTRAST;

    if (darkerPasses || lighterPasses) {
      const preferDarker =
        darkerPasses &&
        (!lighterPasses || bestOnFillContrast(darker) >= bestOnFillContrast(lighter));
      return preferDarker ? darker : lighter;
    }
  }

  return fill;
}

/** The solid, soft and text roles of one accent in one mode. */
export function createAccentVariables(
  mode: KuiThemeMode,
  name: KuiAccentName,
  ramp: readonly KuiOklchColor[],
  modeNeutral: readonly KuiOklchColor[],
): KuiCssVariableMap {
  const prefix = `--kui-color-${name}` as const;
  const step = (index: number): string => `var(--kui-${name}-${index})`;
  const light = mode === 'light';
  const seed = ramp[5];
  // The fill is the same brand colour in both modes; its text colour is chosen by measured contrast.
  const solid = correctSolidFill(seed);
  const onFill = chooseOnFill(solid);
  const away = onFill === WHITE ? BLACK_TEXT : WHITE_TEXT;
  const share = STATE_MIX[mode];
  const mix = (percent: number, toward: string): string =>
    `color-mix(in oklab, var(${prefix}-fill) ${100 - percent}%, ${toward})`;
  // Steps the surface roles read: 1 to 3 in light mode, 1 to 4 in dark mode.
  const surfaces = modeNeutral.slice(0, light ? 3 : 4);
  const fillIsIndicator = surfaces.every(
    (surface) => contrastRatio(solid, surface) >= MIN_NON_TEXT_CONTRAST,
  );

  const variables: Record<`--kui-${string}`, string> = {
    [`${prefix}-fill`]: solid === seed ? step(6) : formatOklch(solid),
    [`${prefix}-on-fill`]: formatOklch(onFill),
    [`${prefix}-fill-away`]: away,
    [`${prefix}-fill-hover`]: mix(share.hover, `var(${prefix}-fill-away)`),
    [`${prefix}-fill-active`]: mix(share.active, `var(${prefix}-fill-away)`),
    [`${prefix}-indicator`]: fillIsIndicator ? `var(${prefix}-fill)` : step(light ? 7 : 5),
    [`${prefix}-soft-bg`]: step(light ? 1 : 11),
    [`${prefix}-soft-text`]: step(light ? 8 : 4),
    [`${prefix}-soft-border`]: step(light ? 4 : 8),
    [`${prefix}-text`]: step(light ? 8 : 4),
  };

  if (name === 'primary' || name === 'danger') {
    variables[`${prefix}-soft-bg-hover`] = step(light ? 2 : 10);
    variables[`${prefix}-soft-bg-active`] = step(light ? 3 : 9);
  }

  return variables;
}

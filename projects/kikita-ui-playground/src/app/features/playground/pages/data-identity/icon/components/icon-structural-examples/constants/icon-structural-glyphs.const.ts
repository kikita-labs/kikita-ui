import type { KuiIconGlyph, KuiIconsOptions } from '@kikita-labs/ui';

/*
 * Replacement glyphs for the structural-icon override example. Geometry comes from Lucide
 * (https://lucide.dev, ISC); the data is plain 24 by 24 icon data, not markup.
 */

const CIRCLE_X: KuiIconGlyph = {
  node: [
    ['circle', { cx: 12, cy: 12, r: 10 }],
    ['path', { d: 'm15 9-6 6' }],
    ['path', { d: 'm9 9 6 6' }],
  ],
};

const ARROW_LEFT: KuiIconGlyph = {
  node: [
    ['path', { d: 'm12 19-7-7 7-7' }],
    ['path', { d: 'M19 12H5' }],
  ],
};

const ARROW_RIGHT: KuiIconGlyph = {
  node: [
    ['path', { d: 'M5 12h14' }],
    ['path', { d: 'm12 5 7 7-7 7' }],
  ],
};

const ARROW_LEFT_TO_LINE: KuiIconGlyph = {
  node: [
    ['path', { d: 'M3 19V5' }],
    ['path', { d: 'm13 6-6 6 6 6' }],
    ['path', { d: 'M7 12h14' }],
  ],
};

const ARROW_RIGHT_TO_LINE: KuiIconGlyph = {
  node: [
    ['path', { d: 'M17 12H3' }],
    ['path', { d: 'm11 18 6-6-6-6' }],
    ['path', { d: 'M21 5v14' }],
  ],
};

/** `defaults.icons` roles replaced in the override column of the structural-icon example. */
export const ICON_STRUCTURAL_OVERRIDES: KuiIconsOptions = {
  close: CIRCLE_X,
  remove: CIRCLE_X,
  previous: ARROW_LEFT,
  next: ARROW_RIGHT,
  first: ARROW_LEFT_TO_LINE,
  last: ARROW_RIGHT_TO_LINE,
};

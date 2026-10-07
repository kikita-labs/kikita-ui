import type { KuiIconGlyph } from '@kikita-labs/ui';

/** Lucide `circle-check` (ISC) as plain glyph data on the 24 by 24 grid. */
export const ICON_STROKE_DEMO_GLYPH: KuiIconGlyph = {
  node: [
    ['circle', { cx: 12, cy: 12, r: 10 }],
    ['path', { d: 'm9 12 2 2 4-4' }],
  ],
};

/** Stroke widths compared in the `strokeWidth` row; 2 is the Lucide default weight. */
export const ICON_STROKE_WIDTHS = [1, 1.5, 2, 3] as const;

/** Icon sizes used to compare a scaling stroke with a constant-pixel stroke. */
export const ICON_STROKE_SIZES = [24, 48, 96] as const;

/** Stroke weights applied to structural icons through `--kui-icon-stroke-width`. */
export const ICON_CHROME_STROKE_VARIANTS = [
  {
    id: 'thin',
    label: 'icon.labels.chromeThin',
    accessibility: 'icon.accessibility.chromeThin',
  },
  {
    id: 'default',
    label: 'icon.labels.chromeDefault',
    accessibility: 'icon.accessibility.chromeDefault',
  },
  {
    id: 'thick',
    label: 'icon.labels.chromeThick',
    accessibility: 'icon.accessibility.chromeThick',
  },
] as const;

import type { KuiIconGlyph } from './kui-icon-glyph.type';

/*
 * Built-in glyphs of Kikita UI's own chrome. Geometry comes from Lucide (https://lucide.dev, ISC)
 * on a 24 by 24 grid, matching the default icon set. Every constant is a plain literal so a build
 * drops the ones an application never reaches.
 */

/** @internal Close, remove and clear mark. */
export const KUI_GLYPH_X: KuiIconGlyph = {
  node: [
    ['path', { d: 'M18 6 6 18' }],
    ['path', { d: 'm6 6 12 12' }],
  ],
};

/** @internal Check mark. */
export const KUI_GLYPH_CHECK: KuiIconGlyph = { node: [['path', { d: 'M20 6 9 17l-5-5' }]] };

/** @internal Chevron pointing down. */
export const KUI_GLYPH_CHEVRON_DOWN: KuiIconGlyph = { node: [['path', { d: 'm6 9 6 6 6-6' }]] };

/** @internal Chevron pointing left. */
export const KUI_GLYPH_CHEVRON_LEFT: KuiIconGlyph = { node: [['path', { d: 'm15 18-6-6 6-6' }]] };

/** @internal Chevron pointing right. */
export const KUI_GLYPH_CHEVRON_RIGHT: KuiIconGlyph = { node: [['path', { d: 'm9 18 6-6-6-6' }]] };

/** @internal Double chevron pointing left. */
export const KUI_GLYPH_CHEVRONS_LEFT: KuiIconGlyph = {
  node: [
    ['path', { d: 'm11 17-5-5 5-5' }],
    ['path', { d: 'm18 17-5-5 5-5' }],
  ],
};

/** @internal Double chevron pointing right. */
export const KUI_GLYPH_CHEVRONS_RIGHT: KuiIconGlyph = {
  node: [
    ['path', { d: 'm6 17 5-5-5-5' }],
    ['path', { d: 'm13 17 5-5-5-5' }],
  ],
};

/** @internal Info status: circle with an "i". */
export const KUI_GLYPH_INFO: KuiIconGlyph = {
  node: [
    ['circle', { cx: 12, cy: 12, r: 10 }],
    ['path', { d: 'M12 16v-4' }],
    ['path', { d: 'M12 8h.01' }],
  ],
};

/** @internal Success status: circle with a check. */
export const KUI_GLYPH_CIRCLE_CHECK: KuiIconGlyph = {
  node: [
    ['circle', { cx: 12, cy: 12, r: 10 }],
    ['path', { d: 'm9 12 2 2 4-4' }],
  ],
};

/** @internal Danger status: circle with a cross. */
export const KUI_GLYPH_CIRCLE_X: KuiIconGlyph = {
  node: [
    ['circle', { cx: 12, cy: 12, r: 10 }],
    ['path', { d: 'm15 9-6 6' }],
    ['path', { d: 'm9 9 6 6' }],
  ],
};

/** @internal Warning status: triangle with an exclamation mark. */
export const KUI_GLYPH_TRIANGLE_ALERT: KuiIconGlyph = {
  node: [
    ['path', { d: 'm21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3' }],
    ['path', { d: 'M12 9v4' }],
    ['path', { d: 'M12 17h.01' }],
  ],
};

/** @internal Error mark: circle with an exclamation mark. */
export const KUI_GLYPH_CIRCLE_ALERT: KuiIconGlyph = {
  node: [
    ['circle', { cx: 12, cy: 12, r: 10 }],
    ['line', { x1: 12, x2: 12, y1: 8, y2: 12 }],
    ['line', { x1: 12, x2: 12.01, y1: 16, y2: 16 }],
  ],
};

/** @internal External link arrow. */
export const KUI_GLYPH_EXTERNAL_LINK: KuiIconGlyph = {
  node: [
    ['path', { d: 'M15 3h6v6' }],
    ['path', { d: 'M10 14 21 3' }],
    ['path', { d: 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6' }],
  ],
};

/** @internal Magnifier. */
export const KUI_GLYPH_SEARCH: KuiIconGlyph = {
  node: [
    ['circle', { cx: 11, cy: 11, r: 8 }],
    ['path', { d: 'm21 21-4.34-4.34' }],
  ],
};

/** @internal Magnifier with a plus. */
export const KUI_GLYPH_ZOOM_IN: KuiIconGlyph = {
  node: [
    ['circle', { cx: 11, cy: 11, r: 8 }],
    ['path', { d: 'm21 21-4.34-4.34' }],
    ['path', { d: 'M8 11h6' }],
    ['path', { d: 'M11 8v6' }],
  ],
};

/** @internal Magnifier with a minus. */
export const KUI_GLYPH_ZOOM_OUT: KuiIconGlyph = {
  node: [
    ['circle', { cx: 11, cy: 11, r: 8 }],
    ['path', { d: 'm21 21-4.34-4.34' }],
    ['path', { d: 'M8 11h6' }],
  ],
};

/** @internal Calendar. */
export const KUI_GLYPH_CALENDAR: KuiIconGlyph = {
  node: [
    ['rect', { x: 3, y: 4, width: 18, height: 18, rx: 2 }],
    ['path', { d: 'M8 2v4M16 2v4M3 10h18' }],
  ],
};

/** @internal Clock. Matches the approved Time Picker design record. */
export const KUI_GLYPH_CLOCK: KuiIconGlyph = {
  node: [
    ['circle', { cx: 12, cy: 12, r: 9 }],
    ['path', { d: 'M12 7v5l3.5 2' }],
  ],
};

/** @internal Copy to clipboard. */
export const KUI_GLYPH_COPY: KuiIconGlyph = {
  node: [
    ['rect', { width: 14, height: 14, x: 8, y: 8, rx: 2, ry: 2 }],
    ['path', { d: 'M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2' }],
  ],
};

/** @internal Cloud with an upload arrow. */
export const KUI_GLYPH_CLOUD_UPLOAD: KuiIconGlyph = {
  node: [
    ['path', { d: 'M12 13v8' }],
    ['path', { d: 'M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242' }],
    ['path', { d: 'm8 17 4-4 4 4' }],
  ],
};

/** @internal File. */
export const KUI_GLYPH_FILE: KuiIconGlyph = {
  node: [
    [
      'path',
      {
        d: 'M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z',
      },
    ],
    ['path', { d: 'M14 2v5a1 1 0 0 0 1 1h5' }],
  ],
};

/** @internal Closed folder. */
export const KUI_GLYPH_FOLDER: KuiIconGlyph = {
  node: [
    [
      'path',
      {
        d: 'M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z',
      },
    ],
  ],
};

/** @internal Open folder. */
export const KUI_GLYPH_FOLDER_OPEN: KuiIconGlyph = {
  node: [
    [
      'path',
      {
        d: 'm6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2',
      },
    ],
  ],
};

/** @internal Small plus on a 16 by 16 grid. */
export const KUI_GLYPH_PLUS_MINI: KuiIconGlyph = {
  viewBox: '0 0 16 16',
  node: [['path', { d: 'M8 3v10M3 8h10' }]],
};

/** @internal Filled play triangle. Fills are set per element, so the stroke is switched off. */
export const KUI_GLYPH_PLAY: KuiIconGlyph = {
  node: [['path', { d: 'M6 3v18l15-9z', fill: 'currentColor', stroke: 'none' }]],
};

/** @internal Filled pause bars. */
export const KUI_GLYPH_PAUSE: KuiIconGlyph = {
  node: [
    ['path', { d: 'M6 4h4v16H6z', fill: 'currentColor', stroke: 'none' }],
    ['path', { d: 'M14 4h4v16h-4z', fill: 'currentColor', stroke: 'none' }],
  ],
};

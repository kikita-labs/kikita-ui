/**
 * Path data for Kikita UI's own internal chrome (chevrons, clear buttons, status glyphs, etc).
 * Sourced from Lucide (https://lucide.dev) for visual consistency with the library's default
 * icon set, but rendered as static inline SVG in each component -- not through `kui-icon` --
 * so this internal chrome never depends on the network or a consumer's icon configuration.
 *
 * Every path assumes a 24x24 viewBox, matching Lucide's own coordinate system.
 */

export const KUI_CHEVRON_DOWN_D = 'm6 9 6 6 6-6';
export const KUI_CHEVRON_LEFT_D = 'm15 18-6-6 6-6';
export const KUI_CHEVRON_RIGHT_D = 'm9 18 6-6-6-6';

export const KUI_CHEVRONS_LEFT_D = ['m11 17-5-5 5-5', 'm18 17-5-5 5-5'] as const;
export const KUI_CHEVRONS_RIGHT_D = ['m6 17 5-5-5-5', 'm13 17 5-5-5-5'] as const;

export const KUI_X_D = ['M18 6 6 18', 'm6 6 12 12'] as const;

export const KUI_CHECK_D = 'M20 6 9 17l-5-5';

export const KUI_PLUS_D = ['M5 12h14', 'M12 5v14'] as const;

export const KUI_SEARCH_CIRCLE = { cx: 11, cy: 11, r: 8 } as const;
export const KUI_SEARCH_HANDLE_D = 'm21 21-4.34-4.34';

export const KUI_CALENDAR_RECT = { x: 3, y: 4, width: 18, height: 18, rx: 2 } as const;
export const KUI_CALENDAR_D = 'M8 2v4M16 2v4M3 10h18';

export const KUI_TRIANGLE_ALERT_D = [
  'm21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3',
  'M12 9v4',
  'M12 17h.01',
] as const;

export const KUI_CIRCLE_ALERT_CIRCLE = { cx: 12, cy: 12, r: 10 } as const;
export const KUI_CIRCLE_ALERT_LINE = { x1: 12, x2: 12, y1: 8, y2: 12 } as const;
export const KUI_CIRCLE_ALERT_DOT = { x1: 12, x2: 12.01, y1: 16, y2: 16 } as const;

export const KUI_CIRCLE_CHECK_CIRCLE = { cx: 12, cy: 12, r: 10 } as const;
export const KUI_CIRCLE_CHECK_D = 'm9 12 2 2 4-4';

export const KUI_CIRCLE_X_CIRCLE = { cx: 12, cy: 12, r: 10 } as const;
export const KUI_CIRCLE_X_D = ['m15 9-6 6', 'm9 9 6 6'] as const;

export const KUI_INFO_CIRCLE = { cx: 12, cy: 12, r: 10 } as const;
export const KUI_INFO_LINE_D = 'M12 16v-4';
export const KUI_INFO_DOT_D = 'M12 8h.01';

export const KUI_COPY_RECT = { width: 14, height: 14, x: 8, y: 8, rx: 2, ry: 2 } as const;
export const KUI_COPY_D = 'M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2';

export const KUI_CLOUD_UPLOAD_D = [
  'M12 13v8',
  'M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242',
  'm8 17 4-4 4 4',
] as const;

export const KUI_FILE_D = [
  'M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z',
  'M14 2v5a1 1 0 0 0 1 1h5',
] as const;

export const KUI_FOLDER_D =
  'M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z';

export const KUI_FOLDER_OPEN_D =
  'm6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2';

export const KUI_PLUS_MINI_D = 'M8 3v10M3 8h10';

/**
 * Clock glyph used as `input[kuiTimePicker]`'s leading affix icon. Not part of the original
 * Lucide-derived set above (no clock existed in this file yet); this exact path was drafted in
 * the Claude Design Time Picker spec (`04 Time Picker.dc.html`) and approved by the user as the
 * component's chrome icon, matching Lucide's own `clock` glyph coordinates.
 */
export const KUI_CLOCK_CIRCLE = { cx: 12, cy: 12, r: 9 } as const;
export const KUI_CLOCK_D = 'M12 7v5l3.5 2';

/**
 * External-link glyph auto-rendered by `[kuiLink]` when `external` resolves to `true` and no
 * explicit `iconEnd` is set. It is the library's own fixed chrome for that state, not a
 * consumer-chosen icon, so it renders as static inline SVG here rather than through the async
 * `kui-icon` name registry -- the same treatment `KUI_CALENDAR_D`/`KUI_CLOCK_D` get.
 */
export const KUI_EXTERNAL_LINK_D = [
  'M15 3h6v6',
  'M10 14 21 3',
  'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6',
] as const;

/**
 * Close/Prev/Next/Zoom in/Zoom out on `kui-media-viewer`'s lightbox toolbar are essential-to-
 * operate chrome, not consumer-chosen decoration, so they render as static inline SVG here
 * instead of through the async name-resolved `kui-icon` -- the same treatment
 * `kui-pagination`'s First/Prev/Next/Last already get, and for the same reason (no network
 * dependency for controls the lightbox cannot function without). Zoom in/out reuse the search
 * icon's circle/handle shape (`KUI_SEARCH_CIRCLE`/`KUI_SEARCH_HANDLE_D` above), matching Lucide's
 * own `zoom-in`/`zoom-out` glyphs, which are the `search` magnifier plus a `+`/`-` mark inside.
 */
export const KUI_ZOOM_LINE_H_D = 'M8 11h6';
export const KUI_ZOOM_LINE_V_D = 'M11 8v6';

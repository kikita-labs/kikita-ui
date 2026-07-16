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

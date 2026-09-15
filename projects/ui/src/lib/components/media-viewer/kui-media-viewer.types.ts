/** A single photo shown by {@link kuiMediaViewer}. */
export interface KuiMediaViewerItem {
  /**
   * Stable identifier, used for `trackBy` and to key per-photo load/error state. Optional --
   * `src` is a natural stable key for a photo (the same URL is the same photo regardless of
   * position in `items`, and static asset lists rarely have a separate id of their own), so it is
   * used as the fallback when `id` is omitted. Pass an explicit `id` only when two items can
   * legitimately share the same `src` (rare for photos).
   */
  readonly id?: string;
  /** Image URL. The viewer never fetches or transforms this itself. */
  readonly src: string;
  /**
   * Accessible/alt text for the photo. Required, not defaulted to `''`, the same way the native
   * `alt` attribute itself is required by the HTML spec for meaningful `<img>` content -- a media
   * viewer's whole purpose is looking at photos, so a silently empty default would leave every
   * photo undescribed unless the consumer happens to remember to add it. Pass `alt: ''` explicitly
   * for a genuinely decorative photo; that is a deliberate choice, not an accidental omission.
   */
  readonly alt: string;
}

/**
 * Input passed to {@link kuiMediaViewer}'s opener function.
 *
 * Photos only -- video is intentionally out of scope, matching the Claude Design brief for
 * `06 Media Viewer.dc.html`.
 */
export interface KuiMediaViewerData {
  /** Photos to browse. Must contain at least one item. */
  readonly items: readonly KuiMediaViewerItem[];
  /** Index to open on. Clamped to the valid range. Defaults to `0`. */
  readonly index?: number;
  /** Upper zoom bound. Defaults to `3`. */
  readonly maxZoom?: number;
  /** Zoom increment per step. Defaults to `0.5`. */
  readonly zoomStep?: number;
  /**
   * Base accessible name for the lightbox panel. The current position ("2 of 9") is appended
   * automatically. Defaults to `'Photo viewer'`.
   */
  readonly ariaLabel?: string;
  /** Called every time the viewed index changes, including the initial open. */
  onIndexChange?(index: number): void;
}

/**
 * Available width presets for a dialog panel.
 *
 * `'fullscreen'` covers the entire viewport with no radius, border, shadow, or padding of its
 * own, for content that needs to own its full layout (for example `kui-media-viewer`'s lightbox).
 * It is a plain width/chrome preset, not a distinct dialog variant: dismissable/closable, the
 * backdrop, focus trap, and Escape handling all stay exactly as configured.
 */
export type KuiDialogSize = 'auto' | 'sm' | 'md' | 'lg' | 'fullscreen';

/** Visual intent of the dialog, affects `.kui-dialog-icon` color. */
export type KuiDialogAppearance = 'default' | 'danger' | 'warning';

/** Options passed to {@link KuiDialogService.open} or {@link kuiDialog}. */
export interface KuiDialogConfig<TData = unknown> {
  /** Arbitrary data injected into the dialog component via {@link KUI_DIALOG_CONTEXT}. */
  data?: TData;
  /** Width preset. Defaults to `'md'` (560 px). */
  size?: KuiDialogSize;
  /** Visual intent. Colors `.kui-dialog-icon` and used by `kuiConfirm()` to pick button appearance. Defaults to `'default'`. */
  appearance?: KuiDialogAppearance;
  /** Allow closing via backdrop click or Escape key. Defaults to `true`. */
  dismissable?: boolean;
  /** Show the close button in the dialog header. Defaults to `true`. */
  closable?: boolean;
}

/** Available width presets for a dialog panel. */
export type KuiDialogSize = 'auto' | 'sm' | 'md' | 'lg';

/** Options passed to {@link KuiDialogService.open} or {@link kuiDialog}. */
export interface KuiDialogConfig<TData = unknown> {
  /** Arbitrary data injected into the dialog component via {@link KUI_DIALOG_CONTEXT}. */
  data?: TData;
  /** Width preset. Defaults to `'md'` (560 px). */
  size?: KuiDialogSize;
  /** Allow closing via backdrop click or Escape key. Defaults to `true`. */
  dismissable?: boolean;
  /** Show the × close button in the dialog header. Defaults to `true`. */
  closable?: boolean;
}

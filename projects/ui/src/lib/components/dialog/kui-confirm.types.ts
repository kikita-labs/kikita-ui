import type { KuiDialogAppearance } from './kui-dialog.types';

/** Options for {@link kuiConfirm}. */
export interface KuiConfirmConfig {
  /** Dialog title shown in the header. */
  title: string;
  /** Optional body text. Omit for header-only layout. */
  message?: string;
  /** Visual intent. Affects icon color and confirm button appearance. Defaults to `'default'`. */
  appearance?: KuiDialogAppearance;
  /** Label for the confirm button. Defaults to `'OK'`. */
  confirmLabel?: string;
  /** Label for the cancel button. Defaults to `'Cancel'`. */
  cancelLabel?: string;
}

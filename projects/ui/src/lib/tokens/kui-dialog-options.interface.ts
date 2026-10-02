import type { KuiDialogAppearance, KuiDialogSize } from '../components/dialog/kui-dialog.types';
import type { KuiModalSurfaceOptions } from './kui-modal-options.interface';

/** Defaults for dialogs opened with `kuiDialog`, set under the `dialog` key of the component defaults. */
export interface KuiDialogOptions extends KuiModalSurfaceOptions {
  /** Dialog width preset. */
  readonly size?: KuiDialogSize;

  /** Visual intent of the dialog. */
  readonly appearance?: KuiDialogAppearance;

  /** Closes the dialog on Escape and on a backdrop click. */
  readonly dismissable?: boolean;
}

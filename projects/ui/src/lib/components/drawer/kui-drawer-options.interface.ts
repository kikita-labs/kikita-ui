import type { KuiModalSurfaceOptions } from '../../types/kui-modal-options.interface';
import type { KuiDrawerSide, KuiDrawerSize } from './kui-drawer.types';

/** Defaults for drawers opened with `kuiDrawer`, set under the `drawer` key of the component defaults. */
export interface KuiDrawerOptions extends KuiModalSurfaceOptions {
  /** Edge the drawer slides in from. */
  readonly side?: KuiDrawerSide;

  /** Drawer size preset. */
  readonly size?: KuiDrawerSize;

  /** Closes the drawer on a backdrop click. */
  readonly closeOnBackdropClick?: boolean;

  /** Closes the drawer on Escape. */
  readonly closeOnEscape?: boolean;
}

import type { KuiOverlayPositionOptions } from '../../types/kui-overlay-options.interface';
import type { KuiMenuAlign } from './kui-menu-align.type';

/** Defaults for `kui-menu`, set under the `menu` key of the component defaults. */
export interface KuiMenuOptions extends KuiOverlayPositionOptions {
  /** Alignment along the trigger edge. */
  readonly menuAlign?: KuiMenuAlign;

  /** Minimum panel width as a CSS length. */
  readonly minWidth?: string | null;
}

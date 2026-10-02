import type { KuiMenuAlign } from '../components/menu/kui-menu-align.type';
import type { KuiOverlayPositionOptions } from './kui-overlay-options.interface';

/** Defaults for `kui-menu`, set under the `menu` key of the component defaults. */
export interface KuiMenuOptions extends KuiOverlayPositionOptions {
  /** Alignment along the trigger edge. */
  readonly menuAlign?: KuiMenuAlign;

  /** Minimum panel width as a CSS length. */
  readonly minWidth?: string | null;
}

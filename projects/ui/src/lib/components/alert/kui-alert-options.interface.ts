import type { KuiAlertShape } from './kui-alert-shape.type';
import type { KuiAlertSize } from './kui-alert-size.type';

/** Defaults for `kui-alert`, set under the `alert` key of the component defaults. */
export interface KuiAlertOptions {
  /** Component size. Takes precedence over the global `defaults.size`. */
  readonly size?: KuiAlertSize;

  /** Default shape. */
  readonly shape?: KuiAlertShape;

  /** Shows the leading status icon. */
  readonly showIcon?: boolean;

  /** Shows the close button. */
  readonly closable?: boolean;
}

import type { KuiSize } from '../types';

/** Defaults for `input[type=checkbox][kuiSwitch]`, set under the `switch` key of the component defaults. */
export interface KuiSwitchOptions {
  /** Component size. Takes precedence over the global `defaults.size`. */
  readonly size?: KuiSize;
}

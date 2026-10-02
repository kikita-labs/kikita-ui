import type { KuiSize } from '../types';

/** Defaults for `input[type=radio][kuiRadio]`, set under the `radio` key of the component defaults. */
export interface KuiRadioOptions {
  /** Component size. Takes precedence over the global `defaults.size`. */
  readonly size?: KuiSize;
}

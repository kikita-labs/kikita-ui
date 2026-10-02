import type { KuiSize } from '../types';

/** Defaults for `input[type=checkbox][kuiCheckbox]`, set under the `checkbox` key of the component defaults. */
export interface KuiCheckboxOptions {
  /** Component size. Takes precedence over the global `defaults.size`. */
  readonly size?: KuiSize;
}

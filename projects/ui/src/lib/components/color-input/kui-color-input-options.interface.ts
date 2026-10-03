import type { KuiSize } from '../../types';

/** Defaults for `input[kuiColorInput]`, set under the `colorInput` key of the component defaults. */
export interface KuiColorInputOptions {
  /** Component size. Takes precedence over the global `defaults.size`. */
  readonly size?: KuiSize;
}

import type { KuiSize } from '../../types';

/** Defaults for `input[kuiInput]`, set under the `input` key of the component defaults. */
export interface KuiInputOptions {
  /** Component size. Takes precedence over the global `defaults.size`. */
  readonly size?: KuiSize;
}

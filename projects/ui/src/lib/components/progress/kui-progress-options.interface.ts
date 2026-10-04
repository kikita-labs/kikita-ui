import type { KuiProgressSize } from './kui-progress';
import type { KuiProgressColor } from './kui-progress';

/** Defaults for `kui-progress`, set under the `progress` key of the component defaults. */
export interface KuiProgressOptions {
  /** Component size. Takes precedence over the global `defaults.size`. */
  readonly size?: KuiProgressSize;

  /** Default colour role. */
  readonly color?: KuiProgressColor;
}

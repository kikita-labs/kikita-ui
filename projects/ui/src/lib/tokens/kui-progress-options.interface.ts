import type { KuiProgressSize } from '../components/progress/kui-progress.component';
import type { KuiProgressColor } from '../components/progress/kui-progress.component';

/** Defaults for `kui-progress`, set under the `progress` key of the component defaults. */
export interface KuiProgressOptions {
  /** Component size. Takes precedence over the global `defaults.size`. */
  readonly size?: KuiProgressSize;

  /** Default colour role. */
  readonly color?: KuiProgressColor;
}

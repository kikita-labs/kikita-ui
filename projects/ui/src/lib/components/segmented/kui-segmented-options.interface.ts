import type { KuiSize } from '../../types';

/** Defaults for `kui-segmented`, set under the `segmented` key of the component defaults. */
export interface KuiSegmentedOptions {
  /** Component size. Takes precedence over the global `defaults.size`. */
  readonly size?: KuiSize;
}

import type { KuiSize } from '../types';

/** Defaults for `table[kuiTable]`, set under the `table` key of the component defaults. */
export interface KuiTableOptions {
  /** Component size. Takes precedence over the global `defaults.size`. */
  readonly size?: KuiSize;
}

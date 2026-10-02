import type { KuiSize } from '../types';

/** Defaults for `[kuiBadge]`, set under the `badge` key of the component defaults. */
export interface KuiBadgeOptions {
  /** Component size. Takes precedence over the global `defaults.size`. */
  readonly size?: KuiSize;
}

import type { KuiEmptyStateSize } from '../components/empty-state/kui-empty-state-size.type';

/** Defaults for `kui-empty-state`, set under the `emptyState` key of the component defaults. */
export interface KuiEmptyStateOptions {
  /** Component size. Takes precedence over the global `defaults.size`. */
  readonly size?: KuiEmptyStateSize;
}

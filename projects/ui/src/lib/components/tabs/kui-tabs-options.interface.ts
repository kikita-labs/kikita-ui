import type { KuiSize } from '../../types';
import type { KuiTabsVariant } from './kui-tabs.component';
import type { KuiTabsOrientation } from './kui-tabs.component';

/** Defaults for `kui-tabs`, set under the `tabs` key of the component defaults. */
export interface KuiTabsOptions {
  /** Component size. Takes precedence over the global `defaults.size`. */
  readonly size?: KuiSize;

  /** Default variant. */
  readonly variant?: KuiTabsVariant;

  /** Default orientation. */
  readonly orientation?: KuiTabsOrientation;
}

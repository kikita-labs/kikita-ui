import type { KuiTabsVariant } from '../components/tabs/kui-tabs.component';
import type { KuiTabsOrientation } from '../components/tabs/kui-tabs.component';
import type { KuiSize } from '../types';

/** Defaults for `kui-tabs`, set under the `tabs` key of the component defaults. */
export interface KuiTabsOptions {
  /** Component size. Takes precedence over the global `defaults.size`. */
  readonly size?: KuiSize;

  /** Default variant. */
  readonly variant?: KuiTabsVariant;

  /** Default orientation. */
  readonly orientation?: KuiTabsOrientation;
}

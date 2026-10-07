import type { KuiSize } from '../../types';
import type { KuiIconGlyph } from '../icon/kui-icon-glyph.type';
import type { KuiTabsVariant } from './kui-tabs';
import type { KuiTabsOrientation } from './kui-tabs';

/** Defaults for `kui-tabs`, set under the `tabs` key of the component defaults. */
export interface KuiTabsOptions {
  /** Component size. Takes precedence over the global `defaults.size`. */
  readonly size?: KuiSize;

  /** Default variant. */
  readonly variant?: KuiTabsVariant;

  /** Default orientation. */
  readonly orientation?: KuiTabsOrientation;
  /** Icon of the scroll-back button. Takes precedence over `defaults.icons.previous`. */
  readonly previousIcon?: KuiIconGlyph;

  /** Icon of the scroll-forward button. Takes precedence over `defaults.icons.next`. */
  readonly nextIcon?: KuiIconGlyph;
}

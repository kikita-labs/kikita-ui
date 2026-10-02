import type { KuiCardAppearance } from '../components/card/kui-card-appearance.type';
import type { KuiSize } from '../types';

/** Defaults for `[kuiCard]`, set under the `card` key of the component defaults. */
export interface KuiCardOptions {
  /** Component size. Takes precedence over the global `defaults.size`. */
  readonly size?: KuiSize;

  /** Default appearance. */
  readonly appearance?: KuiCardAppearance;
}

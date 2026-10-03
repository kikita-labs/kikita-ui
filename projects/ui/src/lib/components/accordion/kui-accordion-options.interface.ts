import type { KuiSize } from '../../types';
import type { KuiAccordionMode } from './kui-accordion.component';
import type { KuiAccordionAppearance } from './kui-accordion.component';

/** Defaults for `kui-accordion`, set under the `accordion` key of the component defaults. */
export interface KuiAccordionOptions {
  /** Component size. Takes precedence over the global `defaults.size`. */
  readonly size?: KuiSize;

  /** Default mode. */
  readonly mode?: KuiAccordionMode;

  /** Default appearance. */
  readonly appearance?: KuiAccordionAppearance;
}

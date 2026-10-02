import type { KuiAccordionMode } from '../components/accordion/kui-accordion.component';
import type { KuiAccordionAppearance } from '../components/accordion/kui-accordion.component';
import type { KuiSize } from '../types';

/** Defaults for `kui-accordion`, set under the `accordion` key of the component defaults. */
export interface KuiAccordionOptions {
  /** Component size. Takes precedence over the global `defaults.size`. */
  readonly size?: KuiSize;

  /** Default mode. */
  readonly mode?: KuiAccordionMode;

  /** Default appearance. */
  readonly appearance?: KuiAccordionAppearance;
}

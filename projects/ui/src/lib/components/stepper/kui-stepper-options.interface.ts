import type { KuiStepperSize } from './kui-stepper';
import type { KuiStepperOrientation } from './kui-stepper';

/** Defaults for `kui-stepper`, set under the `stepper` key of the component defaults. */
export interface KuiStepperOptions {
  /** Component size. Takes precedence over the global `defaults.size`. */
  readonly size?: KuiStepperSize;

  /** Default orientation. */
  readonly orientation?: KuiStepperOrientation;

  /** Requires steps to be completed in order. */
  readonly linear?: boolean;

  /** Uses the compact layout. */
  readonly compact?: boolean;
}

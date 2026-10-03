import type { KuiSize } from '../../types';
import type { KuiNumberInputVariant } from './kui-number-input.directive';

/** Defaults for `input[type=number][kuiNumberInput]`, set under the `numberInput` key of the component defaults. */
export interface KuiNumberInputOptions {
  /** Component size. Takes precedence over the global `defaults.size`. */
  readonly size?: KuiSize;

  /** Default variant. */
  readonly variant?: KuiNumberInputVariant;
}

import type { KuiFieldControlOptions } from '../field/kui-field-options.interface';
import type { KuiTimePickerFormat } from './kui-time-picker.types';

/** Defaults for `input[kuiTimePicker]`, set under the `timePicker` key of the component defaults. */
export interface KuiTimePickerOptions extends KuiFieldControlOptions {
  /** Display and parse format. */
  readonly format?: KuiTimePickerFormat;

  /** Step of the hour column. */
  readonly hourStep?: number;

  /** Step of the minute column. */
  readonly minuteStep?: number;

  /** Step of the second column, used when seconds are shown. */
  readonly secondStep?: number;

  /** Shows the seconds column. */
  readonly showSeconds?: boolean;
}

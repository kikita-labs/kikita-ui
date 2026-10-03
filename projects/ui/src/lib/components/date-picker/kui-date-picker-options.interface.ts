import type { KuiFieldControlOptions } from '../field/kui-field-options.interface';
import type { KuiPickerIconOptions } from '../icon/kui-picker-icon-options.interface';

/** Defaults for `input[kuiDatePicker]`, set under the `datePicker` key of the component defaults. */
export interface KuiDatePickerOptions extends KuiFieldControlOptions, KuiPickerIconOptions {
  /**
   * Layout of the typed date: `'locale'` (default) or a pattern of `d`/`dd`, `M`/`MM` and `yyyy`
   * tokens such as `dd.MM.yyyy`.
   */
  readonly format?: string;
}

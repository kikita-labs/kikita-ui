import type { KuiFieldControlOptions } from '../field/kui-field-options.interface';
import type { KuiPickerIconOptions } from '../icon/kui-picker-icon-options.interface';

/** Defaults for `input[kuiCombobox]`, set under the `combobox` key of the component defaults. */
export interface KuiComboboxOptions extends KuiFieldControlOptions, KuiPickerIconOptions {}

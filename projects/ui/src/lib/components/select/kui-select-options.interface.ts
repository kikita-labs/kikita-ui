import type { KuiFieldControlOptions } from '../field/kui-field-options.interface';
import type { KuiPickerIconOptions } from '../icon/kui-picker-icon-options.interface';
import type { KuiSelectMultipleDisplay } from './kui-select';

/** Defaults for `input[kuiSelect]`, set under the `select` key of the component defaults. */
export interface KuiSelectOptions extends KuiFieldControlOptions, KuiPickerIconOptions {
  /** How a multiple select shows its selection. */
  readonly multipleDisplay?: KuiSelectMultipleDisplay;

  /** Default visible selected chips before select renders a collapsed `+N` chip. */
  readonly maxVisibleChips?: number;
}

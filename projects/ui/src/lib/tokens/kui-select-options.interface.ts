import type { KuiFieldControlOptions } from './kui-field-options.interface';

/** Defaults for `input[kuiSelect]`, set under the `select` key of the component defaults. */
export interface KuiSelectOptions extends KuiFieldControlOptions {
  /** Default visible selected chips before select renders a collapsed `+N` chip. */
  readonly maxVisibleChips?: number;
}

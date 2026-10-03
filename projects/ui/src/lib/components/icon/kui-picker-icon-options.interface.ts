import type { KuiIconGlyph } from './kui-icon-glyph.type';

/** Icon options shared by the controls that open a picker panel: select, combobox and the pickers. */
export interface KuiPickerIconOptions {
  /** Icon of the options toggle. Takes precedence over `defaults.icons.pickerChevron`. */
  readonly chevronIcon?: KuiIconGlyph;

  /** Icon of the clear button. Takes precedence over `defaults.icons.clear`. */
  readonly clearIcon?: KuiIconGlyph;
}

import type { KuiSize } from '../../types';
import type { KuiIconGlyph } from '../icon/kui-icon-glyph.type';

/** Defaults for `input[kuiColorInput]`, set under the `colorInput` key of the component defaults. */
export interface KuiColorInputOptions {
  /** Component size. Takes precedence over the global `defaults.size`. */
  readonly size?: KuiSize;
  /** Icon of the picker toggle. Takes precedence over `defaults.icons.pickerChevron`. */
  readonly chevronIcon?: KuiIconGlyph;
}

import type { KuiIconGlyph } from '../icon/kui-icon-glyph.type';
import type { KuiChipSize } from './kui-chip-size.type';

/** Defaults for `[kuiChip]`, set under the `chip` key of the component defaults. */
export interface KuiChipOptions {
  /** Component size. Takes precedence over the global `defaults.size`. */
  readonly size?: KuiChipSize;

  /** Icon of the remove button. Takes precedence over `defaults.icons.remove`. */
  readonly removeIcon?: KuiIconGlyph;
}

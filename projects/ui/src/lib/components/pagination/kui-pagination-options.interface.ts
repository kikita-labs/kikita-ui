import type { KuiIconGlyph } from '../icon/kui-icon-glyph.type';
import type { KuiPaginationVariant } from './kui-pagination-variant.type';

/** Defaults for `kui-pagination`, set under the `pagination` key of the component defaults. */
export interface KuiPaginationOptions {
  /** Layout variant. */
  readonly variant?: KuiPaginationVariant;

  /** Pages shown on each side of the current page. */
  readonly siblingCount?: number;

  /** Pages always shown at each edge. */
  readonly boundaryCount?: number;

  /** Choices offered by the rows-per-page picker of the `full` variant. */
  readonly pageSizeOptions?: readonly number[];
  /** Icon of the first-page button. Takes precedence over `defaults.icons.first`. */
  readonly firstIcon?: KuiIconGlyph;

  /** Icon of the previous-page button. Takes precedence over `defaults.icons.previous`. */
  readonly previousIcon?: KuiIconGlyph;

  /** Icon of the next-page button. Takes precedence over `defaults.icons.next`. */
  readonly nextIcon?: KuiIconGlyph;

  /** Icon of the last-page button. Takes precedence over `defaults.icons.last`. */
  readonly lastIcon?: KuiIconGlyph;
}

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
}

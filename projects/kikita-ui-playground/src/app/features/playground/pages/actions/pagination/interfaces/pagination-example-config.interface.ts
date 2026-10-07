import type { KuiPaginationVariant, KuiSize } from '@kikita-labs/ui';

/** One labelled Pagination example: the inputs it sets and the page it starts on. */
export interface PaginationExampleConfig {
  readonly id: string;
  readonly labelKey: string;
  readonly variant?: KuiPaginationVariant;
  readonly size?: KuiSize;
  readonly totalPages: number;
  readonly initialPage?: number;
  readonly siblingCount?: number;
  readonly boundaryCount?: number;
  readonly totalItems?: number;
  readonly disabled?: boolean;
}

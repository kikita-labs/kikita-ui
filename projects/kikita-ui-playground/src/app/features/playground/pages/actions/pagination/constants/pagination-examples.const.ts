import type { PaginationExampleConfig } from '../interfaces';

/** The three layout presets, each on page 5 of 12. */
export const PAGINATION_VARIANT_EXAMPLES: readonly PaginationExampleConfig[] = [
  {
    id: 'compact',
    labelKey: 'pagination.labels.compact',
    variant: 'compact',
    totalPages: 12,
    initialPage: 5,
  },
  {
    id: 'simple',
    labelKey: 'pagination.labels.simple',
    variant: 'simple',
    totalPages: 12,
    initialPage: 5,
  },
  {
    id: 'full',
    labelKey: 'pagination.labels.full',
    variant: 'full',
    totalPages: 12,
    totalItems: 289,
    initialPage: 5,
  },
];

/** The supported control sizes, each on page 5 of 12. */
export const PAGINATION_SIZE_EXAMPLES: readonly PaginationExampleConfig[] = [
  {
    id: 'xs',
    labelKey: 'pagination.labels.extraSmall',
    size: 'xs',
    totalPages: 12,
    initialPage: 5,
  },
  { id: 'sm', labelKey: 'pagination.labels.small', size: 'sm', totalPages: 12, initialPage: 5 },
  { id: 'md', labelKey: 'pagination.labels.medium', size: 'md', totalPages: 12, initialPage: 5 },
  { id: 'lg', labelKey: 'pagination.labels.large', size: 'lg', totalPages: 12, initialPage: 5 },
];

/** Sibling and boundary counts around page 21 of 42. */
export const PAGINATION_WINDOW_EXAMPLES: readonly PaginationExampleConfig[] = [
  {
    id: 'siblings-0',
    labelKey: 'pagination.labels.siblingsNone',
    totalPages: 42,
    initialPage: 21,
    siblingCount: 0,
  },
  {
    id: 'siblings-1',
    labelKey: 'pagination.labels.siblingsDefault',
    totalPages: 42,
    initialPage: 21,
    siblingCount: 1,
  },
  {
    id: 'siblings-2',
    labelKey: 'pagination.labels.siblingsTwo',
    totalPages: 42,
    initialPage: 21,
    siblingCount: 2,
  },
  {
    id: 'boundaries-0',
    labelKey: 'pagination.labels.boundariesNone',
    totalPages: 42,
    initialPage: 21,
    boundaryCount: 0,
  },
  {
    id: 'boundaries-1',
    labelKey: 'pagination.labels.boundariesDefault',
    totalPages: 42,
    initialPage: 21,
    boundaryCount: 1,
  },
  {
    id: 'boundaries-2',
    labelKey: 'pagination.labels.boundariesTwo',
    totalPages: 42,
    initialPage: 21,
    boundaryCount: 2,
  },
];

/** The first, last, and only page, where the boundary step buttons are disabled. */
export const PAGINATION_BOUNDARY_EXAMPLES: readonly PaginationExampleConfig[] = [
  { id: 'first', labelKey: 'pagination.labels.atFirstPage', totalPages: 12, initialPage: 1 },
  { id: 'last', labelKey: 'pagination.labels.atLastPage', totalPages: 12, initialPage: 12 },
  { id: 'single', labelKey: 'pagination.labels.singlePage', totalPages: 1, initialPage: 1 },
];

/** Every layout preset with the disabled input set. */
export const PAGINATION_DISABLED_EXAMPLES: readonly PaginationExampleConfig[] = [
  {
    id: 'compact',
    labelKey: 'pagination.labels.compactDisabled',
    variant: 'compact',
    totalPages: 12,
    initialPage: 5,
    disabled: true,
  },
  {
    id: 'simple',
    labelKey: 'pagination.labels.simpleDisabled',
    variant: 'simple',
    totalPages: 12,
    initialPage: 5,
    disabled: true,
  },
  {
    id: 'full',
    labelKey: 'pagination.labels.fullDisabled',
    variant: 'full',
    totalPages: 12,
    totalItems: 289,
    initialPage: 5,
    disabled: true,
  },
];

/** A full variant that omits totalItems, so the summary total falls back to pages times size. */
export const PAGINATION_SUMMARY_FALLBACK_EXAMPLE: PaginationExampleConfig = {
  id: 'summary-fallback',
  labelKey: 'pagination.labels.summaryFallback',
  variant: 'full',
  totalPages: 12,
};

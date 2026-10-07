import { Component, signal } from '@angular/core';

import { KuiPagination, KuiText } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

import { PaginationExample, PaginationRowsPerPage, PaginationTable } from './components';
import {
  PAGINATION_BOUNDARY_EXAMPLES,
  PAGINATION_DISABLED_EXAMPLES,
  PAGINATION_SIZE_EXAMPLES,
  PAGINATION_VARIANT_EXAMPLES,
  PAGINATION_WINDOW_EXAMPLES,
} from './constants';

/** Shows Pagination defaults, variants, sizes, page windows, boundaries, and table composition. */
@Component({
  selector: 'app-pagination',
  imports: [
    KuiPagination,
    KuiText,
    PaginationExample,
    PaginationRowsPerPage,
    PaginationTable,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  templateUrl: './pagination.html',
  styleUrl: './pagination.scss',
})
export class Pagination {
  protected readonly variantExamples = PAGINATION_VARIANT_EXAMPLES;

  protected readonly sizeExamples = PAGINATION_SIZE_EXAMPLES;

  protected readonly windowExamples = PAGINATION_WINDOW_EXAMPLES;

  protected readonly boundaryExamples = PAGINATION_BOUNDARY_EXAMPLES;

  protected readonly disabledExamples = PAGINATION_DISABLED_EXAMPLES;

  protected readonly defaultPage = signal(1);
}

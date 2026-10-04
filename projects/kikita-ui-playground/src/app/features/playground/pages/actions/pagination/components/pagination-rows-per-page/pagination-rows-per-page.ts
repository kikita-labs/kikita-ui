import { Component, computed, signal } from '@angular/core';

import { KuiPagination } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

import { PAGINATION_ITEM_COUNT, PAGINATION_SUMMARY_FALLBACK_EXAMPLE } from '../../constants';
import { PaginationExample } from '../pagination-example';

/** Shows the summary, the rows-per-page reset, and both change outputs of a full Pagination. */
@Component({
  selector: 'app-pagination-rows-per-page',
  imports: [KuiPagination, PaginationExample, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './pagination-rows-per-page.html',
  styleUrl: './pagination-rows-per-page.scss',
})
export class PaginationRowsPerPage {
  protected readonly itemCount = PAGINATION_ITEM_COUNT;

  protected readonly fallbackExample = PAGINATION_SUMMARY_FALLBACK_EXAMPLE;

  protected readonly page = signal(5);

  protected readonly pageSize = signal(25);

  protected readonly pageChanges = signal(0);

  protected readonly sizeChanges = signal(0);

  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.itemCount / this.pageSize())),
  );

  protected countPageChange(): void {
    this.pageChanges.update((count) => count + 1);
  }

  protected countSizeChange(): void {
    this.sizeChanges.update((count) => count + 1);
  }
}

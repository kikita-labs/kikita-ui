import { DecimalPipe } from '@angular/common';
import { Component, computed, signal } from '@angular/core';

import { KuiCell, KuiPagination, KuiRow, KuiTable, KuiTh, KuiThGroup } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

import { PAGINATION_ORDER_COUNT, PAGINATION_ORDER_PAGE_SIZES } from '../../constants';
import { createPaginationNumberLocale, createPaginationOrder } from '../../helpers';

/** Shows a full Pagination beside a table: the page owns the state and slices the rows. */
@Component({
  selector: 'app-pagination-table',
  imports: [
    DecimalPipe,
    KuiCell,
    KuiPagination,
    KuiRow,
    KuiTable,
    KuiTh,
    KuiThGroup,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  templateUrl: './pagination-table.html',
  styleUrl: './pagination-table.scss',
})
export class PaginationTable {
  protected readonly orderCount = PAGINATION_ORDER_COUNT;

  protected readonly pageSizeOptions = PAGINATION_ORDER_PAGE_SIZES;

  protected readonly numberLocale = createPaginationNumberLocale();

  protected readonly page = signal(1);

  protected readonly pageSize = signal(10);

  protected readonly totalPages = computed(() => Math.ceil(this.orderCount / this.pageSize()));

  protected readonly orders = computed(() => {
    const start = (this.page() - 1) * this.pageSize();
    const length = Math.max(0, Math.min(this.pageSize(), this.orderCount - start));

    return Array.from({ length }, (_, offset) => createPaginationOrder(start + offset));
  });
}

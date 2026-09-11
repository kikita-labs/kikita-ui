import { Component, computed, signal, ViewEncapsulation } from '@angular/core';

import {
  KuiCellDirective,
  KuiPaginationComponent,
  KuiRowDirective,
  KuiTableDirective,
  KuiThDirective,
  KuiThGroupDirective,
} from '@kikita-labs/ui';

import type { KuiPaginationVariant, KuiSize } from '@kikita-labs/ui';

interface PaginationDemoRow {
  readonly id: number;
  readonly name: string;
  readonly status: 'active' | 'invited' | 'suspended';
}

import { PlaygroundPanelComponent } from '../../shared/panel/panel.component';

@Component({
  selector: 'app-pagination-page',
  imports: [
    KuiCellDirective,
    KuiPaginationComponent,
    KuiRowDirective,
    KuiTableDirective,
    KuiThDirective,
    KuiThGroupDirective,
    PlaygroundPanelComponent,
  ],
  templateUrl: './pagination.page.html',
  styleUrl: './pagination.page.scss',
  encapsulation: ViewEncapsulation.None,
})
export class PaginationPage {
  protected readonly defaultPage = signal(1);

  protected readonly fullPage = signal(5);
  protected readonly fullPageSize = signal(25);

  protected readonly simplePage = signal(2);

  protected readonly sizeRows: readonly { value: KuiSize; label: string }[] = [
    { value: 'xs', label: 'xs' },
    { value: 'sm', label: 'sm' },
    { value: 'md', label: 'md (default)' },
    { value: 'lg', label: 'lg' },
  ];
  protected readonly sizePages = signal<Record<KuiSize, number>>({
    xs: 5,
    sm: 5,
    md: 5,
    lg: 5,
  });

  protected readonly variantRows: readonly { value: KuiPaginationVariant; label: string }[] = [
    { value: 'full', label: 'full' },
    { value: 'compact', label: 'compact (default)' },
    { value: 'simple', label: 'simple' },
  ];
  protected readonly variantPages = signal<Record<KuiPaginationVariant, number>>({
    full: 5,
    compact: 5,
    simple: 5,
  });
  protected readonly variantPageSize = signal(25);

  protected readonly disabledPage = signal(5);

  /**
   * `kui-pagination` is a plain sibling of `table[kuiTable]`, never a child -- `kuiTable` sorts
   * whatever rows it's given but has no slicing concept of its own, so the consuming page (here)
   * owns `currentPage`/`pageSize` and derives the page slice fed to the table. See
   * "Usage with kui-table" in docs/pagination.md for why this composes as two siblings rather
   * than the table injecting/owning the paginator.
   */
  protected readonly tableRows: readonly PaginationDemoRow[] = Array.from(
    { length: 42 },
    (_, i) => ({
      id: i + 1,
      name: `User ${i + 1}`,
      status: i % 7 === 0 ? 'suspended' : i % 3 === 0 ? 'invited' : 'active',
    }),
  );
  protected readonly tablePage = signal(1);
  protected readonly tablePageSize = signal(10);
  protected readonly tableTotalPages = computed(() =>
    Math.max(1, Math.ceil(this.tableRows.length / this.tablePageSize())),
  );
  protected readonly tablePageRows = computed(() => {
    const start = (this.tablePage() - 1) * this.tablePageSize();
    return this.tableRows.slice(start, start + this.tablePageSize());
  });

  protected setSizePage(size: KuiSize, page: number): void {
    this.sizePages.update((rows) => ({ ...rows, [size]: page }));
  }

  protected setVariantPage(variant: KuiPaginationVariant, page: number): void {
    this.variantPages.update((rows) => ({ ...rows, [variant]: page }));
  }
}

import { Component, input, linkedSignal, signal } from '@angular/core';

import { KuiPagination, KuiText } from '@kikita-labs/ui';

import { TranslocoPipe } from '@jsverse/transloco';

import type { PaginationExampleConfig } from '../../interfaces';

/** Renders one labelled Pagination that owns its own current page and page size. */
@Component({
  selector: 'app-pagination-example',
  imports: [KuiPagination, KuiText, TranslocoPipe],
  templateUrl: './pagination-example.html',
  styleUrl: './pagination-example.scss',
})
export class PaginationExample {
  readonly config = input.required<PaginationExampleConfig>();

  protected readonly pageSize = signal(25);

  protected readonly page = linkedSignal(() => this.config().initialPage ?? 1);
}

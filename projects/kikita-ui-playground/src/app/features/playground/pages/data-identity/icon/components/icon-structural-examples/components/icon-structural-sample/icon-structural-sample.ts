import { Component, input, signal } from '@angular/core';

import { KuiAlert, KuiChip, KuiPagination } from '@kikita-labs/ui';

import { TranslocoPipe } from '@jsverse/transloco';

/** One chip, one alert and one pagination: the structural icons the override example changes. */
@Component({
  selector: 'app-icon-structural-sample',
  imports: [KuiAlert, KuiChip, KuiPagination, TranslocoPipe],
  templateUrl: './icon-structural-sample.html',
  styleUrl: './icon-structural-sample.scss',
})
export class IconStructuralSample {
  /** Translation key of the pagination landmark name; each instance on a page needs its own. */
  readonly paginationLabel = input.required<string>();

  protected readonly page = signal(5);
}

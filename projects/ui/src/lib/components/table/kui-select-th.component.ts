import { Component, computed, inject, input, ViewEncapsulation } from '@angular/core';

import { injectKuiMessages } from '../../i18n/inject-kui-messages';
import { KUI_TABLE_CTX } from './kui-table.directive';

/** Renders a native checkbox header cell for selecting all table rows. */
@Component({
  selector: 'th[kuiSelectTh]',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'kui-table__select-cell' },
  templateUrl: './kui-select-th.component.html',
})
export class KuiSelectTh {
  /** Accessible label for the select-all checkbox. Defaults to the `table.selectAllRows` message. */
  readonly ariaLabel = input<string | undefined>();

  protected readonly t = injectKuiMessages('table');

  protected readonly table = inject(KUI_TABLE_CTX);

  protected readonly visible = computed(() => this.table.selectionObserved);
}

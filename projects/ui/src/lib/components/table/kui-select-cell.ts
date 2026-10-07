import { Component, computed, inject, input, ViewEncapsulation } from '@angular/core';

import { injectKuiMessages } from '../../i18n/inject-kui-messages';
import { KuiRow } from './kui-row';
import { KUI_TABLE_CTX } from './kui-table';

/** Renders a native checkbox cell for selectable table rows. */
@Component({
  selector: 'td[kuiSelectCell]',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'kui-table__select-cell' },
  templateUrl: './kui-select-cell.html',
})
export class KuiSelectCell {
  /** Accessible label for the row selection checkbox. Defaults to the `table.selectRow` message. */
  readonly ariaLabel = input<string | undefined>();

  protected readonly t = injectKuiMessages('table');

  protected readonly table = inject(KUI_TABLE_CTX);
  protected readonly row = inject(KuiRow);

  protected readonly visible = computed(() => this.table.selectionObserved);
}

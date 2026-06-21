import { Component, ViewEncapsulation, computed, inject } from '@angular/core';

import { KUI_TABLE_CTX } from './kui-table.directive';
import { KuiRowDirective } from './kui-row.directive';

@Component({
  selector: 'td[kuiSelectCell]',
  encapsulation: ViewEncapsulation.None,
  host: { 'class': 'kui-table__select-cell' },
  template: `
    @if (visible()) {
      <input
        class="kui-table__cb"
        type="checkbox"
        [checked]="row.selected()"
        (change)="table.toggle(row.value())"
        aria-label="Select row"
      />
    }
  `,
})
export class KuiSelectCellComponent {
  protected readonly table = inject(KUI_TABLE_CTX);
  protected readonly row = inject(KuiRowDirective);
  protected readonly visible = computed(() => this.table.selectionObserved);
}

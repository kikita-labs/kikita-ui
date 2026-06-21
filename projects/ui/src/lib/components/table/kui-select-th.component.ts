import { Component, ViewEncapsulation, computed, inject } from '@angular/core';

import { KUI_TABLE_CTX } from './kui-table.directive';

@Component({
  selector: 'th[kuiSelectTh]',
  encapsulation: ViewEncapsulation.None,
  host: { 'class': 'kui-table__select-cell' },
  template: `
    @if (visible()) {
      <input
        class="kui-table__cb"
        type="checkbox"
        [checked]="table.allSelected()"
        [indeterminate]="table.someSelected()"
        (change)="table.toggleAll()"
        aria-label="Select all rows"
      />
    }
  `,
})
export class KuiSelectThComponent {
  protected readonly table = inject(KUI_TABLE_CTX);
  protected readonly visible = computed(() => this.table.selectionObserved);
}

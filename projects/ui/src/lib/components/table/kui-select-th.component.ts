import { Component, ViewEncapsulation, computed, inject, input } from '@angular/core';

import { KUI_TABLE_CTX } from './kui-table.directive';

/** Renders a native checkbox header cell for selecting all table rows. */
@Component({
  selector: 'th[kuiSelectTh]',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'kui-table__select-cell' },
  template: `
    @if (visible()) {
      <input
        class="kui-table__cb"
        type="checkbox"
        [checked]="table.allSelected()"
        [indeterminate]="table.someSelected()"
        (change)="table.toggleAll()"
        [attr.aria-label]="ariaLabel()"
      />
    }
  `,
})
export class KuiSelectThComponent {
  /** Accessible label for the select-all checkbox. */
  readonly ariaLabel = input('Select all rows');

  protected readonly table = inject(KUI_TABLE_CTX);

  protected readonly visible = computed(() => this.table.selectionObserved);
}

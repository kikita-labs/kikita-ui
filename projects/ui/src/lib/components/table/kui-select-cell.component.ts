import { Component, ViewEncapsulation, computed, inject, input } from '@angular/core';

import { KUI_TABLE_CTX } from './kui-table.directive';
import { KuiRowDirective } from './kui-row.directive';

/** Renders a native checkbox cell for selectable table rows. */
@Component({
  selector: 'td[kuiSelectCell]',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'kui-table__select-cell' },
  template: `
    @if (visible()) {
      <input
        class="kui-table__cb"
        type="checkbox"
        [checked]="row.selected()"
        (change)="table.toggle(row.value())"
        [attr.aria-label]="ariaLabel()"
      />
    }
  `,
})
export class KuiSelectCellComponent {
  /** Accessible label for the row selection checkbox. */
  readonly ariaLabel = input('Select row');

  protected readonly table = inject(KUI_TABLE_CTX);
  protected readonly row = inject(KuiRowDirective);

  protected readonly visible = computed(() => this.table.selectionObserved);
}

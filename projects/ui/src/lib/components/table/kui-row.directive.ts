import { Directive, computed, inject, input } from '@angular/core';

import { KUI_TABLE_CTX } from './kui-table.directive';

@Directive({
  selector: 'tr[kuiRow]',
  exportAs: 'kuiRow',
  host: {
    class: 'kui-row',
    '[class.kui-row--selected]': 'selected()',
  },
})
export class KuiRowDirective {
  private readonly table = inject(KUI_TABLE_CTX, { optional: true });

  readonly value = input.required<unknown>();

  readonly selected = computed(() => this.table?.isSelected(this.value() as never) ?? false);
}

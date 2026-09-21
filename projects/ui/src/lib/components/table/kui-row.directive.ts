import { computed, Directive, inject, input } from '@angular/core';

import { KUI_TABLE_CTX } from './kui-table.directive';

@Directive({
  selector: 'tr[kuiRow]',
  exportAs: 'kuiRow',
  host: {
    class: 'kui-row',
    '[class.kui-row--selected]': 'selected()',
  },
})
/** Applies Kikita UI row styling and selected state to a native table row. */
export class KuiRowDirective {
  private readonly table = inject(KUI_TABLE_CTX, { optional: true });

  /** Row data used to determine selected state. Omit for a non-selectable presentational row. */
  readonly value = input<unknown | undefined>();

  readonly selected = computed(() => {
    const value = this.value();
    return value === undefined ? false : (this.table?.isSelected(value as never) ?? false);
  });
}

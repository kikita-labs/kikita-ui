import { Directive, computed, inject, input } from '@angular/core';

import { KUI_TABLE_CTX } from './kui-table.directive';

@Directive({
  selector: 'th[kuiTh]',
  host: {
    'class': 'kui-th',
    '[class.kui-th--sticky]': 'sticky()',
    '[class.kui-th--sortable]': '!!sortKey()',
    '[class.kui-th--sort-asc]': 'sortDir() === "asc"',
    '[class.kui-th--sort-desc]': 'sortDir() === "desc"',
    '[attr.aria-sort]': 'ariaSort()',
    '(click)': 'onClick()',
  },
})
export class KuiThDirective {
  private readonly table = inject(KUI_TABLE_CTX, { optional: true });

  readonly sortKey = input<string | undefined>(undefined);
  readonly comparator = input<((a: unknown, b: unknown) => number) | undefined>(undefined);
  readonly sticky = input<boolean>(false);

  readonly sortDir = computed(() => {
    const state = this.table?.sortState();
    if (!state || state.key !== this.sortKey()) return null;
    return state.direction;
  });

  readonly ariaSort = computed(() => {
    const dir = this.sortDir();
    if (dir === 'asc') return 'ascending';
    if (dir === 'desc') return 'descending';
    return this.sortKey() ? 'none' : null;
  });

  onClick(): void {
    const key = this.sortKey();
    if (!key || !this.table) return;
    const comp = this.comparator();
    if (comp) this.table.registerComparator(key, comp as never);
    this.table.updateSort(key);
  }
}

import type { Signal } from '@angular/core';
import { computed, Directive, inject, InjectionToken, input, signal } from '@angular/core';

import { outputFromObservable } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';

import { KuiDefaults } from '../../providers/kui-defaults.service';
import { injectKuiRootSizeDefault } from '../../providers/kui-defaults.util';
import type { KuiSize } from '../../types';
import type { KuiActiveSortState, KuiSortState } from './types';

/** Injection token used by table child directives to access their parent table state. */
export const KUI_TABLE_CTX = new InjectionToken<KuiTable>('KuiTableContext');

function defaultCompare(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b));
}

@Directive({
  selector: 'table[kuiTable]',
  exportAs: 'kuiTable',
  host: {
    class: 'kui-table',
    '[attr.data-kui-size]': 'effectiveSize()',
  },
  providers: [{ provide: KUI_TABLE_CTX, useExisting: KuiTable }],
})
export class KuiTable<T = unknown> {
  readonly data = input<T[]>([]);
  /** Table size. Defaults to `defaults.table.size`, then the global `defaults.size`, then md. */
  readonly size = input<KuiSize | undefined>();

  private readonly tableDefaults = inject(KuiDefaults).get('table');
  private readonly rootDefaultSize = injectKuiRootSizeDefault();

  private readonly _selectionChange$ = new Subject<T[]>();
  private readonly _sortChange$ = new Subject<KuiSortState>();

  readonly selectionChange = outputFromObservable(this._selectionChange$);
  readonly sortChange = outputFromObservable(this._sortChange$);

  private readonly comparatorMap = new Map<string, (a: T, b: T) => number>();
  private readonly _sortState = signal<KuiSortState>(null);
  private readonly _selectedItems = signal<Set<T>>(new Set());

  readonly sortState: Signal<KuiSortState> = this._sortState.asReadonly();

  protected readonly effectiveSize = computed(
    () => this.size() ?? this.tableDefaults()?.size ?? this.rootDefaultSize() ?? 'md',
  );

  readonly sortedData = computed<T[]>(() => {
    const state = this._sortState();
    const rows = this.data();
    if (!state || this._sortChange$.observed) return rows;
    const comp = this.comparatorMap.get(state.key);
    return [...rows].sort((a, b) => {
      const result = comp
        ? comp(a, b)
        : defaultCompare(
            (a as Record<string, unknown>)[state.key],
            (b as Record<string, unknown>)[state.key],
          );
      return state.direction === 'asc' ? result : -result;
    });
  });

  readonly allSelected = computed(() => {
    const rows = this.data();
    const sel = this._selectedItems();
    return rows.length > 0 && rows.every((r) => sel.has(r));
  });

  readonly someSelected = computed(() => {
    const rows = this.data();
    const sel = this._selectedItems();
    return rows.some((r) => sel.has(r)) && !this.allSelected();
  });

  get selectionObserved(): boolean {
    return this._selectionChange$.observed;
  }

  isSelected(item: T): boolean {
    return this._selectedItems().has(item);
  }

  toggle(item: T): void {
    const set = new Set(this._selectedItems());
    if (set.has(item)) {
      set.delete(item);
    } else {
      set.add(item);
    }
    this._selectedItems.set(set);
    this._selectionChange$.next([...set]);
  }

  toggleAll(): void {
    if (this.allSelected()) {
      this._selectedItems.set(new Set());
    } else {
      this._selectedItems.set(new Set(this.data()));
    }
    this._selectionChange$.next([...this._selectedItems()]);
  }

  registerComparator(key: string, comp: (a: T, b: T) => number): void {
    this.comparatorMap.set(key, comp);
  }

  updateSort(key: string): void {
    const current = this._sortState();
    const next: KuiSortState =
      current?.key === key && current.direction === 'desc'
        ? null
        : ({
            key,
            direction: current?.key === key && current.direction === 'asc' ? 'desc' : 'asc',
          } satisfies KuiActiveSortState);

    this._sortState.set(next);
    if (this._sortChange$.observed) {
      this._sortChange$.next(next);
    }
  }
}

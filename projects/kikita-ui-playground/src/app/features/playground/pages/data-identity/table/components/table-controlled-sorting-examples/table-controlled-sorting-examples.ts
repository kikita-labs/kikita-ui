import { DecimalPipe } from '@angular/common';
import { Component, computed, signal } from '@angular/core';

import {
  KuiCellDirective,
  KuiRowDirective,
  KuiTableDirective,
  KuiThDirective,
  KuiThGroupDirective,
} from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';
import type { KuiSortState } from '@kikita-labs/ui';

import { TABLE_MEMBERS } from '../../constants';

/** Shows parent-controlled ordering from the Table sortChange output. */
@Component({
  selector: 'app-table-controlled-sorting-examples',
  imports: [
    DecimalPipe,
    KuiCellDirective,
    KuiRowDirective,
    KuiTableDirective,
    KuiThDirective,
    KuiThGroupDirective,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  templateUrl: './table-controlled-sorting-examples.html',
  styleUrl: './table-controlled-sorting-examples.scss',
})
export class TableControlledSortingExamples {
  protected readonly members = TABLE_MEMBERS;

  protected readonly sortState = signal<KuiSortState>(null);

  protected readonly sortedMembers = computed(() => {
    const state = this.sortState();

    if (!state) return this.members;

    const direction = state.direction === 'asc' ? 1 : -1;

    return [...this.members].sort((left, right) => (left.score - right.score) * direction);
  });

  protected readonly sortStateLabelKey = computed(() => {
    const state = this.sortState();

    if (!state) return 'table.sorting.parentCleared';

    return state.direction === 'asc'
      ? 'table.sorting.parentAscending'
      : 'table.sorting.parentDescending';
  });

  protected onSortChange(state: KuiSortState): void {
    this.sortState.set(state);
  }
}

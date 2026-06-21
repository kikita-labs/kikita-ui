import { Component, computed, signal } from '@angular/core';
import { DatePipe } from '@angular/common';

import {
  KuiCellDirective,
  KuiRowDirective,
  KuiSelectCellComponent,
  KuiSelectThComponent,
  KuiTableDirective,
  KuiThDirective,
  KuiThGroupDirective,
} from '@kikita-labs/ui';

export interface TableUser {
  name: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  joined: Date;
  score: number;
}

const TABLE_USERS: TableUser[] = [
  { name: 'Alice Martin', role: 'Engineer', status: 'active', joined: new Date('2022-03-14'), score: 98 },
  { name: 'Bob Chen', role: 'Designer', status: 'active', joined: new Date('2021-07-01'), score: 85 },
  { name: 'Carol Wang', role: 'PM', status: 'inactive', joined: new Date('2023-01-20'), score: 72 },
  { name: 'Dan Patel', role: 'Engineer', status: 'pending', joined: new Date('2024-05-10'), score: 61 },
  { name: 'Eva Ruiz', role: 'QA', status: 'active', joined: new Date('2020-11-03'), score: 90 },
];

@Component({
  selector: 'app-table-page',
  imports: [
    DatePipe,
    KuiTableDirective,
    KuiThGroupDirective,
    KuiThDirective,
    KuiRowDirective,
    KuiCellDirective,
    KuiSelectThComponent,
    KuiSelectCellComponent,
  ],
  templateUrl: './table.page.html',
})
export class TablePage {
  protected readonly users = TABLE_USERS;
  protected readonly manyUsers = [...TABLE_USERS, ...TABLE_USERS, ...TABLE_USERS, ...TABLE_USERS];
  protected readonly sizes = ['xs', 'sm', 'md', 'lg'] as const;

  private readonly _selected = signal<TableUser[]>([]);
  protected readonly selectedNames = computed(() => {
    const sel = this._selected();
    return sel.length === 0 ? 'none' : sel.map((u) => u.name).join(', ');
  });

  protected readonly dateCompare = (a: unknown, b: unknown) =>
    (a as TableUser).joined.getTime() - (b as TableUser).joined.getTime();

  protected onSelect(items: TableUser[]): void {
    this._selected.set(items);
  }

  private readonly _serverSort = signal<{ key: string; direction: string } | null>(null);
  protected readonly serverSortLabel = computed(() => {
    const s = this._serverSort();
    return s ? `${s.key} ${s.direction}` : 'none';
  });
  protected readonly serverData = computed(() => {
    const s = this._serverSort();
    if (!s) return TABLE_USERS;
    return [...TABLE_USERS].sort((a, b) => {
      const av = (a as unknown as Record<string, unknown>)[s.key];
      const bv = (b as unknown as Record<string, unknown>)[s.key];
      const cmp = String(av).localeCompare(String(bv));
      return s.direction === 'asc' ? cmp : -cmp;
    });
  });

  protected onServerSort(evt: { key: string; direction: 'asc' | 'desc' }): void {
    this._serverSort.set(evt);
  }
}

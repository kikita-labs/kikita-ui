import { Component } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { KuiCellDirective } from './kui-cell.directive';
import { KuiRowDirective } from './kui-row.directive';
import { KuiSelectCellComponent } from './kui-select-cell.component';
import { KuiSelectThComponent } from './kui-select-th.component';
import { KuiTableDirective } from './kui-table.directive';
import { KuiThDirective } from './kui-th.directive';
import { KuiThGroupDirective } from './kui-th-group.directive';
import type { KuiSortState } from './types';

interface Row {
  id: number;
  name: string;
  score: number;
}

@Component({
  imports: [
    KuiCellDirective,
    KuiRowDirective,
    KuiSelectCellComponent,
    KuiSelectThComponent,
    KuiTableDirective,
    KuiThDirective,
    KuiThGroupDirective,
  ],
  template: `
    <table
      kuiTable
      #table="kuiTable"
      [data]="rows"
      (sortChange)="lastSort = $event"
      (selectionChange)="selected = $event"
    >
      <thead>
        <tr kuiThGroup>
          <th kuiSelectTh ariaLabel="Select all users"></th>
          <th kuiTh sortKey="name">Name</th>
          <th kuiTh sortKey="score">Score</th>
        </tr>
      </thead>
      <tbody>
        @for (row of table.sortedData(); track row.id) {
          <tr kuiRow [value]="row">
            <td kuiSelectCell [ariaLabel]="'Select ' + row.name"></td>
            <td kuiCell>{{ row.name }}</td>
            <td kuiCell>{{ row.score }}</td>
          </tr>
        }
      </tbody>
    </table>
  `,
})
class TableHost {
  rows: Row[] = [
    { id: 1, name: 'Beta', score: 2 },
    { id: 2, name: 'Alpha', score: 1 },
  ];
  selected: Row[] = [];
  lastSort: KuiSortState = null;
}

function createFixture(): ComponentFixture<TableHost> {
  TestBed.configureTestingModule({ imports: [TableHost] });
  const fixture = TestBed.createComponent(TableHost);
  fixture.detectChanges();
  return fixture;
}

function getSortableButtons(fixture: ComponentFixture<TableHost>): HTMLButtonElement[] {
  return [...fixture.nativeElement.querySelectorAll('.kui-th__sort-button')] as HTMLButtonElement[];
}

describe('KuiTableDirective', () => {
  it('renders sortable headers as real buttons inside table headers', () => {
    const fixture = createFixture();
    const th = fixture.nativeElement.querySelector('th[kuiTh]') as HTMLTableCellElement;
    const button = getSortableButtons(fixture)[0];

    expect(th.getAttribute('aria-sort')).toBe('none');
    expect(th.hasAttribute('tabindex')).toBe(false);
    expect(button.type).toBe('button');
    expect(button.textContent?.trim()).toContain('Name');
    expect(button.getAttribute('aria-label')).toBe('Sort Name ascending');
  });

  it('cycles sort state through ascending, descending, and clear', () => {
    const fixture = createFixture();
    const button = getSortableButtons(fixture)[0];
    const th = fixture.nativeElement.querySelector('th[kuiTh]') as HTMLTableCellElement;

    button.click();
    fixture.detectChanges();
    expect(th.getAttribute('aria-sort')).toBe('ascending');
    expect(button.getAttribute('aria-label')).toBe('Sort Name descending');
    expect(fixture.componentInstance.lastSort).toEqual({ key: 'name', direction: 'asc' });

    button.click();
    fixture.detectChanges();
    expect(th.getAttribute('aria-sort')).toBe('descending');
    expect(button.getAttribute('aria-label')).toBe('Clear Name sort');
    expect(fixture.componentInstance.lastSort).toEqual({ key: 'name', direction: 'desc' });

    button.click();
    fixture.detectChanges();
    expect(th.getAttribute('aria-sort')).toBe('none');
    expect(button.getAttribute('aria-label')).toBe('Sort Name ascending');
    expect(fixture.componentInstance.lastSort).toBeNull();
  });

  it('sorts local data when sortChange is not observed', () => {
    @Component({
      imports: [KuiCellDirective, KuiRowDirective, KuiTableDirective, KuiThDirective],
      template: `
        <table kuiTable #table="kuiTable" [data]="rows">
          <thead>
            <tr>
              <th kuiTh sortKey="name">Name</th>
            </tr>
          </thead>
          <tbody>
            @for (row of table.sortedData(); track row.id) {
              <tr kuiRow [value]="row">
                <td kuiCell>{{ row.name }}</td>
              </tr>
            }
          </tbody>
        </table>
      `,
    })
    class LocalSortHost {
      rows: Row[] = [
        { id: 1, name: 'Beta', score: 2 },
        { id: 2, name: 'Alpha', score: 1 },
      ];
    }

    TestBed.configureTestingModule({ imports: [LocalSortHost] });
    const fixture = TestBed.createComponent(LocalSortHost);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('.kui-th__sort-button') as HTMLButtonElement;
    button.click();
    fixture.detectChanges();

    const cells = [...fixture.nativeElement.querySelectorAll('td')].map((cell: HTMLElement) =>
      cell.textContent?.trim(),
    );
    expect(cells).toEqual(['Alpha', 'Beta']);
  });

  it('uses native checkboxes for row selection', () => {
    const fixture = createFixture();
    const checkboxes = fixture.nativeElement.querySelectorAll(
      '.kui-table__cb',
    ) as NodeListOf<HTMLInputElement>;

    expect(checkboxes).toHaveLength(3);
    expect(checkboxes[0].getAttribute('aria-label')).toBe('Select all users');
    expect(checkboxes[1].getAttribute('aria-label')).toBe('Select Beta');

    checkboxes[1].click();
    fixture.detectChanges();

    expect(fixture.componentInstance.selected).toEqual([fixture.componentInstance.rows[0]]);
  });
});

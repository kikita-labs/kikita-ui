import { DecimalPipe } from '@angular/common';
import { Component, signal } from '@angular/core';

import {
  KuiCell,
  KuiRow,
  KuiSelectCell,
  KuiSelectTh,
  KuiTable,
  KuiText,
  KuiTh,
  KuiThGroup,
} from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

import { TABLE_MEMBERS } from '../../constants';
import type { TableMember } from '../../interfaces';

/** Shows native row selection, indeterminate select-all, and the selection output. */
@Component({
  selector: 'app-table-selection-examples',
  imports: [
    DecimalPipe,
    KuiCell,
    KuiRow,
    KuiSelectCell,
    KuiSelectTh,
    KuiTable,
    KuiText,
    KuiTh,
    KuiThGroup,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  templateUrl: './table-selection-examples.html',
  styleUrl: './table-selection-examples.scss',
})
export class TableSelectionExamples {
  protected readonly members = TABLE_MEMBERS;
  protected readonly defaultLabelMembers = TABLE_MEMBERS.slice(0, 1);

  protected readonly selected = signal<readonly TableMember[]>([]);
  protected readonly defaultLabelSelected = signal<readonly TableMember[]>([]);

  protected onSelectionChange(members: TableMember[]): void {
    this.selected.set(members);
  }

  protected onDefaultLabelSelectionChange(members: TableMember[]): void {
    this.defaultLabelSelected.set(members);
  }
}

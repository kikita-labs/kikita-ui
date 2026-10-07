import { DecimalPipe } from '@angular/common';
import { Component } from '@angular/core';

import { KuiCell, KuiRow, KuiTable, KuiTh, KuiThGroup } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

import { TABLE_MEMBERS } from '../../constants';
import { compareTableStatus } from './helpers';

/** Shows local string and number sorting plus a status column with a custom comparator. */
@Component({
  selector: 'app-table-sorting-examples',
  imports: [
    DecimalPipe,
    KuiCell,
    KuiRow,
    KuiTable,
    KuiTh,
    KuiThGroup,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  templateUrl: './table-sorting-examples.html',
  styleUrl: './table-sorting-examples.scss',
})
export class TableSortingExamples {
  protected readonly members = TABLE_MEMBERS;
  protected readonly compareStatus = compareTableStatus;
}

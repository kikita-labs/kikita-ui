import { DecimalPipe } from '@angular/common';
import { Component } from '@angular/core';

import {
  KuiCellDirective,
  KuiRowDirective,
  KuiTableDirective,
  KuiThDirective,
  KuiThGroupDirective,
} from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

import { TABLE_MEMBERS } from '../../constants';
import { compareTableStatus } from './helpers';

/** Shows local string and number sorting plus a status column with a custom comparator. */
@Component({
  selector: 'app-table-sorting-examples',
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
  templateUrl: './table-sorting-examples.html',
  styleUrl: './table-sorting-examples.scss',
})
export class TableSortingExamples {
  protected readonly members = TABLE_MEMBERS;
  protected readonly compareStatus = compareTableStatus;
}

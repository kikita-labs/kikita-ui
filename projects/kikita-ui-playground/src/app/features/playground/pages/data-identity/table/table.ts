import { Component } from '@angular/core';

import { KuiText } from '@kikita-labs/ui';

import { TranslocoPipe } from '@jsverse/transloco';

import {
  TableControlledSortingExamples,
  TableDefaultExamples,
  TableSelectionExamples,
  TableSizeExamples,
  TableSortingExamples,
  TableStickyHeaderExamples,
} from './components';

/** Shows Table defaults, sizes, sorting, selection, and sticky-header behavior. */
@Component({
  selector: 'app-table',
  imports: [
    KuiText,
    TableControlledSortingExamples,
    TableDefaultExamples,
    TableSelectionExamples,
    TableSizeExamples,
    TableSortingExamples,
    TableStickyHeaderExamples,
    TranslocoPipe,
  ],
  templateUrl: './table.html',
  styleUrl: './table.scss',
})
export class Table {}

import { Component } from '@angular/core';

import { KuiCell, KuiRow, KuiTable, KuiText, KuiTh, KuiThGroup } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

import { TABLE_MEMBERS } from '../../constants';

/** Shows the smallest Table setup with native table structure and default size. */
@Component({
  selector: 'app-table-default-examples',
  imports: [
    KuiCell,
    KuiRow,
    KuiTable,
    KuiText,
    KuiTh,
    KuiThGroup,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  templateUrl: './table-default-examples.html',
  styleUrl: './table-default-examples.scss',
})
export class TableDefaultExamples {
  protected readonly members = TABLE_MEMBERS;
}

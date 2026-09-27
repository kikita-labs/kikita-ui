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

/** Shows a sticky header row while its bounded native scroll region moves. */
@Component({
  selector: 'app-table-sticky-header-examples',
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
  templateUrl: './table-sticky-header-examples.html',
  styleUrl: './table-sticky-header-examples.scss',
})
export class TableStickyHeaderExamples {
  protected readonly members = Array.from({ length: 10 }, (_, index) => {
    const member = TABLE_MEMBERS[index % TABLE_MEMBERS.length];

    return { ...member, id: `sticky-${index}-${member.id}` };
  });
}

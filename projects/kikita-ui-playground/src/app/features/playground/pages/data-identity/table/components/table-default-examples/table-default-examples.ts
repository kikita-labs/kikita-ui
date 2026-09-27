import { Component } from '@angular/core';

import {
  KuiCellDirective,
  KuiRowDirective,
  KuiTableDirective,
  KuiTextDirective,
  KuiThDirective,
  KuiThGroupDirective,
} from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

import { TABLE_MEMBERS } from '../../constants';

/** Shows the smallest Table setup with native table structure and default size. */
@Component({
  selector: 'app-table-default-examples',
  imports: [
    KuiCellDirective,
    KuiRowDirective,
    KuiTableDirective,
    KuiTextDirective,
    KuiThDirective,
    KuiThGroupDirective,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  templateUrl: './table-default-examples.html',
  styleUrl: './table-default-examples.scss',
})
export class TableDefaultExamples {
  protected readonly members = TABLE_MEMBERS;
}

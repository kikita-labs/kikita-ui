import { DecimalPipe } from '@angular/common';
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
import type { KuiSize } from '@kikita-labs/ui';

import { TABLE_MEMBERS } from '../../constants';

/** Shows every Table size with the same compact rows. */
@Component({
  selector: 'app-table-size-examples',
  imports: [
    DecimalPipe,
    KuiCellDirective,
    KuiRowDirective,
    KuiTableDirective,
    KuiThDirective,
    KuiThGroupDirective,
    KuiTextDirective,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  templateUrl: './table-size-examples.html',
  styleUrl: './table-size-examples.scss',
})
export class TableSizeExamples {
  protected readonly members = TABLE_MEMBERS.slice(0, 3);

  protected readonly sizes = [
    { value: 'xs', labelKey: 'table.sizes.xs' },
    { value: 'sm', labelKey: 'table.sizes.sm' },
    { value: 'md', labelKey: 'table.sizes.md' },
    { value: 'lg', labelKey: 'table.sizes.lg' },
  ] as const satisfies readonly { value: KuiSize; labelKey: string }[];
}

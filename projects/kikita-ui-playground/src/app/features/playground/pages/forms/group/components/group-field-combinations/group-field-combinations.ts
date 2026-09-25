import { Component } from '@angular/core';

import {
  KuiButtonDirective,
  KuiFieldComponent,
  KuiGroupDirective,
  KuiIconButtonDirective,
  KuiInputDirective,
  KuiTextDirective,
} from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

import { GROUP_FIELD_CASES } from './constants';

@Component({
  selector: 'app-group-field-combinations',
  imports: [
    KuiButtonDirective,
    KuiFieldComponent,
    KuiGroupDirective,
    KuiIconButtonDirective,
    KuiInputDirective,
    KuiTextDirective,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  templateUrl: './group-field-combinations.html',
  styleUrl: './group-field-combinations.scss',
})
export class GroupFieldCombinations {
  protected readonly fieldCases = GROUP_FIELD_CASES;
}

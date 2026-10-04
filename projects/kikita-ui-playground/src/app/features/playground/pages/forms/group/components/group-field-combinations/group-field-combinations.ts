import { Component } from '@angular/core';

import { KuiButton, KuiField, KuiGroup, KuiIconButton, KuiInput, KuiText } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

import { GROUP_FIELD_CASES } from './constants';

@Component({
  selector: 'app-group-field-combinations',
  imports: [
    KuiButton,
    KuiField,
    KuiGroup,
    KuiIconButton,
    KuiInput,
    KuiText,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  templateUrl: './group-field-combinations.html',
  styleUrl: './group-field-combinations.scss',
})
export class GroupFieldCombinations {
  protected readonly fieldCases = GROUP_FIELD_CASES;
}

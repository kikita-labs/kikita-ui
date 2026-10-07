import { Component } from '@angular/core';

import { KuiButton, KuiField, KuiGroup, KuiIconButton, KuiInput, KuiText } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-group-multiple-fields',
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
  templateUrl: './group-multiple-fields.html',
  styleUrl: './group-multiple-fields.scss',
})
export class GroupMultipleFields {}

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

@Component({
  selector: 'app-group-multiple-fields',
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
  templateUrl: './group-multiple-fields.html',
  styleUrl: './group-multiple-fields.scss',
})
export class GroupMultipleFields {}

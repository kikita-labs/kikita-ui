import { Component } from '@angular/core';

import {
  KuiErrorDirective,
  KuiFieldComponent,
  KuiHintDirective,
  KuiInputDirective,
  KuiLabelDirective,
} from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-field-projected',
  imports: [
    KuiErrorDirective,
    KuiFieldComponent,
    KuiHintDirective,
    KuiInputDirective,
    KuiLabelDirective,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  templateUrl: './field-projected.html',
})
export class FieldProjected {}

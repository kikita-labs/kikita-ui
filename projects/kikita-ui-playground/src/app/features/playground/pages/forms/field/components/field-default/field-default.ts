import { Component } from '@angular/core';

import { KuiField, KuiInput } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-field-default',
  imports: [KuiField, KuiInput, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './field-default.html',
})
export class FieldDefault {}

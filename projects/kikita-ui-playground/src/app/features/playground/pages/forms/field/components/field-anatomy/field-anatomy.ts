import { Component } from '@angular/core';

import { KuiField, KuiInput } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-field-anatomy',
  imports: [KuiField, KuiInput, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './field-anatomy.html',
  styleUrl: './field-anatomy.scss',
})
export class FieldAnatomy {}

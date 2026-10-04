import { Component } from '@angular/core';

import { KuiField, KuiInput, type KuiSize } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-field-sizes',
  imports: [KuiField, KuiInput, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './field-sizes.html',
  styleUrl: './field-sizes.scss',
})
export class FieldSizes {
  protected readonly sizes: readonly KuiSize[] = ['xs', 'sm', 'md', 'lg'];
}

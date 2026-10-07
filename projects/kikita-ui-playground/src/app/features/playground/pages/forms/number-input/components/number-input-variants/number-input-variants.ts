import { Component } from '@angular/core';

import { KuiField, KuiNumberInput } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Compares the default split layout with the supported stacked layout. */
@Component({
  selector: 'app-number-input-variants',
  imports: [KuiField, KuiNumberInput, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './number-input-variants.html',
  styleUrl: './number-input-variants.scss',
})
export class NumberInputVariants {}

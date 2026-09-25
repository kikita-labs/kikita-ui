import { Component } from '@angular/core';

import { KuiFieldComponent, KuiNumberInputDirective } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Compares the default split layout with the supported stacked layout. */
@Component({
  selector: 'app-number-input-variants',
  imports: [KuiFieldComponent, KuiNumberInputDirective, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './number-input-variants.html',
  styleUrl: './number-input-variants.scss',
})
export class NumberInputVariants {}

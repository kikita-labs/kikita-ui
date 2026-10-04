import { Component } from '@angular/core';

import { KuiField, KuiNumberInput } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Shows every accepted size, including xs with its current md-like styling. */
@Component({
  selector: 'app-number-input-sizes',
  imports: [KuiField, KuiNumberInput, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './number-input-sizes.html',
  styleUrl: './number-input-sizes.scss',
})
export class NumberInputSizes {}

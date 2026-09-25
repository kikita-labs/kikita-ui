import { Component } from '@angular/core';

import { KuiFieldComponent, KuiNumberInputDirective } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Shows every accepted size, including xs with its current md-like styling. */
@Component({
  selector: 'app-number-input-sizes',
  imports: [KuiFieldComponent, KuiNumberInputDirective, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './number-input-sizes.html',
  styleUrl: './number-input-sizes.scss',
})
export class NumberInputSizes {}

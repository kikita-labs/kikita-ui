import { Component } from '@angular/core';

import { KuiFieldComponent, KuiNumberInputDirective } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Shows native bounds, a non-unit step, disabled, read-only, and invalid states. */
@Component({
  selector: 'app-number-input-states',
  imports: [KuiFieldComponent, KuiNumberInputDirective, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './number-input-states.html',
  styleUrl: './number-input-states.scss',
})
export class NumberInputStates {}

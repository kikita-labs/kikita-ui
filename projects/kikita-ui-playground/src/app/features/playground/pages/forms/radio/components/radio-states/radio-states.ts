import { Component } from '@angular/core';

import { KuiFieldComponent, KuiRadioDirective, KuiTextDirective } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Shows selected, disabled, and invalid radio states with native group semantics. */
@Component({
  selector: 'app-radio-states',
  imports: [
    KuiFieldComponent,
    KuiRadioDirective,
    KuiTextDirective,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  templateUrl: './radio-states.html',
  styleUrl: './radio-states.scss',
})
export class RadioStates {}

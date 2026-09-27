import { Component } from '@angular/core';

import { KuiFieldComponent, KuiInputDirective } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Shows interactive, read-only, disabled, and invalid native input states. */
@Component({
  selector: 'app-input-states',
  imports: [KuiFieldComponent, KuiInputDirective, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './input-states.html',
  styleUrl: './input-states.scss',
})
export class InputStates {}

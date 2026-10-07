import { Component } from '@angular/core';

import { KuiField, KuiInput } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Shows interactive, read-only, disabled, and invalid native input states. */
@Component({
  selector: 'app-input-states',
  imports: [KuiField, KuiInput, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './input-states.html',
  styleUrl: './input-states.scss',
})
export class InputStates {}

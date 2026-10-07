import { Component } from '@angular/core';

import { KuiField, KuiInput } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Compares representative native input types styled by the Input directive. */
@Component({
  selector: 'app-input-types',
  imports: [KuiField, KuiInput, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './input-types.html',
  styleUrl: './input-types.scss',
})
export class InputTypes {}

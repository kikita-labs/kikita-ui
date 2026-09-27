import { Component } from '@angular/core';

import { KuiFieldComponent, KuiInputDirective } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Compares representative native input types styled by the Input directive. */
@Component({
  selector: 'app-input-types',
  imports: [KuiFieldComponent, KuiInputDirective, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './input-types.html',
  styleUrl: './input-types.scss',
})
export class InputTypes {}

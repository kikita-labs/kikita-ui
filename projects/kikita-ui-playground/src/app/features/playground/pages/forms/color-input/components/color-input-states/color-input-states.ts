import { Component } from '@angular/core';

import { KuiColorInputDirective, KuiFieldComponent } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Shows disabled, read-only, focused, and invalid color inputs with field metadata. */
@Component({
  selector: 'app-color-input-states',
  imports: [KuiColorInputDirective, KuiFieldComponent, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './color-input-states.html',
  styleUrl: './color-input-states.scss',
})
export class ColorInputStates {}

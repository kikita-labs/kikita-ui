import { Component } from '@angular/core';

import { KuiNumberInputDirective, KuiTextDirective } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Shows an explicit Number Input id with a matching native label. */
@Component({
  selector: 'app-number-input-explicit-id',
  imports: [KuiNumberInputDirective, KuiTextDirective, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './number-input-explicit-id.html',
  styleUrl: './number-input-explicit-id.scss',
})
export class NumberInputExplicitId {}

import { Component } from '@angular/core';

import { KuiFieldComponent, KuiNumberInputDirective } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Shows the minimally configured Number Input within its accessible Field wrapper. */
@Component({
  selector: 'app-number-input-default',
  imports: [KuiFieldComponent, KuiNumberInputDirective, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './number-input-default.html',
})
export class NumberInputDefault {}

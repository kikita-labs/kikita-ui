import { Component } from '@angular/core';

import { KuiFieldComponent, KuiInputDirective } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Shows the minimally configured input inside its accessible Field wrapper. */
@Component({
  selector: 'app-input-default',
  imports: [KuiFieldComponent, KuiInputDirective, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './input-default.html',
})
export class InputDefault {}

import { Component } from '@angular/core';

import { KuiField, KuiInput } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Shows the minimally configured input inside its accessible Field wrapper. */
@Component({
  selector: 'app-input-default',
  imports: [KuiField, KuiInput, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './input-default.html',
})
export class InputDefault {}

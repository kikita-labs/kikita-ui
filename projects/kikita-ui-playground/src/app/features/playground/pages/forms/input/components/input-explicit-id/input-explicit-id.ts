import { Component } from '@angular/core';

import { KuiInput, KuiText } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Shows the public explicit id input on a standalone native input. */
@Component({
  selector: 'app-input-explicit-id',
  imports: [KuiInput, KuiText, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './input-explicit-id.html',
})
export class InputExplicitId {}

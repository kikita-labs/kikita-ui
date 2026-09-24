import { Component } from '@angular/core';

import { KuiFieldComponent, KuiTextareaDirective } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Shows the minimally configured textarea inside its accessible Field wrapper. */
@Component({
  selector: 'app-textarea-default',
  imports: [KuiFieldComponent, KuiTextareaDirective, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './textarea-default.html',
})
export class TextareaDefault {}

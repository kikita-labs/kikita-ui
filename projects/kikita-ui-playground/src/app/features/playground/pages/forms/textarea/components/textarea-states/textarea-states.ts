import { Component } from '@angular/core';

import { KuiFieldComponent, KuiTextareaDirective, KuiTextDirective } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Shows native Textarea states and the directive's standalone invalid state. */
@Component({
  selector: 'app-textarea-states',
  imports: [
    KuiFieldComponent,
    KuiTextDirective,
    KuiTextareaDirective,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  templateUrl: './textarea-states.html',
  styleUrl: './textarea-states.scss',
})
export class TextareaStates {}

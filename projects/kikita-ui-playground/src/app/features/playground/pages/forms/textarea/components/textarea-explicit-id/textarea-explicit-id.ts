import { Component } from '@angular/core';

import { KuiTextareaDirective, KuiTextDirective } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Shows the public explicit id on a standalone textarea with a native label. */
@Component({
  selector: 'app-textarea-explicit-id',
  imports: [KuiTextDirective, KuiTextareaDirective, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './textarea-explicit-id.html',
  styleUrl: './textarea-explicit-id.scss',
})
export class TextareaExplicitId {}

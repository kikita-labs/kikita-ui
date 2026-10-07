import { Component } from '@angular/core';

import { KuiText, KuiTextarea } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Shows the public explicit id on a standalone textarea with a native label. */
@Component({
  selector: 'app-textarea-explicit-id',
  imports: [KuiText, KuiTextarea, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './textarea-explicit-id.html',
  styleUrl: './textarea-explicit-id.scss',
})
export class TextareaExplicitId {}

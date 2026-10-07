import { Component } from '@angular/core';

import { KuiField, KuiTextarea } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Shows each supported Textarea size. */
@Component({
  selector: 'app-textarea-sizes',
  imports: [KuiField, KuiTextarea, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './textarea-sizes.html',
  styleUrl: './textarea-sizes.scss',
})
export class TextareaSizes {}

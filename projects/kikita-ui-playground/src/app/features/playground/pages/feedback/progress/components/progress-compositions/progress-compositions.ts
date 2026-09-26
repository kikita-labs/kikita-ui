import { Component } from '@angular/core';

import { KuiProgressComponent, KuiTextDirective } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Shows external linear labels and projected circular center content. */
@Component({
  selector: 'app-progress-compositions',
  imports: [KuiProgressComponent, KuiTextDirective, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './progress-compositions.html',
  styleUrl: './progress-compositions.scss',
})
export class ProgressCompositions {}

import { Component } from '@angular/core';

import { KuiProgress } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Shows the minimally configured, indeterminate Progress default. */
@Component({
  selector: 'app-progress-default',
  imports: [KuiProgress, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './progress-default.html',
  styleUrl: './progress-default.scss',
})
export class ProgressDefault {}

import { Component } from '@angular/core';

import { KuiProgressComponent } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Shows the minimally configured, indeterminate Progress default. */
@Component({
  selector: 'app-progress-default',
  imports: [KuiProgressComponent, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './progress-default.html',
  styleUrl: './progress-default.scss',
})
export class ProgressDefault {}

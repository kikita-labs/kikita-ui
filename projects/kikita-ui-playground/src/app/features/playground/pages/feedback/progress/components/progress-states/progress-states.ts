import { Component } from '@angular/core';

import { KuiProgressComponent, KuiTextDirective } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Shows Progress value coercion, clamping, and indeterminate shapes. */
@Component({
  selector: 'app-progress-states',
  imports: [KuiProgressComponent, KuiTextDirective, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './progress-states.html',
  styleUrl: './progress-states.scss',
})
export class ProgressStates {
  protected readonly values: readonly number[] = [-20, 0, 12.5, 50, 100, 120];

  protected clampedValue(value: number): number {
    return Math.max(0, Math.min(100, value));
  }
}

import { Component, signal } from '@angular/core';

import { KuiButtonDirective, KuiStepComponent, KuiStepperComponent } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Shows explicit disabled and error-derived Stepper states. */
@Component({
  selector: 'app-stepper-state-examples',
  imports: [
    KuiButtonDirective,
    KuiStepComponent,
    KuiStepperComponent,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  templateUrl: './stepper-state-examples.html',
  styleUrl: './stepper-state-examples.scss',
})
export class StepperStateExamples {
  protected readonly errorEnabled = signal(true);

  protected toggleError(): void {
    this.errorEnabled.update((enabled) => !enabled);
  }
}

import { Component, signal } from '@angular/core';

import { KuiButtonDirective, KuiStepComponent, KuiStepperComponent } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Shows consumer-owned linear controls and non-linear step navigation. */
@Component({
  selector: 'app-stepper-navigation-examples',
  imports: [
    KuiButtonDirective,
    KuiStepComponent,
    KuiStepperComponent,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  templateUrl: './stepper-navigation-examples.html',
  styleUrl: './stepper-navigation-examples.scss',
})
export class StepperNavigationExamples {
  protected readonly linearIndex = signal(1);
  protected readonly nonlinearIndex = signal(0);

  protected previousLinear(): void {
    this.linearIndex.update((index) => Math.max(index - 1, 0));
  }

  protected nextLinear(): void {
    this.linearIndex.update((index) => Math.min(index + 1, 2));
  }
}

import { Component, ViewEncapsulation, WritableSignal, signal } from '@angular/core';

import { KuiButtonDirective, KuiStepComponent, KuiStepperComponent } from '@kikita-labs/ui';

import { PlaygroundPanelComponent } from '../../shared/panel/panel.component';

@Component({
  selector: 'app-stepper-page',
  imports: [KuiButtonDirective, KuiStepComponent, KuiStepperComponent, PlaygroundPanelComponent],
  templateUrl: './stepper.page.html',
  styleUrl: './stepper.page.scss',
  encapsulation: ViewEncapsulation.None,
})
export class StepperPage {
  protected readonly basicStep = signal(1);
  protected readonly verticalStep = signal(1);
  protected readonly nonLinearStep = signal(0);
  protected readonly errorVisible = signal(true);

  protected readonly sizeRows = [
    { value: 'sm' as const, label: 'sm · 24px' },
    { value: 'md' as const, label: 'md · 32px (default)' },
    { value: 'lg' as const, label: 'lg · 40px' },
  ];

  protected next(step: WritableSignal<number>, max: number): void {
    step.update((value) => Math.min(value + 1, max));
  }

  protected prev(step: WritableSignal<number>): void {
    step.update((value) => Math.max(value - 1, 0));
  }
}

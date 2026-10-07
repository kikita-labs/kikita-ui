import { Component } from '@angular/core';

import { KuiStep, KuiStepper, KuiText } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Shows Stepper defaults, orientations, supported sizes, and compact mode. */
@Component({
  selector: 'app-stepper-static-examples',
  imports: [KuiStep, KuiStepper, KuiText, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './stepper-static-examples.html',
  styleUrl: './stepper-static-examples.scss',
})
export class StepperStaticExamples {
  protected readonly sizes = [
    { key: 'small', value: 'sm' },
    { key: 'medium', value: 'md' },
    { key: 'large', value: 'lg' },
  ] as const;
}

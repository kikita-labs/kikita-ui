import { Component } from '@angular/core';

import { KuiTextDirective } from '@kikita-labs/ui';

import { TranslocoPipe } from '@jsverse/transloco';

import {
  StepperNavigationExamples,
  StepperStateExamples,
  StepperStaticExamples,
} from './components';

/** Shows Stepper defaults, supported states, sizes, and consumer-owned navigation. */
@Component({
  selector: 'app-stepper',
  imports: [
    KuiTextDirective,
    StepperNavigationExamples,
    StepperStateExamples,
    StepperStaticExamples,
    TranslocoPipe,
  ],
  templateUrl: './stepper.html',
  styleUrl: './stepper.scss',
})
export class Stepper {}

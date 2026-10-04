import type { Signal } from '@angular/core';
import { InjectionToken } from '@angular/core';

import type { KuiStep } from './kui-step.component';

/** Shared context provided by KuiStepper to projected `kui-step` children. */
export interface KuiStepperContext {
  readonly currentIndex: Signal<number>;
  /** Effective linear flag: the `linear` input, then `defaults.stepper.linear`, then `true`. */
  readonly effectiveLinear: Signal<boolean>;
  readonly steps: Signal<readonly KuiStep[]>;
  goTo(index: number): void;
}

/** Injection token used by `kui-step` to access its parent stepper state. */
export const KUI_STEPPER_CONTEXT = new InjectionToken<KuiStepperContext>('KuiStepperContext');

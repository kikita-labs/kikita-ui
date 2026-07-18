import type { Signal } from '@angular/core';
import { InjectionToken } from '@angular/core';

import type { KuiStepComponent } from './kui-step.component';

/** Shared context provided by KuiStepperComponent to projected `kui-step` children. */
export interface KuiStepperContext {
  readonly currentIndex: Signal<number>;
  readonly linear: Signal<boolean>;
  readonly steps: Signal<readonly KuiStepComponent[]>;
  goTo(index: number): void;
}

/** Injection token used by `kui-step` to access its parent stepper state. */
export const KUI_STEPPER_CONTEXT = new InjectionToken<KuiStepperContext>('KuiStepperContext');

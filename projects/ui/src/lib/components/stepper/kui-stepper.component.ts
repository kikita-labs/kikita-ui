import {
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  contentChildren,
  inject,
  input,
  model,
} from '@angular/core';

import { KuiStepComponent } from './kui-step.component';
import { KUI_STEPPER_CONTEXT, KuiStepperContext } from './kui-stepper-context.token';
import { injectKuiRootSizeDefault } from '../../utils/kui-defaults.util';

/** Layout direction of the step list. */
export type KuiStepperOrientation = 'horizontal' | 'vertical';
/** Circle/label size for `kui-stepper`. */
export type KuiStepperSize = 'sm' | 'md' | 'lg';

const KUI_STEPPER_SIZES = ['sm', 'md', 'lg'] as const;

/**
 * Progress indicator for a multi-step process. Projects `kui-step` children and
 * derives each step's visual state (done/current/upcoming/disabled/error) from
 * `currentIndex` and each step's own `hasError` flag.
 *
 * @example
 * ```html
 * <kui-stepper [(currentIndex)]="step" aria-label="Progress">
 *   <kui-step label="Account" />
 *   <kui-step label="Workspace" />
 *   <kui-step label="Invite team" />
 * </kui-stepper>
 * ```
 */
@Component({
  selector: 'kui-stepper',
  template: `<ng-content />`,
  host: {
    class: 'kui-stepper',
    role: 'list',
    '[attr.data-kui-orientation]': "orientation() === 'vertical' ? 'vertical' : null",
    '[attr.data-kui-size]': 'effectiveSize()',
    '[attr.data-kui-compact]': "compact() ? '' : null",
  },
  providers: [
    {
      provide: KUI_STEPPER_CONTEXT,
      useFactory: () => inject(KuiStepperComponent),
    },
  ],
  encapsulation: ViewEncapsulation.None,
})
/** Coordinates a sequence of Kikita UI steps and exposes stepper context. */
export class KuiStepperComponent implements KuiStepperContext {
  /** Layout direction of the step list. Defaults to horizontal. */
  readonly orientation = input<KuiStepperOrientation>('horizontal');
  /** Circle size and label font scale. Defaults to md. */
  readonly size = input<KuiStepperSize | undefined>();
  /** Index of the currently active step. Supports two-way binding. */
  readonly currentIndex = model(0);
  /**
   * When true (default), only completed steps can be clicked to go back;
   * upcoming steps cannot be jumped to. Set to false to allow clicking
   * upcoming steps to jump forward.
   */
  readonly linear = input(true, { transform: booleanAttribute });
  /** Shows only step circles/dots without labels or descriptions. */
  readonly compact = input(false, { transform: booleanAttribute });

  readonly steps = contentChildren(KuiStepComponent);

  private readonly rootDefaultSize = injectKuiRootSizeDefault<KuiStepperSize>(KUI_STEPPER_SIZES);

  protected readonly effectiveSize = computed(() => this.size() ?? this.rootDefaultSize ?? 'md');

  /** @internal */
  goTo(index: number): void {
    if (index < this.currentIndex() || (!this.linear() && index > this.currentIndex())) {
      this.currentIndex.set(index);
    }
  }
}

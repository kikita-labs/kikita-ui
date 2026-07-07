import {
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  inject,
  input,
} from '@angular/core';

import { KUI_STEPPER_CONTEXT } from './kui-stepper-context.token';

/** Visual state of a `kui-step`, derived from its position relative to the stepper's currentIndex. */
export type KuiStepState = 'done' | 'current' | 'upcoming' | 'disabled' | 'error';

/**
 * A single step inside `kui-stepper`. State is not set directly; it is derived
 * from the step's position relative to the parent's `currentIndex` and this
 * step's own `hasError` flag. A step after an errored step is automatically `disabled`.
 *
 * @example
 * ```html
 * <kui-step label="Payment" description="Card declined" [hasError]="true" />
 * ```
 */
@Component({
  selector: 'kui-step',
  template: `
    <span class="kui-step-track">
      <span
        class="kui-step-line"
        aria-hidden="true"
        [attr.data-kui-done]="lineBeforeDone() ? '' : null"
      ></span>
      @if (clickable()) {
        <button
          class="kui-step-circle"
          type="button"
          [attr.aria-label]="circleLabel()"
          (click)="onCircleClick()"
        >
          @if (state() === 'done') {
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M3 8.5l3.2 3.2L13 5"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          } @else {
            {{ index() + 1 }}
          }
        </button>
      } @else {
        <span class="kui-step-circle">
          @if (state() === 'error') {
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M5 5l6 6M11 5l-6 6"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          } @else {
            {{ index() + 1 }}
          }
        </span>
      }
      <span
        class="kui-step-line"
        aria-hidden="true"
        [attr.data-kui-done]="lineAfterDone() ? '' : null"
      ></span>
    </span>
    <span class="kui-step-body">
      <span class="kui-step-label">{{ label() }}</span>
      @if (description()) {
        <span class="kui-step-description">{{ description() }}</span>
      }
    </span>
  `,
  host: {
    class: 'kui-step',
    role: 'listitem',
    '[attr.data-kui-state]': 'state()',
    '[attr.aria-current]': "state() === 'current' ? 'step' : null",
  },
  encapsulation: ViewEncapsulation.None,
})
export class KuiStepComponent {
  /** Step label text. */
  readonly label = input<string>('');
  /** Optional secondary line rendered under the label. */
  readonly description = input<string>('');
  /** Marks this step as errored. Overrides done/current for this step and disables later steps. */
  readonly hasError = input(false, { transform: booleanAttribute });
  /** Forces this step to render as disabled regardless of its position. */
  readonly disabled = input(false, { transform: booleanAttribute });

  private readonly ctx = inject(KUI_STEPPER_CONTEXT);

  protected readonly index = computed(() => this.ctx.steps().indexOf(this));

  private readonly errorIndex = computed(() =>
    this.ctx.steps().findIndex((step) => step.hasError()),
  );

  protected readonly state = computed<KuiStepState>(() => {
    if (this.hasError()) return 'error';

    const errorIndex = this.errorIndex();
    if (errorIndex !== -1 && this.index() > errorIndex) return 'disabled';
    if (this.disabled()) return 'disabled';

    const current = this.ctx.currentIndex();
    if (this.index() < current) return 'done';
    if (this.index() === current) return 'current';
    return 'upcoming';
  });

  protected readonly lineBeforeDone = computed(() => this.index() <= this.ctx.currentIndex());
  protected readonly lineAfterDone = computed(() => this.index() < this.ctx.currentIndex());

  protected readonly clickable = computed(() => {
    const s = this.state();
    return s === 'done' || (s === 'upcoming' && !this.ctx.linear());
  });

  protected readonly circleLabel = computed(() =>
    this.state() === 'done' ? `Back to step ${this.label()}` : `Go to step ${this.label()}`,
  );

  protected onCircleClick(): void {
    this.ctx.goTo(this.index());
  }
}

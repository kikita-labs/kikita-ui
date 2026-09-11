import { Component, input, output, ViewEncapsulation } from '@angular/core';

import {
  KUI_CHEVRON_DOWN_D,
  KUI_CLOCK_CIRCLE,
  KUI_CLOCK_D,
  KUI_X_D,
} from '../../utils/kui-chrome-icon-paths.util';
import { KuiFieldActionDirective, KuiFieldAffixIconDirective } from '../field';

/** @internal Visual leading icon + trailing clear/chevron rendered over `input[kuiTimePicker]`. */
@Component({
  selector: 'kui-time-picker-input-affix',
  imports: [KuiFieldAffixIconDirective, KuiFieldActionDirective],
  template: `
    <span kuiFieldAffixIcon>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle
          cx="${KUI_CLOCK_CIRCLE.cx}"
          cy="${KUI_CLOCK_CIRCLE.cy}"
          r="${KUI_CLOCK_CIRCLE.r}"
          stroke="currentColor"
          stroke-width="2"
        ></circle>
        <path
          d="${KUI_CLOCK_D}"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        ></path>
      </svg>
    </span>

    <div class="kui-timepicker-suffix">
      @if (clearable() && hasValue() && !disabled() && !readonly()) {
        <button
          kuiFieldAction
          type="button"
          class="kui-timepicker-clear"
          aria-label="Clear"
          (click)="onClear($event)"
        >
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" aria-hidden="true">
            <path
              d="${KUI_X_D[0]}"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
            />
            <path
              d="${KUI_X_D[1]}"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
            />
          </svg>
        </button>
      }

      <button
        kuiFieldAction
        type="button"
        class="kui-timepicker-chevron"
        tabindex="-1"
        [disabled]="disabled() || readonly()"
        [attr.aria-label]="isOpen() ? 'Close time picker' : 'Open time picker'"
        [attr.aria-expanded]="isOpen()"
        (click)="onToggle($event)"
      >
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden="true">
          <path
            d="${KUI_CHEVRON_DOWN_D}"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </div>
  `,
  host: { class: 'kui-timepicker-control-overlay' },
  encapsulation: ViewEncapsulation.None,
})
/** Renders time-picker input controls such as clock icon and clear/chevron actions. */
export class KuiTimePickerInputAffixComponent {
  readonly clearable = input(false);
  readonly hasValue = input(false);
  readonly isOpen = input(false);
  readonly disabled = input(false);
  readonly readonly = input(false);
  readonly cleared = output<void>();
  readonly toggled = output<void>();

  protected onClear(event: MouseEvent): void {
    event.stopPropagation();
    this.cleared.emit();
  }

  protected onToggle(event: MouseEvent): void {
    event.stopPropagation();
    this.toggled.emit();
  }
}

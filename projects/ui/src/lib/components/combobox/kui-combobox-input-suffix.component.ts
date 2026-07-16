import { Component, input, output, ViewEncapsulation } from '@angular/core';

import { KUI_CHEVRON_DOWN_D, KUI_X_D } from '../../utils/kui-chrome-icon-paths.util';
import { KuiFieldActionDirective } from '../field';

/** @internal Visual suffix rendered over `input[kuiCombobox]`. */
@Component({
  selector: 'kui-combobox-input-suffix',
  imports: [KuiFieldActionDirective],
  template: `
    <div class="kui-combobox-input-suffix">
      @if (loading()) {
        <span class="kui-combobox-loader" aria-hidden="true"></span>
      } @else if (clearable() && hasValue() && !disabled() && !readonly()) {
        <button
          kuiFieldAction
          type="button"
          class="kui-combobox-clear"
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
        class="kui-combobox-chevron"
        tabindex="-1"
        [disabled]="disabled() || readonly()"
        [attr.aria-label]="isOpen() ? 'Close options' : 'Open options'"
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
  host: { class: 'kui-combobox-control-overlay' },
  encapsulation: ViewEncapsulation.None,
})
export class KuiComboboxInputSuffixComponent {
  readonly clearable = input(false);
  readonly hasValue = input(false);
  readonly isOpen = input(false);
  readonly loading = input(false);
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

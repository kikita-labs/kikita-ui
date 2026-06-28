import { Component, input, output, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'kui-select-input-suffix',
  template: `
    @if (clearable() && hasValue()) {
      <button type="button" class="kui-select-clear" aria-label="Clear" (click)="onClear($event)">
        <svg viewBox="0 0 14 14" width="12" height="12" fill="none" aria-hidden="true">
          <path
            d="M2 2l10 10M12 2L2 12"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linecap="round"
          />
        </svg>
      </button>
    }
    <svg
      class="kui-select-chevron"
      [class.is-open]="isOpen()"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 6l4 4 4-4"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  `,
  host: { class: 'kui-select-input-suffix' },
  encapsulation: ViewEncapsulation.None,
})
/** @internal Chevron + optional clear button rendered as absolute suffix inside `.kui-field__control`. */
export class KuiSelectInputSuffixComponent {
  readonly clearable = input(false);
  readonly hasValue = input(false);
  readonly isOpen = input(false);
  readonly cleared = output<void>();

  protected onClear(e: MouseEvent): void {
    e.stopPropagation();
    this.cleared.emit();
  }
}

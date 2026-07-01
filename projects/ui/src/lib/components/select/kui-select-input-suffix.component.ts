import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, input, output, TemplateRef, ViewEncapsulation } from '@angular/core';

import { KuiChipDirective } from '../chip/kui-chip.directive';
import { KuiChipRemoveDirective } from '../chip/kui-chip-remove.directive';
import { KuiSelectValueContext } from './kui-select-value.directive';

/** @internal Selected item rendered inside a multiple select control. */
export interface KuiSelectChipItem {
  readonly value: unknown;
  readonly label: string;
}

@Component({
  selector: 'kui-select-input-suffix',
  imports: [NgTemplateOutlet, KuiChipDirective, KuiChipRemoveDirective],
  template: `
    @if (selectedItems().length) {
      <div class="kui-select-chip-layer">
        @for (item of visibleItems(); track item.value) {
          @if (valueTemplate(); as tpl) {
            <ng-container *ngTemplateOutlet="tpl; context: valueContext(item.value, item.label)" />
          } @else {
            <span kuiChip size="sm" (removed)="removed.emit(item.value)">
              <span class="kui-chip-label">{{ item.label }}</span>
              <button kuiChipRemove [attr.aria-label]="'Remove ' + item.label">
                <svg width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path
                    d="M4 4l8 8M12 4l-8 8"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                  />
                </svg>
              </button>
            </span>
          }
        }
        @if (hiddenCount() > 0) {
          <span kuiChip size="sm" class="kui-select-chip-overflow">+{{ hiddenCount() }}</span>
        }
      </div>
    }

    <div class="kui-select-input-suffix">
      @if (clearable() && hasValue()) {
        <button
          type="button"
          class="kui-field-action kui-select-clear"
          aria-label="Clear"
          (click)="onClear($event)"
        >
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
    </div>
  `,
  host: { class: 'kui-select-control-overlay' },
  encapsulation: ViewEncapsulation.None,
})
/** @internal Select visual overlay rendered inside `.kui-field__control`. */
export class KuiSelectInputSuffixComponent {
  readonly clearable = input(false);
  readonly hasValue = input(false);
  readonly isOpen = input(false);
  readonly selectedItems = input<readonly KuiSelectChipItem[]>([]);
  readonly maxVisibleChips = input(3);
  readonly valueTemplate = input<TemplateRef<KuiSelectValueContext> | null>(null);
  readonly cleared = output<void>();
  readonly removed = output<unknown>();

  protected readonly visibleItems = computed(() =>
    this.selectedItems().slice(0, Math.max(0, this.maxVisibleChips())),
  );

  protected readonly hiddenCount = computed(() =>
    Math.max(0, this.selectedItems().length - this.visibleItems().length),
  );

  protected onClear(e: MouseEvent): void {
    e.stopPropagation();
    this.cleared.emit();
  }

  protected valueContext(value: unknown, label: string): KuiSelectValueContext {
    return {
      $implicit: value,
      item: value,
      label,
      remove: () => this.removed.emit(value),
    };
  }
}

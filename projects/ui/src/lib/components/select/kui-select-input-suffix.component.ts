import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, input, output, TemplateRef, ViewEncapsulation } from '@angular/core';

import { KUI_CHEVRON_DOWN_D, KUI_X_D } from '../../utils/kui-chrome-icon-paths.util';
import { KuiChipDirective } from '../chip/kui-chip.directive';
import { KuiChipRemoveDirective } from '../chip/kui-chip-remove.directive';
import { KuiFieldActionDirective } from '../field';
import { KuiSelectValueContext } from './kui-select-value.directive';

/** @internal Selected item rendered inside a multiple select control. */
export interface KuiSelectChipItem {
  readonly value: unknown;
  readonly label: string;
}

@Component({
  selector: 'kui-select-input-suffix',
  imports: [NgTemplateOutlet, KuiChipDirective, KuiChipRemoveDirective, KuiFieldActionDirective],
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
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="${KUI_X_D[0]}"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                  />
                  <path
                    d="${KUI_X_D[1]}"
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
          kuiFieldAction
          type="button"
          class="kui-select-clear"
          aria-label="Clear"
          [disabled]="disabled() || readonly()"
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
        class="kui-select-chevron"
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
  host: { class: 'kui-select-control-overlay' },
  encapsulation: ViewEncapsulation.None,
})
/** @internal Select visual overlay rendered inside `.kui-field__control`. */
export class KuiSelectInputSuffixComponent {
  readonly clearable = input(false);
  readonly hasValue = input(false);
  readonly isOpen = input(false);
  readonly disabled = input(false);
  readonly readonly = input(false);
  readonly selectedItems = input<readonly KuiSelectChipItem[]>([]);
  readonly maxVisibleChips = input(3);
  readonly valueTemplate = input<TemplateRef<KuiSelectValueContext> | null>(null);
  readonly cleared = output<void>();
  readonly removed = output<unknown>();
  readonly toggled = output<void>();

  protected readonly visibleItems = computed(() =>
    this.selectedItems().slice(0, Math.max(0, this.maxVisibleChips())),
  );

  protected readonly hiddenCount = computed(() =>
    Math.max(0, this.selectedItems().length - this.visibleItems().length),
  );

  protected onClear(e: MouseEvent): void {
    e.stopPropagation();
    if (this.disabled() || this.readonly()) return;
    this.cleared.emit();
  }

  protected onToggle(e: MouseEvent): void {
    e.preventDefault();
    e.stopPropagation();
    if (this.disabled() || this.readonly()) return;
    this.toggled.emit();
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

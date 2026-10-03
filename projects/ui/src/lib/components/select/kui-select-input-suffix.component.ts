import { NgTemplateOutlet } from '@angular/common';
import type { TemplateRef } from '@angular/core';
import { Component, computed, inject, input, output, ViewEncapsulation } from '@angular/core';

import { injectKuiMessages } from '../../i18n/inject-kui-messages';
import { KuiDefaults } from '../../providers/kui-defaults.service';
import { KuiChipDirective } from '../chip/kui-chip.directive';
import { KuiChipRemoveDirective } from '../chip/kui-chip-remove.directive';
import { KuiFieldActionDirective } from '../field';
import { injectKuiGlyph } from '../icon/inject-kui-glyph';
import { KUI_GLYPH_CHEVRON_DOWN, KUI_GLYPH_X } from '../icon/kui-chrome-glyphs';
import { KuiGlyphComponent } from '../icon/kui-glyph.component';
import type { KuiSelectValueContext } from './kui-select-value.directive';

/** @internal Selected item rendered inside a multiple select control. */
export interface KuiSelectChipItem {
  readonly value: unknown;
  readonly label: string;
}

@Component({
  selector: 'kui-select-input-suffix',
  imports: [
    NgTemplateOutlet,
    KuiChipDirective,
    KuiChipRemoveDirective,
    KuiFieldActionDirective,
    KuiGlyphComponent,
  ],
  template: `
    @if (selectedItems().length) {
      <div class="kui-select-chip-layer">
        @for (item of visibleItems(); track item.value) {
          @if (valueTemplate(); as tpl) {
            <ng-container *ngTemplateOutlet="tpl; context: valueContext(item.value, item.label)" />
          } @else {
            <span kuiChip size="sm" (removed)="removed.emit(item.value)">
              <span class="kui-chip-label">{{ item.label }}</span>
              <button kuiChipRemove [attr.aria-label]="t().removeItem({ label: item.label })">
                <svg width="10" height="10" [kuiGlyph]="removeGlyph()" [kuiGlyphStroke]="2"></svg>
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
          [attr.aria-label]="common().clear"
          [disabled]="disabled() || readonly()"
          (click)="onClear($event)"
        >
          <svg width="12" height="12" [kuiGlyph]="clearGlyph()" [kuiGlyphStroke]="1.6"></svg>
        </button>
      }
      <button
        kuiFieldAction
        type="button"
        class="kui-select-chevron"
        [disabled]="disabled() || readonly()"
        [attr.aria-label]="isOpen() ? t().closeOptions : t().openOptions"
        [attr.aria-expanded]="isOpen()"
        (click)="onToggle($event)"
      >
        <svg width="14" height="14" [kuiGlyph]="chevronGlyph()" [kuiGlyphStroke]="1.6"></svg>
      </button>
    </div>
  `,
  host: { class: 'kui-select-control-overlay' },
  encapsulation: ViewEncapsulation.None,
})
/** @internal Select visual overlay rendered inside `.kui-field__control`. */
export class KuiSelectInputSuffixComponent {
  protected readonly t = injectKuiMessages('select');
  protected readonly common = injectKuiMessages('common');

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

  private readonly defaults = inject(KuiDefaults);
  private readonly selectDefaults = this.defaults.get('select');
  private readonly chipDefaults = this.defaults.get('chip');

  protected readonly removeGlyph = injectKuiGlyph({
    role: 'remove',
    slot: () => this.chipDefaults()?.removeIcon,
    fallback: KUI_GLYPH_X,
  });

  protected readonly clearGlyph = injectKuiGlyph({
    role: 'clear',
    slot: () => this.selectDefaults()?.clearIcon,
    fallback: KUI_GLYPH_X,
  });

  protected readonly chevronGlyph = injectKuiGlyph({
    role: 'pickerChevron',
    slot: () => this.selectDefaults()?.chevronIcon,
    fallback: KUI_GLYPH_CHEVRON_DOWN,
  });

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

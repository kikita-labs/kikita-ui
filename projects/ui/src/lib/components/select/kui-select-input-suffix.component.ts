import { NgTemplateOutlet } from '@angular/common';
import type { TemplateRef } from '@angular/core';
import { Component, computed, inject, input, output, ViewEncapsulation } from '@angular/core';

import { injectKuiMessages } from '../../i18n/inject-kui-messages';
import { KuiDefaults } from '../../providers/kui-defaults.service';
import { KuiChip } from '../chip/kui-chip.directive';
import { KuiChipRemove } from '../chip/kui-chip-remove.directive';
import { KuiFieldAction } from '../field';
import { injectKuiGlyph } from '../icon/inject-kui-glyph';
import { KUI_GLYPH_CHEVRON_DOWN, KUI_GLYPH_X } from '../icon/kui-chrome-glyphs';
import { KuiGlyph } from '../icon/kui-glyph.component';
import type { KuiSelectValueContext } from './kui-select-value.directive';

/** @internal Selected item rendered inside a multiple select control. */
export interface KuiSelectChipItem {
  readonly value: unknown;
  readonly label: string;
}

@Component({
  selector: 'kui-select-input-suffix',
  imports: [NgTemplateOutlet, KuiChip, KuiChipRemove, KuiFieldAction, KuiGlyph],
  templateUrl: './kui-select-input-suffix.component.html',
  host: { class: 'kui-select-control-overlay' },
  encapsulation: ViewEncapsulation.None,
})
/** @internal Select visual overlay rendered inside `.kui-field__control`. */
export class KuiSelectInputSuffix {
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

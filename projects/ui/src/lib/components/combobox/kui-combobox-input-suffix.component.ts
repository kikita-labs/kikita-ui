import { Component, inject, input, output, ViewEncapsulation } from '@angular/core';

import { KuiDefaults } from '../../providers/kui-defaults.service';
import { KuiFieldActionDirective } from '../field';
import { injectKuiGlyph } from '../icon/inject-kui-glyph';
import { KUI_GLYPH_CHEVRON_DOWN, KUI_GLYPH_X } from '../icon/kui-chrome-glyphs';
import { KuiGlyphComponent } from '../icon/kui-glyph.component';

/** @internal Visual suffix rendered over `input[kuiCombobox]`. */
@Component({
  selector: 'kui-combobox-input-suffix',
  imports: [KuiFieldActionDirective, KuiGlyphComponent],
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
          <svg width="12" height="12" [kuiGlyph]="clearGlyph()" [kuiGlyphStroke]="1.6"></svg>
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
        <svg width="14" height="14" [kuiGlyph]="chevronGlyph()" [kuiGlyphStroke]="1.6"></svg>
      </button>
    </div>
  `,
  host: { class: 'kui-combobox-control-overlay' },
  encapsulation: ViewEncapsulation.None,
})
/** Renders combobox input actions such as clear and dropdown toggle controls. */
export class KuiComboboxInputSuffixComponent {
  private readonly comboboxDefaults = inject(KuiDefaults).get('combobox');

  protected readonly clearGlyph = injectKuiGlyph({
    role: 'clear',
    slot: () => this.comboboxDefaults()?.clearIcon,
    fallback: KUI_GLYPH_X,
  });

  protected readonly chevronGlyph = injectKuiGlyph({
    role: 'pickerChevron',
    slot: () => this.comboboxDefaults()?.chevronIcon,
    fallback: KUI_GLYPH_CHEVRON_DOWN,
  });

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

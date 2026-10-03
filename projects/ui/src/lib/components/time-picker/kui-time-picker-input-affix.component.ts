import { Component, inject, input, output, ViewEncapsulation } from '@angular/core';

import { KuiDefaults } from '../../providers/kui-defaults.service';
import { KuiFieldActionDirective, KuiFieldAffixIconDirective } from '../field';
import { injectKuiGlyph } from '../icon/inject-kui-glyph';
import { KUI_GLYPH_CHEVRON_DOWN, KUI_GLYPH_CLOCK, KUI_GLYPH_X } from '../icon/kui-chrome-glyphs';
import { KuiGlyphComponent } from '../icon/kui-glyph.component';

/** @internal Visual leading icon + trailing clear/chevron rendered over `input[kuiTimePicker]`. */
@Component({
  selector: 'kui-time-picker-input-affix',
  imports: [KuiFieldAffixIconDirective, KuiFieldActionDirective, KuiGlyphComponent],
  template: `
    <span kuiFieldAffixIcon>
      <svg width="16" height="16" [kuiGlyph]="clockGlyph" [kuiGlyphStroke]="2"></svg>
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
          <svg width="12" height="12" [kuiGlyph]="clearGlyph()" [kuiGlyphStroke]="1.6"></svg>
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
        <svg width="14" height="14" [kuiGlyph]="chevronGlyph()" [kuiGlyphStroke]="1.6"></svg>
      </button>
    </div>
  `,
  host: { class: 'kui-timepicker-control-overlay' },
  encapsulation: ViewEncapsulation.None,
})
/** Renders time-picker input controls such as clock icon and clear/chevron actions. */
export class KuiTimePickerInputAffixComponent {
  private readonly pickerDefaults = inject(KuiDefaults).get('timePicker');

  protected readonly clockGlyph = KUI_GLYPH_CLOCK;

  protected readonly clearGlyph = injectKuiGlyph({
    role: 'clear',
    slot: () => this.pickerDefaults()?.clearIcon,
    fallback: KUI_GLYPH_X,
  });

  protected readonly chevronGlyph = injectKuiGlyph({
    role: 'pickerChevron',
    slot: () => this.pickerDefaults()?.chevronIcon,
    fallback: KUI_GLYPH_CHEVRON_DOWN,
  });

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

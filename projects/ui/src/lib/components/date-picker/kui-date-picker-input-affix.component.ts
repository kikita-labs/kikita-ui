import { Component, inject, input, output, ViewEncapsulation } from '@angular/core';

import { injectKuiMessages } from '../../i18n/inject-kui-messages';
import type { KuiDatePickerMessages } from '../../i18n/kui-messages.interface';
import { KuiDefaults } from '../../providers/kui-defaults.service';
import { KuiFieldActionDirective, KuiFieldAffixIconDirective } from '../field';
import { injectKuiGlyph } from '../icon/inject-kui-glyph';
import { KUI_GLYPH_CALENDAR, KUI_GLYPH_CHEVRON_DOWN, KUI_GLYPH_X } from '../icon/kui-chrome-glyphs';
import { KuiGlyphComponent } from '../icon/kui-glyph.component';

/** @internal Visual leading icon + trailing clear/chevron rendered over `input[kuiDatePicker]`. */
@Component({
  selector: 'kui-date-picker-input-affix',
  imports: [KuiFieldAffixIconDirective, KuiFieldActionDirective, KuiGlyphComponent],
  template: `
    <span kuiFieldAffixIcon>
      <svg width="16" height="16" [kuiGlyph]="calendarGlyph" [kuiGlyphStroke]="2"></svg>
    </span>

    <div class="kui-date-picker-suffix">
      @if (clearable() && hasValue() && !disabled() && !readonly()) {
        <button
          kuiFieldAction
          type="button"
          class="kui-date-picker-clear"
          [attr.aria-label]="common().clear"
          (click)="onClear($event)"
        >
          <svg width="12" height="12" [kuiGlyph]="clearGlyph()" [kuiGlyphStroke]="1.6"></svg>
        </button>
      }

      <button
        kuiFieldAction
        type="button"
        class="kui-date-picker-chevron"
        tabindex="-1"
        [disabled]="disabled() || readonly()"
        [attr.aria-label]="isOpen() ? t().closeCalendar : t().openCalendar"
        [attr.aria-expanded]="isOpen()"
        (click)="onToggle($event)"
      >
        <svg width="14" height="14" [kuiGlyph]="chevronGlyph()" [kuiGlyphStroke]="1.6"></svg>
      </button>
    </div>
  `,
  host: { class: 'kui-date-picker-control-overlay' },
  encapsulation: ViewEncapsulation.None,
})
/** Renders date-picker input controls such as calendar and clear actions. */
export class KuiDatePickerInputAffixComponent {
  private readonly pickerDefaults = inject(KuiDefaults).get('datePicker');

  protected readonly calendarGlyph = KUI_GLYPH_CALENDAR;

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

  protected readonly t = injectKuiMessages('datePicker', () => this.messages());
  protected readonly common = injectKuiMessages('common');

  readonly clearable = input(false);
  readonly hasValue = input(false);
  readonly isOpen = input(false);
  readonly disabled = input(false);
  readonly readonly = input(false);
  readonly messages = input<Partial<KuiDatePickerMessages> | undefined>(undefined);
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

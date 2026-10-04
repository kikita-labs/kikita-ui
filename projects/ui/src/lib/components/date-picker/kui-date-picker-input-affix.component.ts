import { Component, inject, input, output, ViewEncapsulation } from '@angular/core';

import { injectKuiMessages } from '../../i18n/inject-kui-messages';
import type { KuiDatePickerMessages } from '../../i18n/kui-messages.interface';
import { KuiDefaults } from '../../providers/kui-defaults.service';
import { KuiFieldAction, KuiFieldAffixIcon } from '../field';
import { injectKuiGlyph } from '../icon/inject-kui-glyph';
import { KUI_GLYPH_CALENDAR, KUI_GLYPH_CHEVRON_DOWN, KUI_GLYPH_X } from '../icon/kui-chrome-glyphs';
import { KuiGlyph } from '../icon/kui-glyph.component';

/** @internal Visual leading icon + trailing clear/chevron rendered over `input[kuiDatePicker]`. */
@Component({
  selector: 'kui-date-picker-input-affix',
  imports: [KuiFieldAffixIcon, KuiFieldAction, KuiGlyph],
  templateUrl: './kui-date-picker-input-affix.component.html',
  host: { class: 'kui-date-picker-control-overlay' },
  encapsulation: ViewEncapsulation.None,
})
/** Renders date-picker input controls such as calendar and clear actions. */
export class KuiDatePickerInputAffix {
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

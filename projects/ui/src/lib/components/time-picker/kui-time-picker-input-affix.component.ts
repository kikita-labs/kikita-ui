import { Component, inject, input, output, ViewEncapsulation } from '@angular/core';

import { injectKuiMessages } from '../../i18n/inject-kui-messages';
import type { KuiTimePickerMessages } from '../../i18n/kui-messages.interface';
import { KuiDefaults } from '../../providers/kui-defaults.service';
import { KuiFieldAction, KuiFieldAffixIcon } from '../field';
import { injectKuiGlyph } from '../icon/inject-kui-glyph';
import { KUI_GLYPH_CHEVRON_DOWN, KUI_GLYPH_CLOCK, KUI_GLYPH_X } from '../icon/kui-chrome-glyphs';
import { KuiGlyph } from '../icon/kui-glyph.component';

/** @internal Visual leading icon + trailing clear/chevron rendered over `input[kuiTimePicker]`. */
@Component({
  selector: 'kui-time-picker-input-affix',
  imports: [KuiFieldAffixIcon, KuiFieldAction, KuiGlyph],
  templateUrl: './kui-time-picker-input-affix.component.html',
  host: { class: 'kui-timepicker-control-overlay' },
  encapsulation: ViewEncapsulation.None,
})
/** Renders time-picker input controls such as clock icon and clear/chevron actions. */
export class KuiTimePickerInputAffix {
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

  readonly messages = input<Partial<KuiTimePickerMessages> | undefined>(undefined);
  protected readonly t = injectKuiMessages('timePicker', () => this.messages());
  protected readonly common = injectKuiMessages('common');

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

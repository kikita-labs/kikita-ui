import { Component, inject, input, output, ViewEncapsulation } from '@angular/core';

import { injectKuiMessages } from '../../i18n/inject-kui-messages';
import { KuiDefaults } from '../../providers/kui-defaults';
import { KuiFieldAction } from '../field';
import { injectKuiGlyph } from '../icon/inject-kui-glyph';
import { KUI_GLYPH_CHEVRON_DOWN, KUI_GLYPH_X } from '../icon/kui-chrome-glyphs';
import { KuiGlyph } from '../icon/kui-glyph';

/** @internal Visual suffix rendered over `input[kuiCombobox]`. */
@Component({
  selector: 'kui-combobox-input-suffix',
  imports: [KuiFieldAction, KuiGlyph],
  templateUrl: './kui-combobox-input-suffix.html',
  host: { class: 'kui-combobox-control-overlay' },
  encapsulation: ViewEncapsulation.None,
})
/** Renders combobox input actions such as clear and dropdown toggle controls. */
export class KuiComboboxInputSuffix {
  private readonly comboboxDefaults = inject(KuiDefaults).get('combobox');
  protected readonly t = injectKuiMessages('combobox');
  protected readonly common = injectKuiMessages('common');

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

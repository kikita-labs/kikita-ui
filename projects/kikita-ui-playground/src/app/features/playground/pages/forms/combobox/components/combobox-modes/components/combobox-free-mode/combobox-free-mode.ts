import { Component, signal } from '@angular/core';

import { KuiCombobox, KuiDropdown, KuiField, KuiOption } from '@kikita-labs/ui';

import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-combobox-free-mode',
  imports: [KuiCombobox, KuiDropdown, KuiField, KuiOption, TranslocoPipe],
  templateUrl: './combobox-free-mode.html',
})
export class ComboboxFreeMode {
  protected readonly tag = signal<string | null>(null);
}

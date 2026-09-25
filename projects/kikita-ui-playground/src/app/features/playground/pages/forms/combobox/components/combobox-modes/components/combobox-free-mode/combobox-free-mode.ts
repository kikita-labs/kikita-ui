import { Component, signal } from '@angular/core';

import {
  KuiComboboxDirective,
  KuiDropdownComponent,
  KuiFieldComponent,
  KuiOptionDirective,
} from '@kikita-labs/ui';

import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-combobox-free-mode',
  imports: [
    KuiComboboxDirective,
    KuiDropdownComponent,
    KuiFieldComponent,
    KuiOptionDirective,
    TranslocoPipe,
  ],
  templateUrl: './combobox-free-mode.html',
})
export class ComboboxFreeMode {
  protected readonly tag = signal<string | null>(null);
}

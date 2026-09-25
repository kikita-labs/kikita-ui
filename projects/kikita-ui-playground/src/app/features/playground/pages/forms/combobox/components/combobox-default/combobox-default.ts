import { Component } from '@angular/core';

import {
  KuiComboboxDirective,
  KuiDropdownComponent,
  KuiFieldComponent,
  KuiOptionDirective,
} from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-combobox-default',
  imports: [
    KuiComboboxDirective,
    KuiDropdownComponent,
    KuiFieldComponent,
    KuiOptionDirective,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  templateUrl: './combobox-default.html',
})
export class ComboboxDefault {}

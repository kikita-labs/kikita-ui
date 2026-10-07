import { Component } from '@angular/core';

import { KuiCombobox, KuiDropdown, KuiField, KuiOption } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-combobox-default',
  imports: [KuiCombobox, KuiDropdown, KuiField, KuiOption, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './combobox-default.html',
})
export class ComboboxDefault {}

import { Component, signal } from '@angular/core';

import { KuiDropdown, KuiField, KuiOption, KuiSelect } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Shows keyboard opening, navigation, selection, and disabled-option skipping. */
@Component({
  selector: 'app-select-keyboard',
  imports: [KuiDropdown, KuiField, KuiOption, KuiSelect, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './select-keyboard.html',
})
export class SelectKeyboard {
  protected readonly value = signal<string | null>(null);
}

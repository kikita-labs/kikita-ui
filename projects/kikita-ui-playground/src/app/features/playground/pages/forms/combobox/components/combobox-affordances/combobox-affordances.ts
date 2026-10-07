import { Component, signal } from '@angular/core';

import { KuiCombobox, KuiDropdown, KuiField, KuiOption, KuiText } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-combobox-affordances',
  imports: [
    KuiCombobox,
    KuiDropdown,
    KuiField,
    KuiOption,
    KuiText,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  templateUrl: './combobox-affordances.html',
  styleUrl: './combobox-affordances.scss',
})
export class ComboboxAffordances {
  protected readonly selectedReviewer = signal<string | null>('Daniel Kowalski');

  protected readonly notClearable = signal<string | null>('Amelia Novak');
}

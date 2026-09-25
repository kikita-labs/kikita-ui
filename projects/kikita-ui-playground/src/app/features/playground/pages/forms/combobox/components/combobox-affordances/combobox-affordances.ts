import { Component, signal } from '@angular/core';

import {
  KuiComboboxDirective,
  KuiDropdownComponent,
  KuiFieldComponent,
  KuiOptionDirective,
  KuiTextDirective,
} from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-combobox-affordances',
  imports: [
    KuiComboboxDirective,
    KuiDropdownComponent,
    KuiFieldComponent,
    KuiOptionDirective,
    KuiTextDirective,
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

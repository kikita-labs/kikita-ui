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
  selector: 'app-combobox-field-states',
  imports: [
    KuiComboboxDirective,
    KuiDropdownComponent,
    KuiFieldComponent,
    KuiOptionDirective,
    KuiTextDirective,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  templateUrl: './combobox-field-states.html',
  styleUrl: './combobox-field-states.scss',
})
export class ComboboxFieldStates {
  protected readonly readonlyOwner = signal<string | null>('Amelia Novak');

  protected readonly fieldSizes = [
    { value: 'xs', labelKey: 'combobox.sizes.xs' },
    { value: 'sm', labelKey: 'combobox.sizes.sm' },
    { value: 'md', labelKey: 'combobox.sizes.md' },
    { value: 'lg', labelKey: 'combobox.sizes.lg' },
  ] as const;
}

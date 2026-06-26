import { Component, signal, ViewEncapsulation } from '@angular/core';

import {
  KuiDropdownComponent,
  KuiDropdownForDirective,
  KuiFieldComponent,
  KuiInputDirective,
  KuiOptionDirective,
} from '@kikita-labs/ui';

import { PlaygroundPanelComponent } from '../../shared/panel/panel.component';

const FRUITS = [
  'Apple',
  'Banana',
  'Blueberry',
  'Cherry',
  'Grape',
  'Mango',
  'Orange',
  'Peach',
  'Surinam Cherry (Pitanga) — tropical red berry',
];

const ACTIONS = [
  { value: 'edit', label: 'Edit' },
  { value: 'duplicate', label: 'Duplicate' },
  { value: 'archive', label: 'Archive' },
  { value: 'delete', label: 'Delete', disabled: true },
];

@Component({
  selector: 'app-dropdown-page',
  templateUrl: './dropdown.page.html',
  imports: [
    PlaygroundPanelComponent,
    KuiFieldComponent,
    KuiInputDirective,
    KuiDropdownComponent,
    KuiDropdownForDirective,
    KuiOptionDirective,
  ],
  encapsulation: ViewEncapsulation.None,
})
export class DropdownPage {
  protected readonly fruits = FRUITS;
  protected readonly actions = ACTIONS;
  protected readonly selectedFruit = signal<string | null>(null);
  protected readonly lastAction = signal<string | null>(null);
}

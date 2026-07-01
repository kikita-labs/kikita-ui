import { Component, signal, ViewEncapsulation } from '@angular/core';

import {
  KuiChipDirective,
  KuiChipRemoveDirective,
  KuiComboboxComponent,
  KuiComboboxValueDirective,
  KuiFieldComponent,
  type KuiChipAppearance,
} from '@kikita-labs/ui';

import { PlaygroundPanelComponent } from '../../shared/panel/panel.component';

interface Person {
  id: number;
  name: string;
}

const PEOPLE: readonly Person[] = [
  { id: 1, name: 'Nikita Ryabov' },
  { id: 2, name: 'Anna Smirnova' },
  { id: 3, name: 'Alex Kim' },
  { id: 4, name: 'Maria Chen' },
];

@Component({
  selector: 'app-combobox-page',
  templateUrl: './combobox.page.html',
  styleUrl: './combobox.page.scss',
  imports: [
    PlaygroundPanelComponent,
    KuiComboboxComponent,
    KuiComboboxValueDirective,
    KuiFieldComponent,
    KuiChipDirective,
    KuiChipRemoveDirective,
  ],
  encapsulation: ViewEncapsulation.None,
})
export class ComboboxPage {
  protected readonly people = PEOPLE;
  protected readonly statusOptions = ['Open', 'In progress', 'Done', 'Blocked'];
  protected readonly selectedPerson = signal<Person | null>(null);
  protected readonly selectedPeople = signal<readonly Person[]>(PEOPLE);
  protected readonly status = signal<string | null>(null);
  protected readonly freeValue = signal<string | null>(null);

  protected readonly personLabel = (person: Person): string => person.name;

  protected readonly personAppearance = (person: Person): KuiChipAppearance =>
    person.id % 2 === 0 ? 'info' : 'success';
}

import { Component, computed, signal, ViewEncapsulation } from '@angular/core';

import {
  KuiComboboxDirective,
  KuiComboboxHighlightPipe,
  KuiDropdownComponent,
  KuiFieldComponent,
  KuiOptionDirective,
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
    KuiComboboxDirective,
    KuiComboboxHighlightPipe,
    KuiDropdownComponent,
    KuiFieldComponent,
    KuiOptionDirective,
  ],
  encapsulation: ViewEncapsulation.None,
})
export class ComboboxPage {
  protected readonly people = PEOPLE;
  protected readonly statusOptions = ['Open', 'In progress', 'Done', 'Blocked'];
  protected readonly selectedPerson = signal<Person | null>(null);
  protected readonly status = signal<string | null>(null);
  protected readonly freeValue = signal<string | null>(null);
  protected readonly assigneeQuery = signal('');
  protected readonly asyncQuery = signal('');
  protected readonly loading = signal(false);

  protected readonly personLabel = (person: Person): string => person.name;

  protected readonly filteredPeople = computed(() => this.filterPeople(this.assigneeQuery()));

  protected readonly asyncPeople = computed(() => this.filterPeople(this.asyncQuery()));

  protected searchPeople(query: string): void {
    this.assigneeQuery.set(query);
  }

  protected searchAsync(query: string): void {
    this.asyncQuery.set(query);
    this.loading.set(query.length > 0);
    globalThis.setTimeout(() => this.loading.set(false), 350);
  }

  private filterPeople(query: string): readonly Person[] {
    const normalized = query.trim().toLocaleLowerCase();
    if (!normalized) return PEOPLE;

    return PEOPLE.filter((person) => person.name.toLocaleLowerCase().includes(normalized));
  }
}

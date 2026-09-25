import { Component, computed, signal } from '@angular/core';

import {
  KuiComboboxDirective,
  KuiComboboxHighlightPipe,
  KuiDropdownComponent,
  KuiFieldComponent,
  KuiOptionDirective,
} from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { COMBOBOX_PEOPLE } from '@features/playground/pages/forms/combobox/constants';
import type { ComboboxPerson } from '@features/playground/pages/forms/combobox/interfaces';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-combobox-filtering',
  imports: [
    KuiComboboxDirective,
    KuiComboboxHighlightPipe,
    KuiDropdownComponent,
    KuiFieldComponent,
    KuiOptionDirective,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  templateUrl: './combobox-filtering.html',
})
export class ComboboxFiltering {
  protected readonly assignee = signal<ComboboxPerson | null>(null);

  protected readonly query = signal('');

  protected readonly personLabel = (person: ComboboxPerson) => person.name;

  protected readonly filteredPeople = computed(() => {
    const query = this.query().trim().toLocaleLowerCase();

    return query
      ? COMBOBOX_PEOPLE.filter((person) => person.name.toLocaleLowerCase().includes(query))
      : COMBOBOX_PEOPLE;
  });
}

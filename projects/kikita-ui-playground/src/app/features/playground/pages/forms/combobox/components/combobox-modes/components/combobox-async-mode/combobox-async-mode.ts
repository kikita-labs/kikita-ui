import { Component, computed, signal } from '@angular/core';

import {
  KuiComboboxDirective,
  KuiDropdownComponent,
  KuiFieldComponent,
  KuiOptionDirective,
} from '@kikita-labs/ui';

import { COMBOBOX_PEOPLE } from '@features/playground/pages/forms/combobox/constants';
import type { ComboboxPerson } from '@features/playground/pages/forms/combobox/interfaces';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-combobox-async-mode',
  imports: [
    KuiComboboxDirective,
    KuiDropdownComponent,
    KuiFieldComponent,
    KuiOptionDirective,
    TranslocoPipe,
  ],
  templateUrl: './combobox-async-mode.html',
})
export class ComboboxAsyncMode {
  protected readonly reviewer = signal<ComboboxPerson | null>(null);

  protected readonly query = signal('');

  protected readonly personLabel = (person: ComboboxPerson) => person.name;

  protected readonly remoteResults = computed(() => {
    const query = this.query().trim().toLocaleLowerCase();

    return query
      ? COMBOBOX_PEOPLE.filter((person) => person.name.toLocaleLowerCase().includes(query))
      : COMBOBOX_PEOPLE;
  });
}

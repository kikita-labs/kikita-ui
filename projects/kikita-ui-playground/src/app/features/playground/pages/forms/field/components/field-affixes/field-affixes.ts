import { Component, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';

import { KuiField, KuiFieldAffix, KuiIcon, KuiInput, KuiLoader } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

import { FIELD_AFFIXES_FORM_DEFAULT_STATE } from './constants';
import type { FieldAffixesFormModel } from './interfaces';

@Component({
  selector: 'app-field-affixes',
  imports: [
    FormField,
    KuiFieldAffix,
    KuiField,
    KuiIcon,
    KuiInput,
    KuiLoader,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  templateUrl: './field-affixes.html',
  styleUrl: './field-affixes.scss',
})
export class FieldAffixes {
  private readonly model = signal<FieldAffixesFormModel>(FIELD_AFFIXES_FORM_DEFAULT_STATE);

  protected readonly searchForm = form(this.model);

  protected clearQuery(): void {
    this.model.update((value) => ({ ...value, query: '' }));
  }
}

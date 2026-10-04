import { Component, inject, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';

import { toSignal } from '@angular/core/rxjs-interop';

import { KuiCombobox, KuiDropdown, KuiField, KuiOption } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { COMBOBOX_SIGNAL_FORMS_DEFAULT_STATE } from './constants';
import { createComboboxSignalFormsSchema } from './helpers';
import type { ComboboxSignalFormsModel } from './interfaces';

/** Shows a required Combobox moving from untouched to invalid and then corrected. */
@Component({
  selector: 'app-combobox-signal-forms',
  imports: [
    FormField,
    KuiCombobox,
    KuiDropdown,
    KuiField,
    KuiOption,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  templateUrl: './combobox-signal-forms.html',
})
export class ComboboxSignalForms {
  private readonly transloco = inject(TranslocoService);

  private readonly model = signal<ComboboxSignalFormsModel>({
    ...COMBOBOX_SIGNAL_FORMS_DEFAULT_STATE,
  });

  private readonly requiredMessage = toSignal(
    this.transloco.selectTranslate('states.requiredOwner', {}, { scope: 'combobox' }),
    { initialValue: '' },
  );

  protected readonly assigneeForm = form(
    this.model,
    createComboboxSignalFormsSchema(() => this.requiredMessage()),
  );
}

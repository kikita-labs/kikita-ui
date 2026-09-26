import { Component, inject, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';

import { toSignal } from '@angular/core/rxjs-interop';

import {
  KuiDropdownComponent,
  KuiFieldComponent,
  KuiOptionDirective,
  KuiSelectDirective,
} from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { SELECT_VALIDATION_DEFAULT_STATE } from './constants';
import { createSelectValidationSchema } from './helpers';
import type { SelectValidationModel } from './interfaces';

/** Shows Select connected to a required Signal Forms field. */
@Component({
  selector: 'app-select-validation',
  imports: [
    FormField,
    KuiDropdownComponent,
    KuiFieldComponent,
    KuiOptionDirective,
    KuiSelectDirective,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  templateUrl: './select-validation.html',
})
export class SelectValidation {
  private readonly transloco = inject(TranslocoService);

  private readonly model = signal<SelectValidationModel>({ ...SELECT_VALIDATION_DEFAULT_STATE });
  private readonly requiredMessage = toSignal(
    this.transloco.selectTranslate('errors.required', {}, { scope: 'select' }),
    { initialValue: '' },
  );

  protected readonly validationForm = form(
    this.model,
    createSelectValidationSchema(() => this.requiredMessage()),
  );
}

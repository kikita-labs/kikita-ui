import { Component, inject, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';

import { toSignal } from '@angular/core/rxjs-interop';

import { KuiFieldComponent, KuiInputDirective } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { FIELD_VALIDATION_FORM_DEFAULT_STATE } from './constants';
import { createFieldValidationSchema } from './helpers';

@Component({
  selector: 'app-field-validation',
  imports: [FormField, KuiFieldComponent, KuiInputDirective, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './field-validation.html',
  styleUrl: './field-validation.scss',
})
export class FieldValidation {
  private readonly transloco = inject(TranslocoService);

  private readonly model = signal(FIELD_VALIDATION_FORM_DEFAULT_STATE);

  private readonly requiredMessage = toSignal(
    this.transloco.selectTranslate('errors.required', {}, { scope: 'field' }),
    { initialValue: '' },
  );

  protected readonly validationForm = form(
    this.model,
    createFieldValidationSchema(() => this.requiredMessage()),
  );
}

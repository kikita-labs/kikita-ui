import { Component, inject, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';

import { toSignal } from '@angular/core/rxjs-interop';

import { KuiField, KuiTextarea } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { TEXTAREA_VALIDATION_FORM_DEFAULT_STATE } from './constants';
import { createTextareaValidationSchema } from './helpers';

/** Shows a required Textarea moving from untouched to invalid and then corrected. */
@Component({
  selector: 'app-textarea-validation',
  imports: [FormField, KuiField, KuiTextarea, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './textarea-validation.html',
  styleUrl: './textarea-validation.scss',
})
export class TextareaValidation {
  private readonly transloco = inject(TranslocoService);

  private readonly model = signal(TEXTAREA_VALIDATION_FORM_DEFAULT_STATE);

  private readonly requiredMessage = toSignal(
    this.transloco.selectTranslate('errors.required', {}, { scope: 'textarea' }),
    { initialValue: '' },
  );

  protected readonly validationForm = form(
    this.model,
    createTextareaValidationSchema(() => this.requiredMessage()),
  );
}

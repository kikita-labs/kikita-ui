import { Component, inject, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';

import { toSignal } from '@angular/core/rxjs-interop';

import { KuiFieldComponent, KuiInputDirective } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { INPUT_VALIDATION_FORM_DEFAULT_STATE } from './constants';
import { createInputValidationSchema } from './helpers';

/** Shows a required Input moving from untouched to invalid and then corrected. */
@Component({
  selector: 'app-input-validation',
  imports: [FormField, KuiFieldComponent, KuiInputDirective, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './input-validation.html',
  styleUrl: './input-validation.scss',
})
export class InputValidation {
  private readonly transloco = inject(TranslocoService);

  private readonly model = signal(INPUT_VALIDATION_FORM_DEFAULT_STATE);

  private readonly requiredMessage = toSignal(
    this.transloco.selectTranslate('errors.required', {}, { scope: 'input' }),
    { initialValue: '' },
  );

  protected readonly validationForm = form(
    this.model,
    createInputValidationSchema(() => this.requiredMessage()),
  );
}

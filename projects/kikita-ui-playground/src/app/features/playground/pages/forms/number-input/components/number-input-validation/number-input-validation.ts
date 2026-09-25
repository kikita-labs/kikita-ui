import { Component, inject, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';

import { toSignal } from '@angular/core/rxjs-interop';

import { KuiFieldComponent, KuiNumberInputDirective } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { NUMBER_INPUT_VALIDATION_DEFAULT_STATE } from './constants';
import { createNumberInputValidationSchema } from './helpers';

/** Shows the numeric Field moving from untouched through invalid and back to valid. */
@Component({
  selector: 'app-number-input-validation',
  imports: [
    FormField,
    KuiFieldComponent,
    KuiNumberInputDirective,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  templateUrl: './number-input-validation.html',
  styleUrl: './number-input-validation.scss',
})
export class NumberInputValidation {
  private readonly transloco = inject(TranslocoService);

  private readonly model = signal(NUMBER_INPUT_VALIDATION_DEFAULT_STATE);

  private readonly requiredMessage = toSignal(
    this.transloco.selectTranslate('errors.required', {}, { scope: 'number-input' }),
    { initialValue: '' },
  );

  private readonly minimumMessage = toSignal(
    this.transloco.selectTranslate('errors.minimum', {}, { scope: 'number-input' }),
    { initialValue: '' },
  );

  private readonly maximumMessage = toSignal(
    this.transloco.selectTranslate('errors.maximum', {}, { scope: 'number-input' }),
    { initialValue: '' },
  );

  protected readonly validationForm = form(
    this.model,
    createNumberInputValidationSchema(
      () => this.requiredMessage(),
      () => this.minimumMessage(),
      () => this.maximumMessage(),
    ),
  );
}

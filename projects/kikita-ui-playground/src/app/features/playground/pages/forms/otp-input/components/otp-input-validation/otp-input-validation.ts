import { Component, inject, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';

import { toSignal } from '@angular/core/rxjs-interop';

import { KuiFieldComponent, KuiOtpInputComponent } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { OtpInputReadout } from '../otp-input-readout';
import { OTP_INPUT_VALIDATION_FORM_DEFAULT_STATE } from './constants';
import { createOtpInputValidationSchema } from './helpers';

/** Shows a required, fixed-length OTP Input bound with Signal Forms inside Field. */
@Component({
  selector: 'app-otp-input-validation',
  imports: [
    FormField,
    KuiFieldComponent,
    KuiOtpInputComponent,
    OtpInputReadout,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  templateUrl: './otp-input-validation.html',
  styleUrl: './otp-input-validation.scss',
})
export class OtpInputValidation {
  private readonly transloco = inject(TranslocoService);

  private readonly model = signal(OTP_INPUT_VALIDATION_FORM_DEFAULT_STATE);

  private readonly requiredMessage = toSignal(
    this.transloco.selectTranslate('errors.required', {}, { scope: 'otp-input' }),
    { initialValue: '' },
  );

  private readonly lengthMessage = toSignal(
    this.transloco.selectTranslate('errors.length', {}, { scope: 'otp-input' }),
    { initialValue: '' },
  );

  protected readonly validationForm = form(
    this.model,
    createOtpInputValidationSchema(
      () => this.requiredMessage(),
      () => this.lengthMessage(),
    ),
  );
}

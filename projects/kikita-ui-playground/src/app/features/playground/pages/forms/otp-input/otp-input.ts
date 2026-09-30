import { Component } from '@angular/core';

import { KuiTextDirective } from '@kikita-labs/ui';

import { TranslocoPipe } from '@jsverse/transloco';

import {
  OtpInputAutofocus,
  OtpInputCompletion,
  OtpInputDefault,
  OtpInputEntry,
  OtpInputField,
  OtpInputFormats,
  OtpInputLengths,
  OtpInputSizes,
  OtpInputStates,
  OtpInputValidation,
  OtpInputVerification,
} from './components';

/** Shows OTP Input lengths, sizes, formats, states, Field wiring, entry scenarios, and Signal Forms. */
@Component({
  selector: 'app-otp-input',
  imports: [
    KuiTextDirective,
    OtpInputAutofocus,
    OtpInputCompletion,
    OtpInputDefault,
    OtpInputEntry,
    OtpInputField,
    OtpInputFormats,
    OtpInputLengths,
    OtpInputSizes,
    OtpInputStates,
    OtpInputValidation,
    OtpInputVerification,
    TranslocoPipe,
  ],
  templateUrl: './otp-input.html',
  styleUrl: './otp-input.scss',
})
export class OtpInput {}

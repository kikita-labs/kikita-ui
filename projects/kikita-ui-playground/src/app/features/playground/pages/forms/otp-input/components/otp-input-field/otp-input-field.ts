import { Component } from '@angular/core';

import { KuiField, KuiOtpInput } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Shows OTP Input inside Field with a hint, and with a hint plus an error. */
@Component({
  selector: 'app-otp-input-field',
  imports: [KuiField, KuiOtpInput, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './otp-input-field.html',
  styleUrl: './otp-input-field.scss',
})
export class OtpInputField {}

import { Component } from '@angular/core';

import { KuiOtpInput, KuiText } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Shows OTP Input with 4, 6 (default), and 8 cells. */
@Component({
  selector: 'app-otp-input-lengths',
  imports: [KuiOtpInput, KuiText, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './otp-input-lengths.html',
  styleUrl: './otp-input-lengths.scss',
})
export class OtpInputLengths {
  protected readonly lengths = [
    { value: 4, label: 'otpInput.lengths.four' },
    { value: 6, label: 'otpInput.lengths.six' },
    { value: 8, label: 'otpInput.lengths.eight' },
  ] as const;
}

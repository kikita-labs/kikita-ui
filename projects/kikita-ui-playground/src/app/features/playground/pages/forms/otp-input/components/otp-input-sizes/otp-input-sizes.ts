import { Component } from '@angular/core';

import { KuiOtpInput, KuiText } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Shows every supported OTP Input size with a seeded four-digit code. */
@Component({
  selector: 'app-otp-input-sizes',
  imports: [KuiOtpInput, KuiText, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './otp-input-sizes.html',
  styleUrl: './otp-input-sizes.scss',
})
export class OtpInputSizes {
  protected readonly sizes = [
    { value: 'xs', label: 'otpInput.sizes.extraSmall' },
    { value: 'sm', label: 'otpInput.sizes.small' },
    { value: 'md', label: 'otpInput.sizes.medium' },
    { value: 'lg', label: 'otpInput.sizes.large' },
  ] as const;
}

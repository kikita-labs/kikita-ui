import { Component, computed, input } from '@angular/core';

import { KuiText } from '@kikita-labs/ui';

import { TranslocoPipe } from '@jsverse/transloco';

/** Shows a code or counter next to an OTP Input so entry outcomes are visible. */
@Component({
  selector: 'app-otp-input-readout',
  imports: [KuiText, TranslocoPipe],
  templateUrl: './otp-input-readout.html',
  styleUrl: './otp-input-readout.scss',
})
export class OtpInputReadout {
  /** Translation key for the readout label. */
  readonly labelKey = input('otpInput.readout.value');

  /** Current value to show; an empty string renders the translated empty marker. */
  readonly value = input.required<string>();

  protected readonly hasValue = computed(() => this.value() !== '');
}

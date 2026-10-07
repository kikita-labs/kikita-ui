import { Component, signal } from '@angular/core';

import { KuiButton, KuiOtpInput } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Mounts an OTP Input with autoFocus on demand so page load never moves focus. */
@Component({
  selector: 'app-otp-input-autofocus',
  imports: [KuiButton, KuiOtpInput, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './otp-input-autofocus.html',
  styleUrl: './otp-input-autofocus.scss',
})
export class OtpInputAutofocus {
  protected readonly mounted = signal(false);
}

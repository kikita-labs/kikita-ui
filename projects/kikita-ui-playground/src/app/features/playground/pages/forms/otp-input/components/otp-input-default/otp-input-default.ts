import { Component, signal } from '@angular/core';

import { KuiFieldComponent, KuiOtpInputComponent } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

import { OtpInputReadout } from '../otp-input-readout';

/** Shows the minimally configured OTP Input inside its Field wrapper. */
@Component({
  selector: 'app-otp-input-default',
  imports: [
    KuiFieldComponent,
    KuiOtpInputComponent,
    OtpInputReadout,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  templateUrl: './otp-input-default.html',
  styleUrl: './otp-input-default.scss',
})
export class OtpInputDefault {
  protected readonly code = signal('');
}

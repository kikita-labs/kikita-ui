import { Component, signal } from '@angular/core';

import { KuiOtpInputComponent } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

import { OtpInputReadout } from '../otp-input-readout';

/** Shows an empty OTP Input for real keyboard and paste entry with a live value readout. */
@Component({
  selector: 'app-otp-input-entry',
  imports: [KuiOtpInputComponent, OtpInputReadout, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './otp-input-entry.html',
  styleUrl: './otp-input-entry.scss',
})
export class OtpInputEntry {
  protected readonly code = signal('');
}

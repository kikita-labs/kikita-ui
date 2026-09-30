import { Component } from '@angular/core';

import { KuiOtpInputComponent, KuiTextDirective } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Shows invalid, disabled, read-only, and loading OTP Input states with a seeded code. */
@Component({
  selector: 'app-otp-input-states',
  imports: [KuiOtpInputComponent, KuiTextDirective, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './otp-input-states.html',
  styleUrl: './otp-input-states.scss',
})
export class OtpInputStates {}

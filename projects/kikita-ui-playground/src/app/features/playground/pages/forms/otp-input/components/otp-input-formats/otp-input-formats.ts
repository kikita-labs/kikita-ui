import { Component } from '@angular/core';

import { KuiOtpInputComponent, KuiTextDirective } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Shows a masked PIN and an alphanumeric, uppercased backup code. */
@Component({
  selector: 'app-otp-input-formats',
  imports: [KuiOtpInputComponent, KuiTextDirective, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './otp-input-formats.html',
  styleUrl: './otp-input-formats.scss',
})
export class OtpInputFormats {}

import { Component } from '@angular/core';

import { KuiOtpInput, KuiText } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Shows a masked PIN and an alphanumeric, uppercased backup code. */
@Component({
  selector: 'app-otp-input-formats',
  imports: [KuiOtpInput, KuiText, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './otp-input-formats.html',
  styleUrl: './otp-input-formats.scss',
})
export class OtpInputFormats {}

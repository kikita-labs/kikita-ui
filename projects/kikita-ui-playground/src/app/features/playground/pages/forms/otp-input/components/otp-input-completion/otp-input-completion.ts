import { Component, signal } from '@angular/core';

import { KuiButtonDirective, KuiOtpInputComponent } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

import { OtpInputReadout } from '../otp-input-readout';

/** Shows how many times the complete output fired and the last completed code. */
@Component({
  selector: 'app-otp-input-completion',
  imports: [
    KuiButtonDirective,
    KuiOtpInputComponent,
    OtpInputReadout,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  templateUrl: './otp-input-completion.html',
  styleUrl: './otp-input-completion.scss',
})
export class OtpInputCompletion {
  protected readonly code = signal('');

  protected readonly completions = signal(0);

  protected readonly lastCompleted = signal('');

  protected onComplete(code: string): void {
    this.completions.update((count) => count + 1);
    this.lastCompleted.set(code);
  }

  protected clear(): void {
    this.code.set('');
  }
}

import { Component, computed, DestroyRef, inject, signal } from '@angular/core';

import { KuiButtonDirective, KuiOtpInputComponent, KuiTextDirective } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

import { VERIFICATION_ACCEPTED_CODE, VERIFICATION_DELAY_MS } from './constants';
import type { VerificationStatus } from './types';

/** Shows the loading state around a consumer-owned, timer-driven code check. */
@Component({
  selector: 'app-otp-input-verification',
  imports: [
    KuiButtonDirective,
    KuiOtpInputComponent,
    KuiTextDirective,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  templateUrl: './otp-input-verification.html',
  styleUrl: './otp-input-verification.scss',
})
export class OtpInputVerification {
  private readonly destroyRef = inject(DestroyRef);

  protected readonly code = signal('');

  protected readonly status = signal<VerificationStatus>('idle');

  private timer: ReturnType<typeof setTimeout> | undefined;

  protected readonly verifying = computed(() => this.status() === 'verifying');

  constructor() {
    this.destroyRef.onDestroy(() => clearTimeout(this.timer));
  }

  protected onComplete(code: string): void {
    this.status.set('verifying');
    this.timer = setTimeout(() => {
      this.status.set(code === VERIFICATION_ACCEPTED_CODE ? 'verified' : 'rejected');
    }, VERIFICATION_DELAY_MS);
  }

  protected reset(): void {
    clearTimeout(this.timer);
    this.code.set('');
    this.status.set('idle');
  }
}

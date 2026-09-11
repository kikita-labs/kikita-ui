import { Component, computed, signal, ViewEncapsulation } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';

import {
  KuiButtonDirective,
  KuiCellDirective,
  KuiFieldComponent,
  KuiOtpInputComponent,
  KuiTableDirective,
  KuiThDirective,
  KuiThGroupDirective,
} from '@kikita-labs/ui';

import type { KuiSize } from '@kikita-labs/ui';

import { PlaygroundPanelComponent } from '../../shared/panel/panel.component';

@Component({
  selector: 'app-otp-input-page',
  imports: [
    FormField,
    KuiButtonDirective,
    KuiCellDirective,
    KuiFieldComponent,
    KuiOtpInputComponent,
    KuiTableDirective,
    KuiThDirective,
    KuiThGroupDirective,
    PlaygroundPanelComponent,
  ],
  templateUrl: './otp-input.page.html',
  styleUrl: './otp-input.page.scss',
  encapsulation: ViewEncapsulation.None,
})
export class OtpInputPage {
  protected readonly defaultCode = signal('');
  protected readonly defaultComplete = computed(() => this.defaultCode().length === 6);

  protected readonly maskedCode = signal('');
  protected readonly backupCode = signal('');
  protected readonly fieldCode = signal('');

  protected readonly verifyCode = signal('');
  protected readonly verifying = signal(false);
  protected readonly verifyResult = signal<'idle' | 'success' | 'error'>('idle');

  protected readonly model = signal({ code: '' });
  protected readonly signInForm = form(this.model);

  protected readonly sizeRows: readonly { value: KuiSize; label: string }[] = [
    { value: 'xs', label: 'xs' },
    { value: 'sm', label: 'sm' },
    { value: 'md', label: 'md (default)' },
    { value: 'lg', label: 'lg' },
  ];

  protected onVerifyComplete(code: string): void {
    this.verifying.set(true);
    this.verifyResult.set('idle');

    setTimeout(() => {
      this.verifying.set(false);
      const lastDigit = Number(code[code.length - 1]);
      this.verifyResult.set(Number.isNaN(lastDigit) || lastDigit % 2 === 0 ? 'success' : 'error');
    }, 1100);
  }

  protected resetVerify(): void {
    this.verifyCode.set('');
    this.verifying.set(false);
    this.verifyResult.set('idle');
  }
}

import { Component, computed, inject, ViewEncapsulation } from '@angular/core';

import { KuiButtonDirective } from '../button/kui-button.directive';
import { KUI_DIALOG_CONTEXT } from './kui-dialog-context.token';
import type { KuiDialogContext, KuiDialogHost } from './kui-dialog-context.token';
import type { KuiConfirmConfig } from './kui-confirm.types';

/**
 * @internal
 * Pre-built confirmation dialog rendered by {@link kuiConfirm}.
 * Not part of the public API — do not use directly.
 */
@Component({
  selector: 'kui-confirm',
  template: `
    <div class="kui-dialog-header">
      @if (ctx.appearance !== 'default') {
        <svg class="kui-dialog-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path
            d="M10 3L2.5 16.5h15L10 3z"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linejoin="round"
          />
          <line
            x1="10"
            y1="9"
            x2="10"
            y2="12.5"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linecap="round"
          />
          <circle cx="10" cy="14.5" r="0.75" fill="currentColor" />
        </svg>
      }
      <h2 class="kui-dialog-title">{{ ctx.data.title }}</h2>
    </div>
    @if (ctx.data.message) {
      <div class="kui-dialog-body">{{ ctx.data.message }}</div>
    }
    <div class="kui-dialog-footer">
      <button kuiButton shape="outline" type="button" (click)="ctx.close(false)">
        {{ ctx.data.cancelLabel ?? 'Cancel' }}
      </button>
      <button kuiButton [appearance]="confirmAppearance()" type="button" (click)="ctx.close(true)">
        {{ ctx.data.confirmLabel ?? 'OK' }}
      </button>
    </div>
  `,
  imports: [KuiButtonDirective],
  encapsulation: ViewEncapsulation.None,
})
export class KuiConfirmComponent implements KuiDialogHost<boolean, KuiConfirmConfig> {
  public readonly dialogContext =
    inject<KuiDialogContext<boolean, KuiConfirmConfig>>(KUI_DIALOG_CONTEXT);
  protected readonly ctx = this.dialogContext;

  protected readonly confirmAppearance = computed(() =>
    this.ctx.appearance === 'danger' ? 'danger' : null,
  );
}

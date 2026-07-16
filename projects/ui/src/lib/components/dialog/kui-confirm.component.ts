import { Component, computed, inject, ViewEncapsulation } from '@angular/core';

import { KUI_TRIANGLE_ALERT_D } from '../../utils/kui-chrome-icon-paths.util';
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
        <svg class="kui-dialog-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="${KUI_TRIANGLE_ALERT_D[0]}"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="${KUI_TRIANGLE_ALERT_D[1]}"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="${KUI_TRIANGLE_ALERT_D[2]}"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
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

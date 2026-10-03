import { Component, computed, inject, ViewEncapsulation } from '@angular/core';

import { injectKuiMessages } from '../../i18n/inject-kui-messages';
import { KuiButtonDirective } from '../button/kui-button.directive';
import { injectKuiGlyph } from '../icon/inject-kui-glyph';
import { KUI_GLYPH_TRIANGLE_ALERT } from '../icon/kui-chrome-glyphs';
import { KuiGlyphComponent } from '../icon/kui-glyph.component';
import type { KuiConfirmConfig } from './kui-confirm.types';
import type { KuiDialogContext, KuiDialogHost } from './kui-dialog-context.token';
import { KUI_DIALOG_CONTEXT } from './kui-dialog-context.token';

/**
 * @internal
 * Pre-built confirmation dialog rendered by {@link kuiConfirm}.
 * Not part of the public API; do not use directly.
 */
@Component({
  selector: 'kui-confirm',
  template: `
    <div class="kui-dialog-header">
      @if (ctx.appearance !== 'default') {
        <svg class="kui-dialog-icon" [kuiGlyph]="warningGlyph()" [kuiGlyphStroke]="1.6"></svg>
      }
      <h2 class="kui-dialog-title">{{ ctx.data.title }}</h2>
    </div>
    @if (ctx.data.message) {
      <div class="kui-dialog-body">{{ ctx.data.message }}</div>
    }
    <div class="kui-dialog-footer">
      <button kuiButton shape="outline" type="button" (click)="ctx.close(false)">
        {{ ctx.data.cancelLabel ?? t().cancel }}
      </button>
      <button kuiButton [appearance]="confirmAppearance()" type="button" (click)="ctx.close(true)">
        {{ ctx.data.confirmLabel ?? t().confirm }}
      </button>
    </div>
  `,
  imports: [KuiButtonDirective, KuiGlyphComponent],
  encapsulation: ViewEncapsulation.None,
})
/** Renders the default confirmation dialog content for `confirm()`. */
export class KuiConfirmComponent implements KuiDialogHost<boolean, KuiConfirmConfig> {
  protected readonly t = injectKuiMessages('dialog');

  protected readonly warningGlyph = injectKuiGlyph({
    role: 'statusWarning',
    fallback: KUI_GLYPH_TRIANGLE_ALERT,
  });

  public readonly dialogContext =
    inject<KuiDialogContext<boolean, KuiConfirmConfig>>(KUI_DIALOG_CONTEXT);
  protected readonly ctx = this.dialogContext;

  protected readonly confirmAppearance = computed(() =>
    this.ctx.appearance === 'danger' ? 'danger' : null,
  );
}

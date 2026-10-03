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
  templateUrl: './kui-confirm.component.html',
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

import { Component, inject, ViewEncapsulation } from '@angular/core';

import { KUI_DIALOG_CONTEXT, KuiButtonDirective } from '@kikita-labs/ui';

import type { KuiDialogContext, KuiDialogHost } from '@kikita-labs/ui';

import type { DialogExampleData, DialogExampleResult } from '../../types';

/** Renders page-owned Dialog content without a title to exercise the container name fallback. */
@Component({
  selector: 'app-dialog-unnamed-content',
  imports: [KuiButtonDirective],
  templateUrl: './dialog-unnamed-content.html',
  encapsulation: ViewEncapsulation.None,
})
export class DialogUnnamedContent implements KuiDialogHost<DialogExampleResult, DialogExampleData> {
  public readonly dialogContext =
    inject<KuiDialogContext<DialogExampleResult, DialogExampleData>>(KUI_DIALOG_CONTEXT);

  protected readonly ctx = this.dialogContext;
}

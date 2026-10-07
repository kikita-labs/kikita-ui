import { Component, inject, ViewEncapsulation } from '@angular/core';

import { KUI_DIALOG_CONTEXT, KuiButton } from '@kikita-labs/ui';

import type { KuiDialogContext, KuiDialogHost } from '@kikita-labs/ui';

import type { DialogExampleData, DialogExampleResult } from '../../types';

/** Renders the page-owned content used to exercise the public Dialog contract. */
@Component({
  selector: 'app-dialog-example-content',
  imports: [KuiButton],
  templateUrl: './dialog-example-content.html',
  encapsulation: ViewEncapsulation.None,
})
export class DialogExampleContent implements KuiDialogHost<DialogExampleResult, DialogExampleData> {
  public readonly dialogContext =
    inject<KuiDialogContext<DialogExampleResult, DialogExampleData>>(KUI_DIALOG_CONTEXT);

  protected readonly ctx = this.dialogContext;
}

import { Component, inject, ViewEncapsulation } from '@angular/core';

import { KUI_DIALOG_CONTEXT, KuiAutoFocus, KuiButton, KuiInput } from '@kikita-labs/ui';

import { TranslocoPipe } from '@jsverse/transloco';
import type { KuiDialogContext, KuiDialogHost } from '@kikita-labs/ui';

/** Dialog content whose second field asks for focus, so it must win over the first tabbable field. */
@Component({
  selector: 'app-input-auto-focus-dialog',
  imports: [KuiAutoFocus, KuiButton, KuiInput, TranslocoPipe],
  templateUrl: './input-auto-focus-dialog.html',
  encapsulation: ViewEncapsulation.None,
})
export class InputAutoFocusDialog implements KuiDialogHost<void, void> {
  public readonly dialogContext = inject<KuiDialogContext<void, void>>(KUI_DIALOG_CONTEXT);
}

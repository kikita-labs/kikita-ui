import { Component } from '@angular/core';

import { KuiFieldComponent, KuiTextareaDirective } from '@kikita-labs/ui';

@Component({
  selector: 'app-textarea-page',
  imports: [KuiFieldComponent, KuiTextareaDirective],
  templateUrl: './textarea.page.html',
})
export class TextareaPage {}

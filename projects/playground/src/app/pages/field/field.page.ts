import { Component } from '@angular/core';

import { KuiFieldComponent, KuiInputDirective, KuiTextareaDirective } from '@kikita-labs/ui';

@Component({
  selector: 'app-field-page',
  imports: [KuiFieldComponent, KuiInputDirective, KuiTextareaDirective],
  templateUrl: './field.page.html',
})
export class FieldPage {
  protected readonly sizeRows = [
    { value: 'xs' as const, label: 'xs' },
    { value: 'sm' as const, label: 'sm' },
    { value: 'md' as const, label: 'md (default)' },
    { value: 'lg' as const, label: 'lg' },
  ];
}

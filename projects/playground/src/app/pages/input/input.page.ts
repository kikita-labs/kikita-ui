import { Component } from '@angular/core';

import { KuiFieldComponent, KuiInputDirective } from '@kikita-labs/ui';

@Component({
  selector: 'app-input-page',
  imports: [KuiFieldComponent, KuiInputDirective],
  templateUrl: './input.page.html',
})
export class InputPage {
  protected readonly inputStateCols = [
    { value: 'default' as const, label: 'Default' },
    { value: 'hover' as const, label: 'Hover' },
    { value: 'focus' as const, label: 'Focus' },
    { value: 'invalid' as const, label: 'Invalid' },
    { value: 'disabled' as const, label: 'Disabled' },
  ];

  protected readonly sizeRows = [
    { value: 'xs' as const, label: 'xs' },
    { value: 'sm' as const, label: 'sm' },
    { value: 'md' as const, label: 'md (default)' },
    { value: 'lg' as const, label: 'lg' },
  ];
}

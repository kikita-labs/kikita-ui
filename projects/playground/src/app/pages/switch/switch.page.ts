import { Component } from '@angular/core';

import { KuiFieldComponent, KuiSwitchDirective } from '@kikita-labs/ui';

@Component({
  selector: 'app-switch-page',
  imports: [KuiFieldComponent, KuiSwitchDirective],
  templateUrl: './switch.page.html',
})
export class SwitchPage {
  protected readonly switchStateRows = [
    { checked: false, label: 'Off' },
    { checked: true, label: 'On' },
  ];

  protected readonly selectionStateCols = [
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

  protected readonly switchSizeColDefs = [
    { label: 'Off', checked: false, state: '', disabled: false },
    { label: 'On', checked: true, state: '', disabled: false },
    { label: 'Focus', checked: false, state: 'focus', disabled: false },
    { label: 'Disabled', checked: false, state: '', disabled: true },
  ];
}

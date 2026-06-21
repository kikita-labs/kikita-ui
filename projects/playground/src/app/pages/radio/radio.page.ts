import { Component } from '@angular/core';

import { KuiFieldComponent, KuiRadioDirective } from '@kikita-labs/ui';

@Component({
  selector: 'app-radio-page',
  imports: [KuiFieldComponent, KuiRadioDirective],
  templateUrl: './radio.page.html',
})
export class RadioPage {
  protected readonly checkStateRows = [
    { checked: false, label: 'Unchecked' },
    { checked: true, label: 'Checked' },
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

  protected readonly sizeColDefs = [
    { label: 'Unchecked', checked: false, state: '', disabled: false },
    { label: 'Checked', checked: true, state: '', disabled: false },
    { label: 'Focus', checked: false, state: 'focus', disabled: false },
    { label: 'Disabled', checked: false, state: '', disabled: true },
  ];
}

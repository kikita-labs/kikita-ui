import { Component, ViewEncapsulation } from '@angular/core';

import { KuiFieldComponent, KuiSelectDirective } from '@kikita-labs/ui';

import { PlaygroundPanelComponent } from '../../shared/panel/panel.component';

@Component({
  selector: 'app-select-page',
  imports: [KuiFieldComponent, KuiSelectDirective, PlaygroundPanelComponent],
  templateUrl: './select.page.html',
  styleUrl: './select.page.scss',
  encapsulation: ViewEncapsulation.None,
})
export class SelectPage {
  protected readonly stateCols = [
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

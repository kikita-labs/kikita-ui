import { Component, ViewEncapsulation } from '@angular/core';

import {
  KuiCellDirective,
  KuiFieldComponent,
  KuiInputDirective,
  KuiTableDirective,
  KuiThDirective,
  KuiThGroupDirective,
} from '@kikita-labs/ui';

import { PlaygroundPanelComponent } from '../../shared/panel/panel.component';

@Component({
  selector: 'app-input-page',
  imports: [
    KuiCellDirective,
    KuiFieldComponent,
    KuiInputDirective,
    KuiTableDirective,
    KuiThDirective,
    KuiThGroupDirective,
    PlaygroundPanelComponent,
  ],
  templateUrl: './input.page.html',
  styleUrl: './input.page.scss',
  encapsulation: ViewEncapsulation.None,
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

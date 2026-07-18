import { Component, ViewEncapsulation } from '@angular/core';

import {
  KuiButtonDirective,
  KuiCellDirective,
  KuiIconButtonDirective,
  KuiIconComponent,
  KuiTableDirective,
  KuiThDirective,
  KuiThGroupDirective,
} from '@kikita-labs/ui';

import type { KuiButtonAppearance, KuiButtonShape, KuiSize } from '@kikita-labs/ui';

import { PlaygroundPanelComponent } from '../../shared/panel/panel.component';

@Component({
  selector: 'app-button-page',
  imports: [
    KuiButtonDirective,
    KuiCellDirective,
    KuiIconButtonDirective,
    KuiIconComponent,
    KuiTableDirective,
    KuiThDirective,
    KuiThGroupDirective,
    PlaygroundPanelComponent,
  ],
  templateUrl: './button.page.html',
  styleUrl: './button.page.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ButtonPage {
  protected readonly shapes: readonly { value: KuiButtonShape; label: string }[] = [
    { value: 'solid', label: 'Solid' },
    { value: 'soft', label: 'Soft' },
    { value: 'outline', label: 'Outline' },
    { value: 'ghost', label: 'Ghost' },
  ];

  protected readonly appearances: readonly {
    value: KuiButtonAppearance;
    label: string;
  }[] = [
    { value: 'primary', label: 'Primary' },
    { value: 'danger', label: 'Danger' },
    { value: 'success', label: 'Success' },
    { value: 'warning', label: 'Warning' },
  ];

  protected readonly states = [
    { value: 'default' as const, label: 'Default' },
    { value: 'hover' as const, label: 'Hover' },
    { value: 'active' as const, label: 'Active' },
    { value: 'focus' as const, label: 'Focus' },
    { value: 'disabled' as const, label: 'Disabled' },
  ];

  protected readonly sizes: readonly { value: KuiSize; label: string }[] = [
    { value: 'xs', label: 'xs' },
    { value: 'sm', label: 'sm' },
    { value: 'md', label: 'md (default)' },
    { value: 'lg', label: 'lg' },
  ];
}

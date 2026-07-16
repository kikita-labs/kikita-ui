import { Component, ViewEncapsulation } from '@angular/core';

import {
  KuiCellDirective,
  KuiIconButtonDirective,
  KuiIconComponent,
  KuiTableDirective,
  KuiThDirective,
  KuiThGroupDirective,
} from '@kikita-labs/ui';

import { PlaygroundPanelComponent } from '../../shared/panel/panel.component';

@Component({
  selector: 'app-icons-page',
  imports: [
    KuiCellDirective,
    KuiIconButtonDirective,
    KuiIconComponent,
    KuiTableDirective,
    KuiThDirective,
    KuiThGroupDirective,
    PlaygroundPanelComponent,
  ],
  templateUrl: './icons.page.html',
  styleUrl: './icons.page.scss',
  encapsulation: ViewEncapsulation.None,
})
export class IconsPage {
  protected readonly scaleSizes = [12, 16, 24, 32, 48, 64];

  protected readonly buttonShapes = [
    { value: 'solid' as const, label: 'Solid' },
    { value: 'soft' as const, label: 'Soft' },
    { value: 'outline' as const, label: 'Outline' },
    { value: 'ghost' as const, label: 'Ghost' },
  ];

  protected readonly stateColumns = [
    { value: 'default' as const, label: 'Default' },
    { value: 'hover' as const, label: 'Hover' },
    { value: 'active' as const, label: 'Active' },
    { value: 'focus' as const, label: 'Focus' },
    { value: 'disabled' as const, label: 'Disabled' },
  ];

  protected readonly sizeRows = [
    { value: 'xs' as const, label: 'xs' },
    { value: 'sm' as const, label: 'sm' },
    { value: 'md' as const, label: 'md (default)' },
    { value: 'lg' as const, label: 'lg' },
  ];
}

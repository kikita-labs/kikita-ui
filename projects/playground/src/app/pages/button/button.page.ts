import { Component } from '@angular/core';

import {
  KuiButtonDirective,
  KuiGroupDirective,
  KuiIconButtonDirective,
  KuiIconComponent,
} from '@kikita-labs/ui';

@Component({
  selector: 'app-button-page',
  imports: [KuiButtonDirective, KuiGroupDirective, KuiIconButtonDirective, KuiIconComponent],
  templateUrl: './button.page.html',
})
export class ButtonPage {
  protected readonly buttonVariants = [
    { value: 'solid' as const, label: 'Solid' },
    { value: 'soft' as const, label: 'Soft' },
    { value: 'outline' as const, label: 'Outline' },
    { value: 'ghost' as const, label: 'Ghost' },
    { value: 'danger' as const, label: 'Danger' },
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

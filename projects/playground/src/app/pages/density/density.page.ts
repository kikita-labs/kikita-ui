import { Component, ViewEncapsulation } from '@angular/core';

import {
  KuiButtonDirective,
  KuiCheckboxDirective,
  KuiFieldComponent,
  KuiInputDirective,
  KuiSwitchDirective,
} from '@kikita-labs/ui';

import { PlaygroundPanelComponent } from '../../shared/panel/panel.component';

@Component({
  selector: 'app-density-page',
  imports: [
    KuiButtonDirective,
    KuiCheckboxDirective,
    KuiFieldComponent,
    KuiInputDirective,
    KuiSwitchDirective,
    PlaygroundPanelComponent,
  ],
  templateUrl: './density.page.html',
  styleUrl: './density.page.scss',
  encapsulation: ViewEncapsulation.None,
})
export class DensityPage {
  protected readonly densities = [
    { name: 'compact', label: 'Compact', hint: '8px padding for dense tooling.' },
    { name: 'regular', label: 'Regular', hint: '12px padding, the default.' },
    { name: 'comfortable', label: 'Comfortable', hint: '16px padding for touch-heavy UI.' },
  ] as const;
}

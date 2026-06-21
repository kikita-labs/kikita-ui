import { Component } from '@angular/core';

import {
  KuiButtonDirective,
  KuiCheckboxDirective,
  KuiFieldComponent,
  KuiInputDirective,
  KuiSwitchDirective,
} from '@kikita-labs/ui';

@Component({
  selector: 'app-density-page',
  imports: [
    KuiButtonDirective,
    KuiCheckboxDirective,
    KuiFieldComponent,
    KuiInputDirective,
    KuiSwitchDirective,
  ],
  templateUrl: './density.page.html',
})
export class DensityPage {
  protected readonly densities = [
    { name: 'compact', label: 'Compact', hint: '24px controls for dense tooling.' },
    { name: 'regular', label: 'Regular', hint: '32px default from the Ember spec.' },
    { name: 'comfortable', label: 'Comfortable', hint: '40px controls for touch-heavy UI.' },
  ] as const;
}

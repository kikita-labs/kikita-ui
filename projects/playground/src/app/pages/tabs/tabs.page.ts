import { Component, ViewEncapsulation } from '@angular/core';

import {
  KuiBadgeDirective,
  KuiTabDirective,
  KuiTabPanelDirective,
  KuiTabsComponent,
} from '@kikita-labs/ui';

import { PlaygroundPanelComponent } from '../../shared/panel/panel.component';

@Component({
  selector: 'app-tabs-page',
  imports: [KuiBadgeDirective, KuiTabDirective, KuiTabPanelDirective, KuiTabsComponent, PlaygroundPanelComponent],
  templateUrl: './tabs.page.html',
  styleUrl: './tabs.page.scss',
  encapsulation: ViewEncapsulation.None,
})
export class TabsPage {
  protected readonly manyTabs = [
    'tab1', 'tab2', 'tab3', 'tab4', 'tab5', 'tab6', 'tab7', 'tab8',
  ];

  protected readonly sizeRows = [
    { value: 'xs' as const, label: 'xs' },
    { value: 'sm' as const, label: 'sm' },
    { value: 'md' as const, label: 'md (default)' },
    { value: 'lg' as const, label: 'lg' },
  ];

  protected readonly tabVariants = [
    { label: 'Line', value: 'line' as const },
    { label: 'Pill', value: 'pill' as const },
  ];

  protected readonly tabStateCols = [
    { label: 'Default', value: 'default' },
    { label: 'Hover', value: 'hover' },
    { label: 'Focus', value: 'focus' },
    { label: 'Selected', value: 'selected' },
    { label: 'Disabled', value: 'disabled' },
  ];
}

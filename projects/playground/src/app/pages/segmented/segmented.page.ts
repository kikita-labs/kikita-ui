import { Component, ViewEncapsulation, signal } from '@angular/core';

import {
  KuiBadgeDirective,
  KuiIconComponent,
  KuiSegmentDirective,
  KuiSegmentedComponent,
} from '@kikita-labs/ui';

import { PlaygroundPanelComponent } from '../../shared/panel/panel.component';

@Component({
  selector: 'app-segmented-page',
  imports: [
    KuiBadgeDirective,
    KuiIconComponent,
    KuiSegmentDirective,
    KuiSegmentedComponent,
    PlaygroundPanelComponent,
  ],
  templateUrl: './segmented.page.html',
  styleUrl: './segmented.page.scss',
  encapsulation: ViewEncapsulation.None,
})
export class SegmentedPage {
  protected readonly view = signal('list');
  protected readonly period = signal('week');
  protected readonly align = signal('left');

  protected readonly sizeRows = [
    { value: 'xs' as const, label: 'xs' },
    { value: 'sm' as const, label: 'sm' },
    { value: 'md' as const, label: 'md (default)' },
    { value: 'lg' as const, label: 'lg' },
  ];
}

import { Component, ViewEncapsulation, signal } from '@angular/core';

import {
  KuiBadgeDirective,
  KuiCellDirective,
  KuiIconComponent,
  KuiSegmentDirective,
  KuiSegmentedComponent,
  KuiTableDirective,
  KuiThDirective,
  KuiThGroupDirective,
} from '@kikita-labs/ui';

import { PlaygroundPanelComponent } from '../../shared/panel/panel.component';

@Component({
  selector: 'app-segmented-page',
  imports: [
    KuiBadgeDirective,
    KuiCellDirective,
    KuiIconComponent,
    KuiSegmentDirective,
    KuiSegmentedComponent,
    KuiTableDirective,
    KuiThDirective,
    KuiThGroupDirective,
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

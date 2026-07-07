import { Component, ViewEncapsulation } from '@angular/core';

import {
  KuiBreadcrumbItemDirective,
  KuiBreadcrumbSeparatorComponent,
  KuiBreadcrumbsDirective,
} from '@kikita-labs/ui';

import { PlaygroundPanelComponent } from '../../shared/panel/panel.component';

@Component({
  selector: 'app-breadcrumbs-page',
  imports: [
    KuiBreadcrumbsDirective,
    KuiBreadcrumbItemDirective,
    KuiBreadcrumbSeparatorComponent,
    PlaygroundPanelComponent,
  ],
  templateUrl: './breadcrumbs.page.html',
  styleUrl: './breadcrumbs.page.scss',
  encapsulation: ViewEncapsulation.None,
})
export class BreadcrumbsPage {
  protected readonly sizeRows = [
    { value: 'sm' as const, label: 'sm · 11px' },
    { value: 'md' as const, label: 'md · 13px (default)' },
    { value: 'lg' as const, label: 'lg · 15px' },
  ];
}

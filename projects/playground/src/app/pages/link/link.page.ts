import { Component, ViewEncapsulation } from '@angular/core';

import { KuiLinkDirective } from '@kikita-labs/ui';

import { PlaygroundPanelComponent } from '../../shared/panel/panel.component';

@Component({
  selector: 'app-link-page',
  imports: [KuiLinkDirective, PlaygroundPanelComponent],
  templateUrl: './link.page.html',
  styleUrl: './link.page.scss',
  encapsulation: ViewEncapsulation.None,
})
export class LinkPage {
  protected readonly toneRows = [
    { value: 'default' as const, label: 'tone="default"' },
    { value: 'muted' as const, label: 'tone="muted"' },
    { value: 'primary' as const, label: 'tone="primary" (default tone)' },
    { value: 'success' as const, label: 'tone="success"' },
    { value: 'warning' as const, label: 'tone="warning"' },
    { value: 'danger' as const, label: 'tone="danger"' },
  ];

  protected readonly variantRows = [
    { value: 'body-lg' as const, label: 'variant="body-lg"' },
    { value: 'body' as const, label: 'variant="body" (default)' },
    { value: 'body-sm' as const, label: 'variant="body-sm"' },
    { value: 'caption' as const, label: 'variant="caption"' },
  ];
}

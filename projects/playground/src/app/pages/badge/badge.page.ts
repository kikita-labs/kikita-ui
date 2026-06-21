import { Component } from '@angular/core';

import { KuiBadgeDirective } from '@kikita-labs/ui';

@Component({
  selector: 'app-badge-page',
  imports: [KuiBadgeDirective],
  templateUrl: './badge.page.html',
})
export class BadgePage {
  protected readonly badgeAppearances = [
    { value: 'neutral' as const, label: 'Neutral' },
    { value: 'primary' as const, label: 'Primary' },
    { value: 'success' as const, label: 'Success' },
    { value: 'warning' as const, label: 'Warning' },
    { value: 'danger' as const, label: 'Danger' },
    { value: 'info' as const, label: 'Info' },
  ];

  protected readonly sizeRows = [
    { value: 'xs' as const, label: 'xs' },
    { value: 'sm' as const, label: 'sm' },
    { value: 'md' as const, label: 'md (default)' },
    { value: 'lg' as const, label: 'lg' },
  ];
}

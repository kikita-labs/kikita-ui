import { Component } from '@angular/core';

import { KuiBadgeDirective, KuiCardDirective } from '@kikita-labs/ui';

@Component({
  selector: 'app-card-page',
  imports: [KuiBadgeDirective, KuiCardDirective],
  templateUrl: './card.page.html',
})
export class CardPage {
  protected readonly sizeRows = [
    { value: 'xs' as const, label: 'xs' },
    { value: 'sm' as const, label: 'sm' },
    { value: 'md' as const, label: 'md (default)' },
    { value: 'lg' as const, label: 'lg' },
  ];

  protected readonly cardAppearances = ['surface', 'elevated', 'sunken'] as const;
}

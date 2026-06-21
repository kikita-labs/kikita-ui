import { Component, ViewEncapsulation } from '@angular/core';

import { KuiBadgeDirective, KuiCardDirective } from '@kikita-labs/ui';

import { PlaygroundPanelComponent } from '../../shared/panel/panel.component';

@Component({
  selector: 'app-card-page',
  imports: [KuiBadgeDirective, KuiCardDirective, PlaygroundPanelComponent],
  templateUrl: './card.page.html',
  styleUrl: './card.page.scss',
  encapsulation: ViewEncapsulation.None,
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

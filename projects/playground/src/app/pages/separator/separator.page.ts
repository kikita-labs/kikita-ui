import { Component, ViewEncapsulation } from '@angular/core';

import { KuiButtonDirective, KuiCardDirective, KuiSeparatorDirective } from '@kikita-labs/ui';

import { PlaygroundPanelComponent } from '../../shared/panel/panel.component';

@Component({
  selector: 'app-separator-page',
  imports: [KuiButtonDirective, KuiCardDirective, KuiSeparatorDirective, PlaygroundPanelComponent],
  templateUrl: './separator.page.html',
  styleUrl: './separator.page.scss',
  encapsulation: ViewEncapsulation.None,
})
export class SeparatorPage {
  protected readonly appearances = ['subtle', 'default', 'strong'] as const;
  protected readonly spacings = ['none', 'xs', 'sm', 'md', 'lg'] as const;
}

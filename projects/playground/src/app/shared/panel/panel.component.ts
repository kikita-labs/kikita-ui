import { Component, input, ViewEncapsulation } from '@angular/core';

import { KuiCardDirective } from '@kikita-labs/ui';

@Component({
  selector: 'app-panel',
  imports: [KuiCardDirective],
  templateUrl: './panel.component.html',
  styleUrl: './panel.component.scss',
  encapsulation: ViewEncapsulation.None,
  host: { '[attr.title]': 'null' },
})
export class PlaygroundPanelComponent {
  readonly num = input.required<string>();
  readonly title = input.required<string>();
  readonly description = input<string>('');
}

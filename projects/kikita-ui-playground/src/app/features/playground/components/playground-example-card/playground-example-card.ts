import { Component, input } from '@angular/core';

import { KuiCardDirective, KuiTextDirective } from '@kikita-labs/ui';

/** Presents a compact, titled group of live component examples. */
@Component({
  selector: 'app-playground-example-card',
  imports: [KuiCardDirective, KuiTextDirective],
  templateUrl: './playground-example-card.html',
  styleUrl: './playground-example-card.scss',
})
export class PlaygroundExampleCard {
  /** Short visible label for the group of examples. */
  readonly heading = input.required<string>();
}

import { Component, input } from '@angular/core';

import { KuiText } from '@kikita-labs/ui';

/** Names one live chart example with a short heading and a matching accessible group. */
@Component({
  selector: 'app-chart-example',
  imports: [KuiText],
  templateUrl: './chart-example.html',
  styleUrl: './chart-example.scss',
})
export class ChartExample {
  /** Short visible label that also names the example group. */
  readonly heading = input.required<string>();
}

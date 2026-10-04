import { Component, input } from '@angular/core';

import { KuiText } from '@kikita-labs/ui';

import type { SplitterExampleSize } from './types';

/** Names one splitter example and gives it a frame with a definite block size. */
@Component({
  selector: 'app-splitter-example',
  imports: [KuiText],
  templateUrl: './splitter-example.html',
  styleUrl: './splitter-example.scss',
})
export class SplitterExample {
  /** Visible heading that also names the example group. */
  readonly heading = input.required<string>();

  /** Block size of the frame around the projected splitter. */
  readonly size = input<SplitterExampleSize>('md');
}

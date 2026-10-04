import { DecimalPipe } from '@angular/common';
import { Component, signal } from '@angular/core';

import { KuiSplitter, KuiSplitterPane, KuiText } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

import { SplitterExample } from '../splitter-example';
import { SplitterPaneLabel } from '../splitter-pane-label';

/** Shows the sizes emitted by the splitter resize output. */
@Component({
  selector: 'app-splitter-output',
  imports: [
    DecimalPipe,
    KuiSplitter,
    KuiSplitterPane,
    KuiText,
    PlaygroundExampleCard,
    SplitterExample,
    SplitterPaneLabel,
    TranslocoPipe,
  ],
  templateUrl: './splitter-output.html',
  styleUrl: './splitter-output.scss',
})
export class SplitterOutput {
  protected readonly lastSizes = signal<readonly number[]>([]);

  protected readonly changes = signal(0);

  protected onResize(sizes: readonly number[]): void {
    this.lastSizes.set(sizes);
    this.changes.update((count) => count + 1);
  }
}

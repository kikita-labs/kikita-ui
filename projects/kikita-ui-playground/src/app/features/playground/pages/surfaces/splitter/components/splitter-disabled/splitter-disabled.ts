import { Component, signal } from '@angular/core';

import { KuiButton, KuiSplitter, KuiSplitterPane } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

import { SplitterExample } from '../splitter-example';
import { SplitterPaneLabel } from '../splitter-pane-label';

/** Shows a disabled splitter whose pane content stays interactive. */
@Component({
  selector: 'app-splitter-disabled',
  imports: [
    KuiButton,
    KuiSplitter,
    KuiSplitterPane,
    PlaygroundExampleCard,
    SplitterExample,
    SplitterPaneLabel,
    TranslocoPipe,
  ],
  templateUrl: './splitter-disabled.html',
  styleUrl: './splitter-disabled.scss',
})
export class SplitterDisabled {
  protected readonly presses = signal(0);

  protected press(): void {
    this.presses.update((count) => count + 1);
  }
}

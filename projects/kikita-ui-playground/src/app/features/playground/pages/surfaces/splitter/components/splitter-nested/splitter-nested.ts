import { Component } from '@angular/core';

import { KuiSplitter, KuiSplitterPane } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

import { SplitterExample } from '../splitter-example';
import { SplitterPaneLabel } from '../splitter-pane-label';

/** Shows a horizontal splitter nested in the top pane of a vertical splitter. */
@Component({
  selector: 'app-splitter-nested',
  imports: [
    KuiSplitter,
    KuiSplitterPane,
    PlaygroundExampleCard,
    SplitterExample,
    SplitterPaneLabel,
    TranslocoPipe,
  ],
  templateUrl: './splitter-nested.html',
  styleUrl: './splitter-nested.scss',
})
export class SplitterNested {}

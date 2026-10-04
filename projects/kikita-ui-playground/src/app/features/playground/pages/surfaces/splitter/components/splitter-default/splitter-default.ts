import { Component } from '@angular/core';

import { KuiSplitter, KuiSplitterPane } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

import { SplitterExample } from '../splitter-example';
import { SplitterPaneLabel } from '../splitter-pane-label';

/** Shows the minimal two-pane Splitter with every input at its default. */
@Component({
  selector: 'app-splitter-default',
  imports: [
    KuiSplitter,
    KuiSplitterPane,
    PlaygroundExampleCard,
    SplitterExample,
    SplitterPaneLabel,
    TranslocoPipe,
  ],
  templateUrl: './splitter-default.html',
  styleUrl: './splitter-default.scss',
})
export class SplitterDefault {}

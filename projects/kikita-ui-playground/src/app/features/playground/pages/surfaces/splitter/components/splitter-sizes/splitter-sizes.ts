import { Component } from '@angular/core';

import { KuiSplitter, KuiSplitterPane } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

import { SplitterExample } from '../splitter-example';
import { SplitterPaneLabel } from '../splitter-pane-label';

/** Shows explicit sizes, shared remaining space, and a raised minimum size. */
@Component({
  selector: 'app-splitter-sizes',
  imports: [
    KuiSplitter,
    KuiSplitterPane,
    PlaygroundExampleCard,
    SplitterExample,
    SplitterPaneLabel,
    TranslocoPipe,
  ],
  templateUrl: './splitter-sizes.html',
  styleUrl: './splitter-sizes.scss',
})
export class SplitterSizes {}

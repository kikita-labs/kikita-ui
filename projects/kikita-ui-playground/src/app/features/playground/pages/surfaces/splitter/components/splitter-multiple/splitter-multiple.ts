import { Component } from '@angular/core';

import { KuiSplitterComponent, KuiSplitterPaneComponent } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

import { SplitterExample } from '../splitter-example';
import { SplitterPaneLabel } from '../splitter-pane-label';

/** Shows three and four panes with one gutter between each adjacent pair. */
@Component({
  selector: 'app-splitter-multiple',
  imports: [
    KuiSplitterComponent,
    KuiSplitterPaneComponent,
    PlaygroundExampleCard,
    SplitterExample,
    SplitterPaneLabel,
    TranslocoPipe,
  ],
  templateUrl: './splitter-multiple.html',
  styleUrl: './splitter-multiple.scss',
})
export class SplitterMultiple {}

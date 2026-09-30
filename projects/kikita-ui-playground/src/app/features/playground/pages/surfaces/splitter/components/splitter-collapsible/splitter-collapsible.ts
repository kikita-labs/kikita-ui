import { DecimalPipe } from '@angular/common';
import { Component } from '@angular/core';

import { KuiSplitterComponent, KuiSplitterPaneComponent, KuiTextDirective } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

import { SplitterExample } from '../splitter-example';
import { SplitterPaneLabel } from '../splitter-pane-label';

/** Shows collapsible first, last, and vertical panes, and a middle pane that ignores the flag. */
@Component({
  selector: 'app-splitter-collapsible',
  imports: [
    DecimalPipe,
    KuiSplitterComponent,
    KuiSplitterPaneComponent,
    KuiTextDirective,
    PlaygroundExampleCard,
    SplitterExample,
    SplitterPaneLabel,
    TranslocoPipe,
  ],
  templateUrl: './splitter-collapsible.html',
  styleUrl: './splitter-collapsible.scss',
})
export class SplitterCollapsible {}

import { Component } from '@angular/core';

import { KuiTextDirective } from '@kikita-labs/ui';

import { TranslocoPipe } from '@jsverse/transloco';

import {
  SplitterCollapsible,
  SplitterDefault,
  SplitterDisabled,
  SplitterMultiple,
  SplitterNested,
  SplitterOrientation,
  SplitterOutput,
  SplitterSizes,
} from './components';

/** Shows Splitter's orientation, sizes, collapsible panes, nesting, disabled state, and output. */
@Component({
  selector: 'app-splitter',
  imports: [
    KuiTextDirective,
    SplitterCollapsible,
    SplitterDefault,
    SplitterDisabled,
    SplitterMultiple,
    SplitterNested,
    SplitterOrientation,
    SplitterOutput,
    SplitterSizes,
    TranslocoPipe,
  ],
  templateUrl: './splitter.html',
  styleUrl: './splitter.scss',
})
export class Splitter {}

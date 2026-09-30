import { Component } from '@angular/core';

/** Centers a short projected label inside a splitter pane. */
@Component({
  selector: 'app-splitter-pane-label',
  template: '<ng-content />',
  styleUrl: './splitter-pane-label.scss',
})
export class SplitterPaneLabel {}

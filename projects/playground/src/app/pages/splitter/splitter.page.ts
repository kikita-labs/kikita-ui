import { Component, signal, ViewEncapsulation } from '@angular/core';

import { KuiSplitterComponent, KuiSplitterPaneComponent } from '@kikita-labs/ui';

import { PlaygroundPanelComponent } from '../../shared/panel/panel.component';

@Component({
  selector: 'app-splitter-page',
  imports: [KuiSplitterComponent, KuiSplitterPaneComponent, PlaygroundPanelComponent],
  templateUrl: './splitter.page.html',
  styleUrl: './splitter.page.scss',
  encapsulation: ViewEncapsulation.None,
})
export class SplitterPage {
  protected readonly lastSizes = signal<readonly number[] | null>(null);

  protected onResize(sizes: readonly number[]): void {
    this.lastSizes.set(sizes);
  }
}

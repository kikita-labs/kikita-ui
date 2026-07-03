import { Component, ViewEncapsulation } from '@angular/core';

import { PlaygroundPanelComponent } from '../../shared/panel/panel.component';

@Component({
  selector: 'app-scrollbar-page',
  imports: [PlaygroundPanelComponent],
  templateUrl: './scrollbar.page.html',
  styleUrl: './scrollbar.page.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ScrollbarPage {
  protected readonly rows = Array.from({ length: 18 }, (_, index) => `Audit row ${index + 1}`);
  protected readonly columns = Array.from({ length: 8 }, (_, index) => `Column ${index + 1}`);
}

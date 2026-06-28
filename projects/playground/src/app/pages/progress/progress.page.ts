import { Component, ViewEncapsulation, signal } from '@angular/core';

import { KuiProgressComponent } from '@kikita-labs/ui';

import { PlaygroundPanelComponent } from '../../shared/panel/panel.component';

@Component({
  selector: 'app-progress-page',
  imports: [KuiProgressComponent, PlaygroundPanelComponent],
  templateUrl: './progress.page.html',
  styleUrl: './progress.page.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ProgressPage {
  protected readonly liveValue = signal<number>(65);

  protected onSlider(event: Event): void {
    this.liveValue.set(parseInt((event.target as HTMLInputElement).value));
  }
}

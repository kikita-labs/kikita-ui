import { Component, ViewEncapsulation, signal } from '@angular/core';

import { KuiProgressComponent, KuiSliderDirective } from '@kikita-labs/ui';

import { PlaygroundPanelComponent } from '../../shared/panel/panel.component';

@Component({
  selector: 'app-progress-page',
  imports: [KuiProgressComponent, KuiSliderDirective, PlaygroundPanelComponent],
  templateUrl: './progress.page.html',
  styleUrl: './progress.page.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ProgressPage {
  protected readonly liveValue = signal<number>(65);
}

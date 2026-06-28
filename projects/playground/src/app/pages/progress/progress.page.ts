import { Component, ViewEncapsulation, signal } from '@angular/core';

import { KuiProgressComponent } from '@kikita-labs/ui';

@Component({
  selector: 'app-progress-page',
  imports: [KuiProgressComponent],
  templateUrl: './progress.page.html',
  styleUrl: './progress.page.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ProgressPage {
  protected readonly liveValue = signal<number>(65);

  protected get fillWidth(): string {
    return `${this.liveValue()}%`;
  }

  protected get dashOffsetMd(): number {
    return 103.67 * (1 - this.liveValue() / 100);
  }

  protected onSlider(event: Event): void {
    this.liveValue.set(parseInt((event.target as HTMLInputElement).value));
  }
}

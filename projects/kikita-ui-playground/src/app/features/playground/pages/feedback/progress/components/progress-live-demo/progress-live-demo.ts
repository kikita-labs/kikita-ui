import { Component, signal } from '@angular/core';

import { KuiProgress, KuiSlider, KuiText } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Lets a native range input control a consumer-owned Progress value. */
@Component({
  selector: 'app-progress-live-demo',
  imports: [KuiProgress, KuiSlider, KuiText, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './progress-live-demo.html',
  styleUrl: './progress-live-demo.scss',
})
export class ProgressLiveDemo {
  protected readonly currentValue = signal(35);

  protected updateValue(event: Event): void {
    const range = event.target as HTMLInputElement | null;
    if (!range) return;

    this.currentValue.set(Number(range.value));
  }
}

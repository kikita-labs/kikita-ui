import { Component, signal } from '@angular/core';

import { KuiButton, KuiLoader } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Demonstrates consumer-owned insertion and removal of a Loader status host. */
@Component({
  selector: 'app-loader-consumer-status',
  imports: [KuiButton, KuiLoader, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './loader-consumer-status.html',
  styleUrl: './loader-consumer-status.scss',
})
export class LoaderConsumerStatus {
  protected readonly isChecking = signal(false);

  protected startCheck(): void {
    this.isChecking.set(true);
  }

  protected completeCheck(): void {
    this.isChecking.set(false);
  }
}

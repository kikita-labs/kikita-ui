import { Component, signal } from '@angular/core';

import { KuiButton, KuiSkeleton, KuiText } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Demonstrates consumer-owned placeholders and aria-busy lifecycle for a loading region. */
@Component({
  selector: 'app-skeleton-loading-region',
  imports: [KuiButton, KuiSkeleton, KuiText, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './skeleton-loading-region.html',
  styleUrl: './skeleton-loading-region.scss',
})
export class SkeletonLoadingRegion {
  protected readonly isLoading = signal(true);

  protected showLoading(): void {
    this.isLoading.set(true);
  }

  protected showContent(): void {
    this.isLoading.set(false);
  }
}

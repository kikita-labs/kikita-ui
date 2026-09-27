import { Component, signal } from '@angular/core';

import { KuiButtonDirective, KuiSkeletonDirective, KuiTextDirective } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Demonstrates consumer-owned placeholders and aria-busy lifecycle for a loading region. */
@Component({
  selector: 'app-skeleton-loading-region',
  imports: [
    KuiButtonDirective,
    KuiSkeletonDirective,
    KuiTextDirective,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
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

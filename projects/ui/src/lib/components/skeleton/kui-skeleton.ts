import { computed, Directive, inject, input } from '@angular/core';

import { KuiDefaults } from '../../providers/kui-defaults';
import type { KuiSkeletonAnimation } from './kui-skeleton-animation.type';
import type { KuiSkeletonShape } from './kui-skeleton-shape.type';

/** Applies Kikita UI skeleton placeholder styling to an existing host element. */
@Directive({
  selector: '[kuiSkeleton]',
  host: {
    class: 'kui-skeleton',
    'aria-hidden': 'true',
    '[attr.data-kui-shape]': 'effectiveShape()',
    '[attr.data-kui-animation]': 'effectiveAnimation()',
  },
})
export class KuiSkeleton {
  /** Placeholder shape mapped to Kikita UI skeleton geometry tokens. Defaults to `defaults.skeleton.shape`, then `rect`. */
  readonly shape = input<KuiSkeletonShape | undefined>();

  /** Placeholder animation mode. Defaults to `defaults.skeleton.animation`, then `shimmer`. */
  readonly animation = input<KuiSkeletonAnimation | undefined>();

  private readonly skeletonDefaults = inject(KuiDefaults).get('skeleton');

  protected readonly effectiveShape = computed<KuiSkeletonShape>(
    () => this.shape() ?? this.skeletonDefaults()?.shape ?? 'rect',
  );

  protected readonly effectiveAnimation = computed<KuiSkeletonAnimation>(
    () => this.animation() ?? this.skeletonDefaults()?.animation ?? 'shimmer',
  );
}

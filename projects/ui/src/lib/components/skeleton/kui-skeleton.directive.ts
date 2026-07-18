import { Directive, input } from '@angular/core';

import type { KuiSkeletonAnimation } from './kui-skeleton-animation.type';
import type { KuiSkeletonShape } from './kui-skeleton-shape.type';

/** Applies Kikita UI skeleton placeholder styling to an existing host element. */
@Directive({
  selector: '[kuiSkeleton]',
  host: {
    class: 'kui-skeleton',
    'aria-hidden': 'true',
    '[attr.data-kui-shape]': 'shape()',
    '[attr.data-kui-animation]': 'animation()',
  },
})
export class KuiSkeletonDirective {
  /** Placeholder shape mapped to Kikita UI skeleton geometry tokens. */
  readonly shape = input<KuiSkeletonShape>('rect');

  /** Placeholder animation mode. */
  readonly animation = input<KuiSkeletonAnimation>('shimmer');
}

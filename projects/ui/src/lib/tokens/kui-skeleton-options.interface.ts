import type { KuiSkeletonAnimation } from '../components/skeleton/kui-skeleton-animation.type';
import type { KuiSkeletonShape } from '../components/skeleton/kui-skeleton-shape.type';

/** Defaults for `[kuiSkeleton]`, set under the `skeleton` key of the component defaults. */
export interface KuiSkeletonOptions {
  /** Default shape. */
  readonly shape?: KuiSkeletonShape;

  /** Default animation. */
  readonly animation?: KuiSkeletonAnimation;
}

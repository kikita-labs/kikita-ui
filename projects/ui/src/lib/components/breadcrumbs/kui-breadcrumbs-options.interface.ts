import type { KuiBreadcrumbsSize } from './kui-breadcrumbs.directive';

/** Defaults for `ol[kuiBreadcrumbs]`, set under the `breadcrumbs` key of the component defaults. */
export interface KuiBreadcrumbsOptions {
  /** Component size. Takes precedence over the global `defaults.size`. */
  readonly size?: KuiBreadcrumbsSize;
}

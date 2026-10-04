import type { KuiIconGlyph } from '../icon/kui-icon-glyph.type';
import type { KuiBreadcrumbsSize } from './kui-breadcrumbs';

/** Defaults for `ol[kuiBreadcrumbs]`, set under the `breadcrumbs` key of the component defaults. */
export interface KuiBreadcrumbsOptions {
  /** Component size. Takes precedence over the global `defaults.size`. */
  readonly size?: KuiBreadcrumbsSize;
  /** Icon between crumbs. Takes precedence over `defaults.icons.separator`. */
  readonly separatorIcon?: KuiIconGlyph;
}

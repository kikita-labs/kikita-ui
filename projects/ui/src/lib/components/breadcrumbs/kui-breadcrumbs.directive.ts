import { computed, Directive, input } from '@angular/core';

import { injectKuiRootSizeDefault } from '../../utils/kui-defaults.util';

/** Size of the breadcrumb trail. */
export type KuiBreadcrumbsSize = 'sm' | 'md' | 'lg';

const KUI_BREADCRUMBS_SIZES = ['sm', 'md', 'lg'] as const;

/**
 * Marks an `<ol>` as a Kikita UI breadcrumb trail. Place inside a
 * `<nav aria-label="Breadcrumb">` and project `[kuiBreadcrumbItem]` links/spans
 * with separators between them.
 *
 * @example
 * ```html
 * <nav aria-label="Breadcrumb">
 *   <ol kuiBreadcrumbs>
 *     <li><a kuiBreadcrumbItem href="/components">Components</a></li>
 *     <li kuiBreadcrumbSeparator></li>
 *     <li><span kuiBreadcrumbItem current>Icon Button</span></li>
 *   </ol>
 * </nav>
 * ```
 */
@Directive({
  selector: 'ol[kuiBreadcrumbs]',
  host: {
    class: 'kui-breadcrumbs',
    role: 'list',
    '[attr.data-kui-size]': 'effectiveSize()',
  },
})
export class KuiBreadcrumbsDirective {
  /** Font size and icon/gap scale of the trail. Defaults to md. */
  readonly size = input<KuiBreadcrumbsSize | undefined>();

  private readonly rootDefaultSize =
    injectKuiRootSizeDefault<KuiBreadcrumbsSize>(KUI_BREADCRUMBS_SIZES);

  protected readonly effectiveSize = computed(() => this.size() ?? this.rootDefaultSize ?? 'md');
}

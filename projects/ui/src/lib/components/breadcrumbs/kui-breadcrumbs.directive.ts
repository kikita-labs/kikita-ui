import { Directive, input } from '@angular/core';

/** Size of the breadcrumb trail. */
export type KuiBreadcrumbsSize = 'sm' | 'md' | 'lg';

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
    '[attr.data-kui-size]': 'size()',
  },
})
export class KuiBreadcrumbsDirective {
  /** Font size and icon/gap scale of the trail. Defaults to md. */
  readonly size = input<KuiBreadcrumbsSize>('md');
}

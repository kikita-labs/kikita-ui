import { Directive, ElementRef, booleanAttribute, inject, input } from '@angular/core';

/**
 * A single crumb inside a `[kuiBreadcrumbs]` trail. Use on `<a>` for a
 * clickable crumb, or on `<span>` for a plain-text/grouping crumb or the
 * current (last) page with `current`.
 *
 * @example
 * ```html
 * <a kuiBreadcrumbItem href="/catalog">Catalog</a>
 * <span kuiBreadcrumbItem>Electronics</span>
 * <span kuiBreadcrumbItem current>Headphones</span>
 * ```
 */
@Directive({
  selector: 'a[kuiBreadcrumbItem], span[kuiBreadcrumbItem]',
  host: {
    '[class.kui-breadcrumb-link]': 'isLink()',
    '[class.kui-breadcrumb-current]': '!isLink() && current()',
    '[class.kui-breadcrumb-plain]': '!isLink() && !current()',
    '[attr.aria-current]': 'current() ? "page" : null',
  },
})
export class KuiBreadcrumbItemDirective {
  /** Marks this crumb as the current page. Only meaningful on `<span>`. */
  readonly current = input(false, { transform: booleanAttribute });

  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  protected isLink(): boolean {
    return this.elementRef.nativeElement.tagName === 'A';
  }
}

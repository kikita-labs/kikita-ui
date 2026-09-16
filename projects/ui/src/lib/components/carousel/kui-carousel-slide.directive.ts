import { Directive, ElementRef, inject } from '@angular/core';

/**
 * Marks one slide inside `kui-carousel`. Wraps arbitrary consumer content -- the host element
 * carries `role="group"` and `aria-roledescription="slide"` (W3C ARIA APG "grouped carousel"
 * pattern), while `kui-carousel` itself derives the slide count/label/`id` from the projected
 * `[kuiCarouselSlide]` elements it queries via `contentChildren`.
 *
 * @example
 * ```html
 * <kui-carousel ariaLabel="Product photos">
 *   <div kuiCarouselSlide>...</div>
 *   <div kuiCarouselSlide>...</div>
 * </kui-carousel>
 * ```
 */
@Directive({
  selector: '[kuiCarouselSlide]',
  host: {
    class: 'kui-carousel__slide',
    role: 'group',
    '[attr.aria-roledescription]': "'slide'",
    '[attr.id]': 'id',
    '[attr.aria-label]': 'ariaLabel',
  },
})
export class KuiCarouselSlideDirective {
  readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  /** @internal Set by the parent `kui-carousel`. */
  id: string | null = null;

  /** @internal Set by the parent `kui-carousel`, e.g. "2 of 5". */
  ariaLabel: string | null = null;
}

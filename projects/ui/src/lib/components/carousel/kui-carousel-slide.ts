import { Directive, ElementRef, inject, signal } from '@angular/core';

import { injectKuiMessages } from '../../i18n/inject-kui-messages';

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
    '[attr.aria-roledescription]': '_roleDescription() ?? messages().slideRoleDescription',
    '[attr.id]': '_id()',
    '[attr.aria-label]': '_ariaLabel()',
  },
})
export class KuiCarouselSlide {
  readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly messages = injectKuiMessages('carousel');

  /** @internal Set by the parent `kui-carousel`. */
  readonly _id = signal<string | null>(null);

  /** @internal Set by the parent `kui-carousel` so its `messages` input also reaches the slides. */
  readonly _roleDescription = signal<string | null>(null);

  /** @internal Set by the parent `kui-carousel`, e.g. "2 of 5". */
  readonly _ariaLabel = signal<string | null>(null);
}

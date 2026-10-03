import type { KuiIconGlyph } from '../icon/kui-icon-glyph.type';
/** Defaults for `kui-carousel`, set under the `carousel` key of the component defaults. */
export interface KuiCarouselOptions {
  /** Slides visible at once. */
  readonly itemsPerView?: number;

  /** Wraps around at the first and last slide. */
  readonly loop?: boolean;

  /** Advances slides automatically. */
  readonly autoplay?: boolean;

  /** Delay in ms between automatic slide changes. */
  readonly autoplayInterval?: number;

  /** Shows the previous and next arrows. */
  readonly showArrows?: boolean;

  /** Shows the pagination dots. */
  readonly showDots?: boolean;

  /** Allows dragging the track with a pointer. */
  readonly draggable?: boolean;
  /** Icon of the previous-slide arrow. Takes precedence over `defaults.icons.previous`. */
  readonly previousIcon?: KuiIconGlyph;

  /** Icon of the next-slide arrow. Takes precedence over `defaults.icons.next`. */
  readonly nextIcon?: KuiIconGlyph;
}

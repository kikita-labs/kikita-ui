import { isPlatformBrowser } from '@angular/common';
import type { ElementRef } from '@angular/core';
import {
  Component,
  computed,
  contentChildren,
  DestroyRef,
  effect,
  inject,
  input,
  model,
  PLATFORM_ID,
  signal,
  viewChild,
  viewChildren,
  ViewEncapsulation,
} from '@angular/core';

import { injectKuiMessages } from '../../i18n/inject-kui-messages';
import type { KuiCarouselMessages } from '../../i18n/kui-messages.interface';
import { KuiDefaults } from '../../providers/kui-defaults.service';
import { kuiNextId } from '../../utils/kui-id.util';
import {
  optionalBooleanAttribute,
  optionalPositiveIntegerAttribute,
} from '../../utils/kui-input-transform.util';
import { injectKuiGlyph } from '../icon/inject-kui-glyph';
import {
  KUI_GLYPH_CHEVRON_LEFT,
  KUI_GLYPH_CHEVRON_RIGHT,
  KUI_GLYPH_PAUSE,
  KUI_GLYPH_PLAY,
} from '../icon/kui-chrome-glyphs';
import { KuiGlyphComponent } from '../icon/kui-glyph.component';
import { KuiIconButtonDirective } from '../icon-button';
import { KuiCarouselSlideDirective } from './kui-carousel-slide.directive';

function autoplayIntervalAttribute(value: unknown): number | undefined {
  if (value === undefined || value === null) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 4000;
}

/**
 * Native scroll-snap carousel with projected slides, navigation, and optional autoplay.
 * The index model follows both programmatic and manual scrolling. Setting draggable
 * false disables touch/mouse dragging and wheel/trackpad scrolling of the track.
 * Autoplay defaults off; when enabled, it exposes Play/Pause and pauses on hover/focus.
 * The dot picker uses roving tabs. Hiding both arrows and dots leaves a swipe-only
 * surface that needs an accessible non-drag alternative. See docs/carousel.md.
 *
 * @example
 * ```html
 * <kui-carousel ariaLabel="Product photos" [(index)]="slide">
 *   <div kuiCarouselSlide>...</div>
 *   <div kuiCarouselSlide>...</div>
 *   <div kuiCarouselSlide>...</div>
 * </kui-carousel>
 * ```
 */
@Component({
  selector: 'kui-carousel',
  imports: [KuiIconButtonDirective, KuiGlyphComponent],
  template: `
    <div
      class="kui-carousel__region"
      role="region"
      [attr.aria-roledescription]="t().roleDescription"
      [attr.aria-label]="ariaLabel() ?? t().label"
      (keydown)="onRegionKeydown($event)"
      (mouseenter)="hoverPaused.set(true)"
      (mouseleave)="hoverPaused.set(false)"
      (focusin)="hoverPaused.set(true)"
      (focusout)="hoverPaused.set(false)"
    >
      <div
        #track
        class="kui-carousel__track"
        [attr.data-kui-locked]="effectiveDraggable() ? null : ''"
        [attr.tabindex]="effectiveDraggable() ? 0 : null"
        [style.--kui-carousel-items-per-view]="effectiveItemsPerView()"
        [style.cursor]="trackCursor()"
        [style.user-select]="dragging() ? 'none' : null"
        [attr.aria-live]="effectivePlaying() ? 'off' : 'polite'"
        (touchstart)="hoverPaused.set(true)"
        (touchend)="hoverPaused.set(false)"
        (scroll)="onTrackScroll()"
        (pointerdown)="onTrackPointerDown($event)"
        (pointermove)="onTrackPointerMove($event)"
        (pointerup)="onTrackPointerUp()"
        (pointercancel)="onTrackPointerUp()"
        (pointerleave)="onTrackPointerUp()"
      >
        <ng-content select="[kuiCarouselSlide]" />
      </div>

      @if (effectiveShowArrows()) {
        <span class="kui-carousel__control-slot kui-carousel__control-slot--prev">
          <button
            kuiIconButton
            shape="ghost"
            [attr.aria-label]="t().previous"
            [disabled]="prevDisabled()"
            (click)="goPrev()"
          >
            <svg width="16" height="16" [kuiGlyph]="previousGlyph()" [kuiGlyphStroke]="1.5"></svg>
          </button>
        </span>
        <span class="kui-carousel__control-slot kui-carousel__control-slot--next">
          <button
            kuiIconButton
            shape="ghost"
            [attr.aria-label]="t().next"
            [disabled]="nextDisabled()"
            (click)="goNext()"
          >
            <svg width="16" height="16" [kuiGlyph]="nextGlyph()" [kuiGlyphStroke]="1.5"></svg>
          </button>
        </span>
      }

      @if (effectiveAutoplay()) {
        <span class="kui-carousel__control-slot kui-carousel__control-slot--play">
          <button
            kuiIconButton
            shape="ghost"
            [attr.aria-label]="effectivePlaying() ? t().pause : t().resume"
            (click)="togglePlay()"
          >
            @if (effectivePlaying()) {
              <svg width="16" height="16" [kuiGlyph]="pauseGlyph" [kuiGlyphStroke]="1.5"></svg>
            } @else {
              <svg width="16" height="16" [kuiGlyph]="playGlyph" [kuiGlyphStroke]="1.5"></svg>
            }
          </button>
        </span>
      }
    </div>

    @if (effectiveShowDots()) {
      <div
        class="kui-carousel__dots"
        role="tablist"
        [attr.aria-label]="t().dots"
        (keydown)="onDotsKeydown($event)"
      >
        @for (dot of dots(); track dot.index) {
          <button
            #dotBtn
            type="button"
            role="tab"
            class="kui-carousel__dot"
            [attr.aria-selected]="dot.selected"
            [attr.aria-controls]="dot.controls"
            [attr.aria-label]="dot.label"
            [attr.tabindex]="dot.selected ? 0 : -1"
            [attr.data-kui-selected]="dot.selected ? '' : null"
            (click)="goTo(dot.index)"
          ></button>
        }
      </div>
    }
  `,
  host: {
    class: 'kui-carousel',
  },
  encapsulation: ViewEncapsulation.None,
})
/** Slide strip with Prev/Next, a dot picker, and optional autoplay. See the class-level example above. */
export class KuiCarouselComponent {
  protected readonly previousGlyph = injectKuiGlyph({
    role: 'previous',
    slot: () => this.carouselDefaults()?.previousIcon,
    fallback: KUI_GLYPH_CHEVRON_LEFT,
  });

  protected readonly nextGlyph = injectKuiGlyph({
    role: 'next',
    slot: () => this.carouselDefaults()?.nextIcon,
    fallback: KUI_GLYPH_CHEVRON_RIGHT,
  });

  protected readonly pauseGlyph = KUI_GLYPH_PAUSE;
  protected readonly playGlyph = KUI_GLYPH_PLAY;

  /** How many slides are visible at once. Defaults to `1`. */
  readonly itemsPerView = input<number | undefined, unknown>(undefined, {
    transform: optionalPositiveIntegerAttribute,
  });

  /** Wraps navigation at the edges instead of disabling Prev/Next there. Defaults to `false`. */
  readonly loop = input<boolean | undefined, unknown>(undefined, {
    transform: optionalBooleanAttribute,
  });

  /**
   * Advances automatically on a timer. Always renders a visible Play/Pause control and pauses
   * while the pointer or focus is inside the carousel. Defaults to `false`.
   */
  readonly autoplay = input<boolean | undefined, unknown>(undefined, {
    transform: optionalBooleanAttribute,
  });

  /** Autoplay delay between slides, in milliseconds. Defaults to `4000`. */
  readonly autoplayInterval = input<number | undefined, unknown>(undefined, {
    transform: autoplayIntervalAttribute,
  });

  /** Shows the Prev/Next arrow controls. Defaults to `true`. Swipe/scroll works regardless. */
  readonly showArrows = input<boolean | undefined, unknown>(undefined, {
    transform: optionalBooleanAttribute,
  });

  /** Shows the dot picker below the track. Defaults to `true`. Swipe/scroll works regardless. */
  readonly showDots = input<boolean | undefined, unknown>(undefined, {
    transform: optionalBooleanAttribute,
  });

  /**
   * Enables dragging the track: native touch swipe (always native `overflow-x` scroll -- this
   * flag doesn't add that) plus a pointer-based mouse drag-to-scroll on desktop, added here since
   * a mouse has no native swipe gesture. One flag for both because they're the same action
   * ("drag the track") from different input devices, not two independent features -- a
   * touchscreen laptop at a "desktop" width is still touch. Defaults to `true`. Setting it to
   * `false` also switches the track to `overflow-x: hidden`, since blocking the drag gesture alone
   * still leaves wheel/trackpad scroll able to move it.
   */
  readonly draggable = input<boolean | undefined, unknown>(undefined, {
    transform: optionalBooleanAttribute,
  });

  private readonly carouselDefaults = inject(KuiDefaults).get('carousel');

  protected readonly effectiveItemsPerView = computed(
    () => this.itemsPerView() ?? this.carouselDefaults()?.itemsPerView ?? 1,
  );
  protected readonly effectiveLoop = computed(
    () => this.loop() ?? this.carouselDefaults()?.loop ?? false,
  );
  protected readonly effectiveAutoplay = computed(
    () => this.autoplay() ?? this.carouselDefaults()?.autoplay ?? false,
  );
  protected readonly effectiveAutoplayInterval = computed(
    () => this.autoplayInterval() ?? this.carouselDefaults()?.autoplayInterval ?? 4000,
  );
  protected readonly effectiveShowArrows = computed(
    () => this.showArrows() ?? this.carouselDefaults()?.showArrows ?? true,
  );
  protected readonly effectiveShowDots = computed(
    () => this.showDots() ?? this.carouselDefaults()?.showDots ?? true,
  );
  protected readonly effectiveDraggable = computed(
    () => this.draggable() ?? this.carouselDefaults()?.draggable ?? true,
  );

  /**
   * Accessible name for the carousel region. Defaults to the `carousel.label` message; use a
   * content-specific name where one is available. Do not include `carousel`, because
   * `aria-roledescription` announces it.
   */
  readonly ariaLabel = input<string | undefined>();

  /** Per-instance text overrides; they win over the scoped and root messages. */
  readonly messages = input<Partial<KuiCarouselMessages> | undefined>();

  protected readonly t = injectKuiMessages('carousel', () => this.messages());

  /** Index of the first visible slide. Two-way bindable via `[(index)]`. Defaults to `0`. */
  readonly index = model(0);

  private readonly slides = contentChildren(KuiCarouselSlideDirective);
  private readonly trackRef = viewChild<ElementRef<HTMLElement>>('track');
  private readonly dotRefs = viewChildren<ElementRef<HTMLButtonElement>>('dotBtn');
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly idBase = kuiNextId('kui-carousel');

  /** True while the pointer, focus, or a touch interaction is inside the region. */
  protected readonly hoverPaused = signal(false);
  private readonly manuallyPaused = signal(false);
  private autoplayTimer: ReturnType<typeof setInterval> | null = null;
  private scrollSyncTimer: ReturnType<typeof setTimeout> | null = null;
  private lastSyncedIndex = -1;

  /** True while a mouse drag-to-scroll gesture is in progress. */
  protected readonly dragging = signal(false);
  private dragStartClientX = 0;
  private dragStartScrollLeft = 0;
  private restoreSnapTimer: ReturnType<typeof setTimeout> | null = null;
  private pendingSnapRestore: (() => void) | null = null;

  private readonly slideCount = computed(() => this.slides().length);

  /** Highest reachable `index` -- `slideCount - itemsPerView`, clamped to `>= 0`. */
  protected readonly maxIndex = computed(() =>
    Math.max(0, this.slideCount() - Math.max(1, this.effectiveItemsPerView())),
  );

  protected readonly clampedIndex = computed(() =>
    Math.min(Math.max(this.index(), 0), this.maxIndex()),
  );

  protected readonly prevDisabled = computed(
    () => !this.effectiveLoop() && this.clampedIndex() <= 0,
  );
  protected readonly nextDisabled = computed(
    () => !this.effectiveLoop() && this.clampedIndex() >= this.maxIndex(),
  );

  protected readonly effectivePlaying = computed(
    () => this.effectiveAutoplay() && !this.manuallyPaused() && !this.hoverPaused(),
  );

  protected readonly trackCursor = computed(() => {
    if (!this.effectiveDraggable()) return 'default';
    return this.dragging() ? 'grabbing' : 'grab';
  });

  protected readonly dots = computed(() => {
    const max = this.maxIndex();
    const current = this.clampedIndex();
    const total = max + 1;

    return Array.from({ length: total }, (_, i) => ({
      index: i,
      selected: i === current,
      label: this.t().goToSlide({ index: i + 1, total }),
      controls: this.slides()[i]?._id() ?? null,
    }));
  });

  constructor() {
    effect(() => {
      const slides = this.slides();
      const total = slides.length;

      slides.forEach((slide, i) => {
        slide._id.set(`${this.idBase}-slide-${i}`);
        slide._roleDescription.set(this.t().slideRoleDescription);
        slide._ariaLabel.set(this.t().slidePosition({ index: i + 1, total }));
      });
    });

    effect(() => {
      const idx = this.clampedIndex();
      if (idx === this.lastSyncedIndex) return;
      this.lastSyncedIndex = idx;
      this.scrollToIndex(idx);
    });

    effect((onCleanup) => {
      if (!this.isBrowser || !this.effectivePlaying()) {
        this.stopAutoplayTimer();
        return;
      }

      this.autoplayTimer = setInterval(() => this.goNext(), this.effectiveAutoplayInterval());
      onCleanup(() => this.stopAutoplayTimer());
    });

    this.destroyRef.onDestroy(() => {
      this.stopAutoplayTimer();
      if (this.scrollSyncTimer !== null) clearTimeout(this.scrollSyncTimer);
      this.cancelPendingSnapRestore();
    });
  }

  protected goPrev(): void {
    this.goTo(this.clampedIndex() - 1);
  }

  protected goNext(): void {
    this.goTo(this.clampedIndex() + 1);
  }

  protected goTo(target: number): void {
    const max = this.maxIndex();
    const next = this.effectiveLoop()
      ? ((target % (max + 1)) + (max + 1)) % (max + 1)
      : Math.min(Math.max(target, 0), max);

    if (next !== this.index()) this.index.set(next);
  }

  protected togglePlay(): void {
    this.manuallyPaused.update((v) => !v);
  }

  protected onRegionKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        this.goPrev();
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.goNext();
        break;
      case 'Home':
        event.preventDefault();
        this.goTo(0);
        break;
      case 'End':
        event.preventDefault();
        this.goTo(this.maxIndex());
        break;
    }
  }

  protected onDotsKeydown(event: KeyboardEvent): void {
    const dots = this.dotRefs();
    if (!dots.length) return;

    const current = this.clampedIndex();

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        this.focusAndSelectDot(dots, current > 0 ? current - 1 : dots.length - 1);
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.focusAndSelectDot(dots, current < dots.length - 1 ? current + 1 : 0);
        break;
      case 'Home':
        event.preventDefault();
        this.focusAndSelectDot(dots, 0);
        break;
      case 'End':
        event.preventDefault();
        this.focusAndSelectDot(dots, dots.length - 1);
        break;
    }
  }

  private focusAndSelectDot(dots: readonly ElementRef<HTMLButtonElement>[], target: number): void {
    dots[target]?.nativeElement.focus();
    this.goTo(target);
  }

  /**
   * Native scroll/swipe (trackpad, touch, or the track's own scrollbar) moves `scrollLeft`
   * directly -- nothing else observes that, so without this the `index` model, dots, and
   * Prev/Next disabled state would silently fall out of sync with what the user is actually
   * looking at. Debounced because `scroll` fires continuously during both a manual drag and this
   * component's own programmatic `scrollToIndex` animation; snapping the nearest slide only once
   * scrolling has settled avoids reading a mid-flight position.
   */
  protected onTrackScroll(): void {
    if (!this.isBrowser) return;

    if (this.scrollSyncTimer !== null) clearTimeout(this.scrollSyncTimer);
    this.scrollSyncTimer = setTimeout(() => {
      this.scrollSyncTimer = null;
      this.syncIndexFromScroll();
    }, 120);
  }

  private syncIndexFromScroll(): void {
    const track = this.trackRef()?.nativeElement;
    if (!track) return;

    const clamped = this.nearestSlideIndex(track);
    if (clamped === null || clamped === this.index()) return;

    // The scroll already landed here -- mark it synced so the index-driven effect below doesn't
    // immediately re-animate `scrollTo` back to the same spot it was just read from.
    this.lastSyncedIndex = clamped;
    this.index.set(clamped);
  }

  /** Index of the slide whose `offsetLeft` is closest to `track.scrollLeft`, clamped to `maxIndex`. */
  private nearestSlideIndex(track: HTMLElement): number | null {
    const slides = this.slides();
    if (!slides.length) return null;

    let nearest = 0;
    let nearestDelta = Infinity;

    slides.forEach((slide, i) => {
      const delta = Math.abs(slide.elementRef.nativeElement.offsetLeft - track.scrollLeft);
      if (delta < nearestDelta) {
        nearestDelta = delta;
        nearest = i;
      }
    });

    return Math.min(nearest, this.maxIndex());
  }

  /**
   * Starts a mouse drag-to-scroll gesture. Touch is excluded (`pointerType === 'touch'`) because
   * native touch scroll already handles that input device; this only adds the drag affordance a
   * mouse otherwise has no way to trigger. `scroll-snap-type` is disabled for the gesture's
   * duration so the browser doesn't fight the drag by snapping back mid-drag.
   */
  protected onTrackPointerDown(event: PointerEvent): void {
    if (!this.isBrowser || !this.effectiveDraggable() || event.pointerType === 'touch') return;

    const track = this.trackRef()?.nativeElement;
    if (!track) return;

    // A previous drag's deferred `restoreSnapAfterScroll` (its `scrollend` listener or fallback
    // timer) could otherwise fire mid-gesture here and flip `scroll-snap-type` back to `mandatory`
    // while this new drag is still writing `scrollLeft` -- the browser would then fight every one
    // of those writes by re-snapping instantly, freezing the visible position while `index` (read
    // from pointer movement, not from the now-stuck `scrollLeft`) keeps changing underneath it.
    this.cancelPendingSnapRestore();

    event.preventDefault();
    this.dragStartClientX = event.clientX;
    this.dragStartScrollLeft = track.scrollLeft;
    this.dragging.set(true);
    track.style.scrollSnapType = 'none';
    track.setPointerCapture?.(event.pointerId);
  }

  protected onTrackPointerMove(event: PointerEvent): void {
    if (!this.dragging()) return;

    const track = this.trackRef()?.nativeElement;
    if (!track) return;

    track.scrollLeft = this.dragStartScrollLeft - (event.clientX - this.dragStartClientX);
  }

  /** Ends the drag and snaps to the nearest slide, even when that's the slide it started on. */
  protected onTrackPointerUp(): void {
    if (!this.dragging()) return;
    this.dragging.set(false);

    const track = this.trackRef()?.nativeElement;
    if (!track) return;

    if (this.scrollSyncTimer !== null) {
      clearTimeout(this.scrollSyncTimer);
      this.scrollSyncTimer = null;
    }

    const nearest = this.nearestSlideIndex(track);
    if (nearest === null) {
      track.style.scrollSnapType = 'x mandatory';
      return;
    }

    // `scroll-snap-type` stays off through the smooth scroll below and is restored only once it
    // settles: flipping it back to `mandatory` immediately (while `scrollLeft` isn't already at a
    // snap point) makes the browser correct the position itself as an instant layout fix, not an
    // animated scroll -- that instant jump would happen before, and instead of, the smooth
    // `scrollTo` this method is about to start.
    this.restoreSnapAfterScroll(track);

    if (nearest === this.index()) {
      this.scrollToIndex(nearest);
    } else {
      this.lastSyncedIndex = nearest;
      this.index.set(nearest);
    }
  }

  private restoreSnapAfterScroll(track: HTMLElement): void {
    this.cancelPendingSnapRestore();

    const cleanup = (): void => {
      if (this.restoreSnapTimer !== null) {
        clearTimeout(this.restoreSnapTimer);
        this.restoreSnapTimer = null;
      }
      track.removeEventListener('scrollend', onScrollEnd);
      this.pendingSnapRestore = null;
    };

    const onScrollEnd = (): void => {
      cleanup();
      track.style.scrollSnapType = 'x mandatory';
    };

    track.addEventListener('scrollend', onScrollEnd, { once: true });
    // Fallback for browsers without `scrollend` (or if the scroll never actually starts because
    // it was already at the target position).
    this.restoreSnapTimer = setTimeout(onScrollEnd, 500);
    // Cancelable hook for a new drag gesture that starts before this one settles -- see the
    // comment in `onTrackPointerDown`. Canceling only tears down the pending listener/timer; it
    // never itself flips `scroll-snap-type`, since whichever gesture cancels this one is about to
    // set that style explicitly on its own.
    this.pendingSnapRestore = cleanup;
  }

  private cancelPendingSnapRestore(): void {
    this.pendingSnapRestore?.();
  }

  private scrollToIndex(index: number): void {
    if (!this.isBrowser) return;

    const track = this.trackRef()?.nativeElement;
    const slideEl = this.slides()[index]?.elementRef.nativeElement;
    if (!track || !slideEl || typeof track.scrollTo !== 'function') return;

    track.scrollTo({ left: slideEl.offsetLeft, behavior: 'smooth' });
  }

  private stopAutoplayTimer(): void {
    if (this.autoplayTimer !== null) {
      clearInterval(this.autoplayTimer);
      this.autoplayTimer = null;
    }
  }
}

import { Component, signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { afterEach, vi } from 'vitest';

import { KuiCarouselComponent } from './kui-carousel.component';
import { KuiCarouselSlideDirective } from './kui-carousel-slide.directive';

@Component({
  imports: [KuiCarouselComponent, KuiCarouselSlideDirective],
  template: `
    <kui-carousel
      [itemsPerView]="itemsPerView()"
      [loop]="loop()"
      [draggable]="draggable()"
      [(index)]="index"
    >
      <div kuiCarouselSlide>1</div>
      <div kuiCarouselSlide>2</div>
      <div kuiCarouselSlide>3</div>
    </kui-carousel>
  `,
})
class BasicHost {
  readonly itemsPerView = signal(1);
  readonly loop = signal(false);
  readonly draggable = signal(true);
  readonly index = signal(0);
}

@Component({
  imports: [KuiCarouselComponent, KuiCarouselSlideDirective],
  template: `
    <kui-carousel [autoplay]="true" [autoplayInterval]="1000">
      <div kuiCarouselSlide>1</div>
      <div kuiCarouselSlide>2</div>
    </kui-carousel>
  `,
})
class AutoplayHost {}

function createFixture<T>(component: new () => T): ComponentFixture<T> {
  TestBed.configureTestingModule({ imports: [component] });
  const fixture = TestBed.createComponent(component);
  fixture.detectChanges();
  return fixture;
}

function getButtons(fixture: ComponentFixture<unknown>, label: RegExp): HTMLButtonElement[] {
  return Array.from<HTMLButtonElement>(fixture.nativeElement.querySelectorAll('button')).filter(
    (btn) => label.test(btn.getAttribute('aria-label') ?? ''),
  );
}

describe('KuiCarouselComponent', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('uses a generic accessible region name when ariaLabel is omitted', () => {
    const fixture = createFixture(BasicHost);
    const region = fixture.nativeElement.querySelector('.kui-carousel__region') as HTMLElement;

    expect(region.getAttribute('aria-label')).toBe('Slides');
  });

  it('syncs the index model from a manual scroll/swipe once scrolling settles', () => {
    const fixture = createFixture(BasicHost);
    const host = fixture.componentInstance;
    const track = fixture.nativeElement.querySelector('.kui-carousel__track') as HTMLElement;
    const slides = Array.from<HTMLElement>(
      fixture.nativeElement.querySelectorAll('.kui-carousel__slide'),
    );

    // jsdom never lays out real geometry, so offsetLeft is stubbed here the way a real
    // browser would report it for three 300px-wide slides with no gap.
    slides.forEach((slide, i) => Object.defineProperty(slide, 'offsetLeft', { value: i * 300 }));

    vi.useFakeTimers();
    Object.defineProperty(track, 'scrollLeft', { value: 610, configurable: true });
    track.dispatchEvent(new Event('scroll'));
    vi.advanceTimersByTime(130);
    fixture.detectChanges();

    expect(host.index()).toBe(2);
  });

  it('shows a grab cursor and no overflow lock when draggable (default)', () => {
    const fixture = createFixture(BasicHost);
    const track = fixture.nativeElement.querySelector('.kui-carousel__track') as HTMLElement;

    expect(track.style.cursor).toBe('grab');
    expect(track.hasAttribute('data-kui-locked')).toBe(false);
  });

  it('locks the track and shows a default cursor when draggable is false', () => {
    const fixture = createFixture(BasicHost);
    const host = fixture.componentInstance;
    host.draggable.set(false);
    fixture.detectChanges();

    const track = fixture.nativeElement.querySelector('.kui-carousel__track') as HTMLElement;
    expect(track.style.cursor).toBe('default');
    expect(track.getAttribute('data-kui-locked')).toBe('');
  });

  it('ignores touch pointers for drag-to-scroll (native touch scroll handles those)', () => {
    const fixture = createFixture(BasicHost);
    const track = fixture.nativeElement.querySelector('.kui-carousel__track') as HTMLElement;

    track.dispatchEvent(
      new PointerEvent('pointerdown', { pointerType: 'touch', clientX: 0, bubbles: true }),
    );
    fixture.detectChanges();

    expect(track.style.cursor).toBe('grab');
  });

  it('drags the track with the mouse and snaps to the nearest slide on release', () => {
    const fixture = createFixture(BasicHost);
    const host = fixture.componentInstance;
    const track = fixture.nativeElement.querySelector('.kui-carousel__track') as HTMLElement;
    const slides = Array.from<HTMLElement>(
      fixture.nativeElement.querySelectorAll('.kui-carousel__slide'),
    );
    slides.forEach((slide, i) => Object.defineProperty(slide, 'offsetLeft', { value: i * 300 }));

    let scrollLeft = 0;
    Object.defineProperty(track, 'scrollLeft', {
      get: () => scrollLeft,
      set: (v) => {
        scrollLeft = v;
      },
      configurable: true,
    });
    track.setPointerCapture = vi.fn();

    track.dispatchEvent(
      new PointerEvent('pointerdown', { pointerType: 'mouse', clientX: 200, bubbles: true }),
    );
    fixture.detectChanges();
    expect(track.style.cursor).toBe('grabbing');

    track.dispatchEvent(
      new PointerEvent('pointermove', { pointerType: 'mouse', clientX: -50, bubbles: true }),
    );
    expect(scrollLeft).toBe(250);

    track.dispatchEvent(new PointerEvent('pointerup', { pointerType: 'mouse', bubbles: true }));
    fixture.detectChanges();

    expect(host.index()).toBe(1);
    expect(track.style.cursor).toBe('grab');
  });

  it("does not let a previous drag's deferred snap-restore re-enable snapping mid-redrag", () => {
    const fixture = createFixture(BasicHost);
    const track = fixture.nativeElement.querySelector('.kui-carousel__track') as HTMLElement;
    const slides = Array.from<HTMLElement>(
      fixture.nativeElement.querySelectorAll('.kui-carousel__slide'),
    );
    slides.forEach((slide, i) => Object.defineProperty(slide, 'offsetLeft', { value: i * 300 }));

    let scrollLeft = 0;
    Object.defineProperty(track, 'scrollLeft', {
      get: () => scrollLeft,
      set: (v) => {
        scrollLeft = v;
      },
      configurable: true,
    });
    track.setPointerCapture = vi.fn();

    vi.useFakeTimers();

    // First drag: release schedules a deferred restore of scroll-snap-type (no `scrollend` event
    // fires in jsdom, so only the fallback timer is pending here).
    track.dispatchEvent(
      new PointerEvent('pointerdown', { pointerType: 'mouse', clientX: 0, bubbles: true }),
    );
    track.dispatchEvent(new PointerEvent('pointerup', { pointerType: 'mouse', bubbles: true }));

    // A new drag starts before that fallback timer fires.
    track.dispatchEvent(
      new PointerEvent('pointerdown', { pointerType: 'mouse', clientX: 0, bubbles: true }),
    );
    expect(track.style.scrollSnapType).toBe('none');

    // The first drag's now-stale timer firing must not flip snapping back on mid-gesture.
    vi.advanceTimersByTime(600);
    expect(track.style.scrollSnapType).toBe('none');
  });

  it('renders a region with its fallback accessible name and roledescription', () => {
    const fixture = createFixture(BasicHost);
    const region = fixture.nativeElement.querySelector('[role="region"]');

    expect(region.getAttribute('aria-label')).toBe('Slides');
    expect(region.getAttribute('aria-roledescription')).toBe('carousel');
  });

  it('renders each slide with role=group and a "N of total" label', () => {
    const fixture = createFixture(BasicHost);
    const slides = fixture.nativeElement.querySelectorAll('[role="group"]');

    expect(slides.length).toBe(3);
    expect(slides[0].getAttribute('aria-label')).toBe('1 of 3');
    expect(slides[2].getAttribute('aria-label')).toBe('3 of 3');
  });

  it('disables Prev at index 0 and Next at the last reachable index without loop', () => {
    const fixture = createFixture(BasicHost);
    const host = fixture.componentInstance;

    const prev = getButtons(fixture, /Previous slide/)[0];
    const next = getButtons(fixture, /Next slide/)[0];

    expect(prev.disabled).toBe(true);
    expect(next.disabled).toBe(false);

    host.index.set(2);
    fixture.detectChanges();

    expect(prev.disabled).toBe(false);
    expect(next.disabled).toBe(true);
  });

  it('wraps around at the edges when loop is true', () => {
    const fixture = createFixture(BasicHost);
    const host = fixture.componentInstance;
    host.loop.set(true);
    fixture.detectChanges();

    const prev = getButtons(fixture, /Previous slide/)[0];
    prev.click();
    fixture.detectChanges();

    expect(host.index()).toBe(2);
  });

  it('advances the index on Next click and updates the model', () => {
    const fixture = createFixture(BasicHost);
    const host = fixture.componentInstance;

    getButtons(fixture, /Next slide/)[0].click();
    fixture.detectChanges();

    expect(host.index()).toBe(1);
  });

  it('renders one dot per reachable index and marks the current one selected', () => {
    const fixture = createFixture(BasicHost);
    const dots = fixture.nativeElement.querySelectorAll('[role="tab"]');

    expect(dots.length).toBe(3);
    expect(dots[0].getAttribute('aria-selected')).toBe('true');
    expect(dots[1].getAttribute('aria-selected')).toBe('false');
  });

  it('caps the reachable index at slideCount - itemsPerView', () => {
    const fixture = createFixture(BasicHost);
    const host = fixture.componentInstance;
    host.itemsPerView.set(2);
    fixture.detectChanges();

    const dots = fixture.nativeElement.querySelectorAll('[role="tab"]');
    expect(dots.length).toBe(2);
  });

  it('navigates with ArrowLeft/ArrowRight/Home/End on the region', () => {
    const fixture = createFixture(BasicHost);
    const host = fixture.componentInstance;
    const region = fixture.nativeElement.querySelector('[role="region"]');

    region.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    fixture.detectChanges();
    expect(host.index()).toBe(1);

    region.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    fixture.detectChanges();
    expect(host.index()).toBe(2);

    region.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    fixture.detectChanges();
    expect(host.index()).toBe(0);
  });

  it('renders a visible Play/Pause control when autoplay is true', () => {
    const fixture = createFixture(AutoplayHost);
    expect(getButtons(fixture, /autoplay/i).length).toBe(1);
  });

  it('renders no Play/Pause control when autoplay is false', () => {
    const fixture = createFixture(BasicHost);
    expect(getButtons(fixture, /autoplay/i).length).toBe(0);
  });

  it('toggles the Play/Pause label on click', () => {
    const fixture = createFixture(AutoplayHost);
    const toggle = getButtons(fixture, /autoplay/i)[0];

    expect(toggle.getAttribute('aria-label')).toBe('Pause autoplay');

    toggle.click();
    fixture.detectChanges();

    expect(toggle.getAttribute('aria-label')).toBe('Resume autoplay');
  });
});

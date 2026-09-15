import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { describe, expect, it, vi } from 'vitest';

import { KUI_DIALOG_CONTEXT } from '../dialog/kui-dialog-context.token';
import { KuiMediaViewerComponent } from './kui-media-viewer.component';
import type { KuiMediaViewerData, KuiMediaViewerItem } from './kui-media-viewer.types';

const ITEMS: readonly KuiMediaViewerItem[] = [
  { id: 'a', src: '/a.jpg', alt: 'Photo A' },
  { id: 'b', src: '/b.jpg', alt: 'Photo B' },
  { id: 'c', src: '/c.jpg', alt: 'Photo C' },
];

function create(
  data: Partial<KuiMediaViewerData> = {},
  close = vi.fn(),
): ComponentFixture<KuiMediaViewerComponent> {
  TestBed.configureTestingModule({
    providers: [
      {
        provide: KUI_DIALOG_CONTEXT,
        useValue: {
          data: { items: ITEMS, ...data },
          closable: false,
          appearance: 'default',
          close,
        },
      },
    ],
  });

  const fixture = TestBed.createComponent(KuiMediaViewerComponent);
  fixture.detectChanges();
  return fixture;
}

describe('KuiMediaViewerComponent', () => {
  it('renders a hidden title with the current position for aria-labelledby', () => {
    const fixture = create({ index: 1 });

    const title: HTMLElement = fixture.nativeElement.querySelector('.kui-dialog-title');
    expect(title.textContent).toContain('2 of 3');
  });

  it('clamps an out-of-range initial index', () => {
    const fixture = create({ index: 99 });

    const counter: HTMLElement = fixture.nativeElement.querySelector('.kui-media-viewer__counter');
    expect(counter.textContent?.trim()).toBe('3 / 3');
  });

  it('calls onIndexChange on open and on navigation', () => {
    const onIndexChange = vi.fn();
    const fixture = create({ onIndexChange });

    expect(onIndexChange).toHaveBeenCalledWith(0);

    const next: HTMLButtonElement = fixture.nativeElement.querySelector(
      '.kui-media-viewer__nav--next',
    );
    next.click();
    fixture.detectChanges();

    expect(onIndexChange).toHaveBeenCalledWith(1);
  });

  it('disables Previous on the first photo and Next on the last', () => {
    const fixture = create();

    const prev: HTMLButtonElement = fixture.nativeElement.querySelector(
      '.kui-media-viewer__nav--prev',
    );
    const next: HTMLButtonElement = fixture.nativeElement.querySelector(
      '.kui-media-viewer__nav--next',
    );
    expect(prev.disabled).toBe(true);
    expect(next.disabled).toBe(false);

    next.click();
    next.click();
    fixture.detectChanges();

    expect(next.disabled).toBe(true);
    expect(prev.disabled).toBe(false);
  });

  it('does not loop past either boundary via keyboard', () => {
    const fixture = create();
    const host: HTMLElement = fixture.nativeElement;

    host.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('.kui-media-viewer__counter').textContent?.trim(),
    ).toBe('1 / 3');

    host.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('.kui-media-viewer__counter').textContent?.trim(),
    ).toBe('3 / 3');

    host.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('.kui-media-viewer__counter').textContent?.trim(),
    ).toBe('3 / 3');

    host.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('.kui-media-viewer__counter').textContent?.trim(),
    ).toBe('1 / 3');
  });

  it('closes through the dialog context when Close is clicked', () => {
    const close = vi.fn();
    const fixture = create({}, close);

    const closeBtn: HTMLButtonElement = fixture.nativeElement.querySelector(
      '.kui-media-viewer__close',
    );
    closeBtn.click();

    expect(close).toHaveBeenCalled();
  });

  it('caps zoom in at maxZoom and zoom out at 1, resetting pan at 1', () => {
    const fixture = create({ maxZoom: 1.5, zoomStep: 0.5 });

    const zoomButtons = fixture.nativeElement.querySelectorAll(
      '.kui-media-viewer__toolbar-actions button',
    );
    const zoomOutBtn: HTMLButtonElement = zoomButtons[0];
    const zoomInBtn: HTMLButtonElement = zoomButtons[1];

    expect(zoomOutBtn.disabled).toBe(true);

    zoomInBtn.click();
    fixture.detectChanges();
    expect(zoomInBtn.disabled).toBe(true);

    zoomOutBtn.click();
    fixture.detectChanges();
    expect(zoomOutBtn.disabled).toBe(true);
  });

  it('shows a skeleton until the photo loads, then reveals it', () => {
    const fixture = create();

    expect(fixture.nativeElement.querySelector('[kuiSkeleton]')).not.toBeNull();

    const img: HTMLImageElement = fixture.nativeElement.querySelector('.kui-media-viewer__image');
    img.dispatchEvent(new Event('load'));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[kuiSkeleton]')).toBeNull();
    expect(img.classList.contains('kui-media-viewer__image--hidden')).toBe(false);
  });

  it('shows an empty state when the photo fails to load', () => {
    const fixture = create();

    const img: HTMLImageElement = fixture.nativeElement.querySelector('.kui-media-viewer__image');
    img.dispatchEvent(new Event('error'));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('kui-empty-state')).not.toBeNull();
  });

  it('falls back to src as the item key when id is omitted', () => {
    const fixture = create({
      items: [
        { src: '/no-id-a.jpg', alt: 'A' },
        { src: '/no-id-b.jpg', alt: 'B' },
      ],
    });

    const img: HTMLImageElement = fixture.nativeElement.querySelector('.kui-media-viewer__image');
    img.dispatchEvent(new Event('load'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[kuiSkeleton]')).toBeNull();

    // Navigating away and back must not lose the per-src load state keyed without an id.
    fixture.nativeElement.querySelector('.kui-media-viewer__nav--next').click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[kuiSkeleton]')).not.toBeNull();

    fixture.nativeElement.querySelector('.kui-media-viewer__nav--prev').click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[kuiSkeleton]')).toBeNull();
  });

  it('hides the thumbnail strip, counter, and Prev/Next for a single-photo gallery', () => {
    const fixture = create({ items: [ITEMS[0]] });

    expect(fixture.nativeElement.querySelector('.kui-media-viewer__strip')).toBeNull();
    expect(fixture.nativeElement.querySelector('.kui-media-viewer__counter')).toBeNull();
    expect(fixture.nativeElement.querySelector('.kui-media-viewer__nav--prev')).toBeNull();
    expect(fixture.nativeElement.querySelector('.kui-media-viewer__nav--next')).toBeNull();

    const title: HTMLElement = fixture.nativeElement.querySelector('.kui-dialog-title');
    expect(title.textContent?.trim()).toBe('Photo viewer');
  });

  it('navigates by clicking a thumbnail', () => {
    const fixture = create();

    const thumbs: NodeListOf<HTMLButtonElement> = fixture.nativeElement.querySelectorAll(
      '.kui-media-viewer__thumb',
    );
    thumbs[2].click();
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('.kui-media-viewer__counter').textContent?.trim(),
    ).toBe('3 / 3');
    expect(thumbs[2].getAttribute('aria-current')).toBe('true');
  });

  it('zooms in/out with the wheel and disables the toolbar buttons at the bounds', () => {
    const fixture = create({ maxZoom: 1.5, zoomStep: 0.5 });
    const frame: HTMLElement = fixture.nativeElement.querySelector('.kui-media-viewer__frame');
    const zoomButtons = fixture.nativeElement.querySelectorAll(
      '.kui-media-viewer__toolbar-actions button',
    );
    const zoomOutBtn: HTMLButtonElement = zoomButtons[0];
    const zoomInBtn: HTMLButtonElement = zoomButtons[1];

    frame.dispatchEvent(new WheelEvent('wheel', { deltaY: -100 }));
    fixture.detectChanges();
    expect(zoomInBtn.disabled).toBe(true);

    frame.dispatchEvent(new WheelEvent('wheel', { deltaY: 100 }));
    fixture.detectChanges();
    expect(zoomOutBtn.disabled).toBe(true);
  });

  it('pans a zoomed-in photo by dragging, clamped to the pan limit', () => {
    const fixture = create();
    const frame: HTMLElement = fixture.nativeElement.querySelector('.kui-media-viewer__frame');
    const img: HTMLImageElement = fixture.nativeElement.querySelector('.kui-media-viewer__image');
    const zoomInBtn: HTMLButtonElement = fixture.nativeElement.querySelectorAll(
      '.kui-media-viewer__toolbar-actions button',
    )[1];

    // The pan-limit clamp is under test here, not the leave-the-viewer bounds check -- stay
    // inside jsdom's default window size (1024x768) so the bounds check never engages; the delta
    // is still far past the 60px clamp below either way.
    zoomInBtn.click();
    fixture.detectChanges();

    frame.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 1, clientX: 0, clientY: 0 }));
    frame.dispatchEvent(
      new PointerEvent('pointermove', { pointerId: 1, clientX: 500, clientY: 0 }),
    );
    fixture.detectChanges();

    // zoom is 1.5 here (default zoomStep), so the clamp is 120 * (1.5 - 1) = 60px.
    expect(img.style.transform).toBe('translate(60px, 0px) scale(1.5)');

    frame.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1 }));
    fixture.detectChanges();
    expect(img.style.transition).toBe('');
  });

  it('stops panning once the pointer leaves the viewer bounds', () => {
    const fixture = create();
    const frame: HTMLElement = fixture.nativeElement.querySelector('.kui-media-viewer__frame');
    const img: HTMLImageElement = fixture.nativeElement.querySelector('.kui-media-viewer__image');
    const zoomInBtn: HTMLButtonElement = fixture.nativeElement.querySelectorAll(
      '.kui-media-viewer__toolbar-actions button',
    )[1];

    // The bounds check reads `frame.ownerDocument.defaultView.innerWidth/innerHeight` -- mock
    // those small. `defaultView` is the same jsdom `window` this test file's global `window`
    // resolves to, so mocking the latter is enough (no need to pass `view` on the events at all).
    const innerWidthSpy = vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(100);
    const innerHeightSpy = vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(100);

    zoomInBtn.click();
    fixture.detectChanges();

    frame.dispatchEvent(
      new PointerEvent('pointerdown', { pointerId: 1, clientX: 10, clientY: 10 }),
    );
    frame.dispatchEvent(
      new PointerEvent('pointermove', { pointerId: 1, clientX: 40, clientY: 10 }),
    );
    fixture.detectChanges();
    const panAfterFirstMove = img.style.transform;

    // This move happens outside the (mocked) 100x100 viewport -- panning must stop, not jump to
    // the out-of-bounds delta.
    frame.dispatchEvent(
      new PointerEvent('pointermove', { pointerId: 1, clientX: 500, clientY: 500 }),
    );
    fixture.detectChanges();

    expect(img.style.transform).toBe(panAfterFirstMove);
    innerWidthSpy.mockRestore();
    innerHeightSpy.mockRestore();
  });

  it('pinch-zooms with two pointers', () => {
    const fixture = create();
    const frame: HTMLElement = fixture.nativeElement.querySelector('.kui-media-viewer__frame');

    frame.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 1, clientX: 0, clientY: 0 }));
    frame.dispatchEvent(
      new PointerEvent('pointerdown', { pointerId: 2, clientX: 100, clientY: 0 }),
    );
    // Fingers spread from 100px apart to 200px apart -- distance doubles, zoom should double (2x).
    frame.dispatchEvent(
      new PointerEvent('pointermove', { pointerId: 2, clientX: 200, clientY: 0 }),
    );
    fixture.detectChanges();

    const zoomOutBtn: HTMLButtonElement = fixture.nativeElement.querySelectorAll(
      '.kui-media-viewer__toolbar-actions button',
    )[0];
    expect(zoomOutBtn.disabled).toBe(false);

    const img: HTMLImageElement = fixture.nativeElement.querySelector('.kui-media-viewer__image');
    expect(img.style.transform).toContain('scale(2)');
  });
});

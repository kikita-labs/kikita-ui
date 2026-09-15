import { Component, computed, inject, signal, ViewEncapsulation } from '@angular/core';

import {
  KUI_CHEVRON_LEFT_D,
  KUI_CHEVRON_RIGHT_D,
  KUI_SEARCH_CIRCLE,
  KUI_SEARCH_HANDLE_D,
  KUI_X_D,
  KUI_ZOOM_LINE_H_D,
  KUI_ZOOM_LINE_V_D,
} from '../../utils/kui-chrome-icon-paths.util';
import type { KuiDialogContext, KuiDialogHost } from '../dialog/kui-dialog-context.token';
import { KUI_DIALOG_CONTEXT } from '../dialog/kui-dialog-context.token';
import { KuiEmptyStateComponent } from '../empty-state/kui-empty-state.component';
import { KuiIconButtonDirective } from '../icon-button/kui-icon-button.directive';
import { KuiSkeletonDirective } from '../skeleton/kui-skeleton.directive';
import type { KuiMediaViewerData, KuiMediaViewerItem } from './kui-media-viewer.types';

/** Per-photo load status, tracked so the stage can show a loading/error placeholder. */
type KuiMediaViewerPhotoStatus = 'loading' | 'loaded' | 'error';

/**
 * Drag clamp used while panning a zoomed-in photo. A fixed offset budget per zoom step, not a
 * measurement of the photo's actual rendered size -- intentionally simplified, matching the
 * Claude Design spec's own documented open question. Revisit with a natural-size-aware clamp if a
 * consumer reports panning past the visible edge of a photo.
 */
const PAN_LIMIT_PER_ZOOM_STEP = 120;

/**
 * @internal
 * Fullscreen lightbox content opened by {@link kuiMediaViewer}. Not part of the public API --
 * consumers only ever see {@link kuiMediaViewer} and {@link KuiMediaViewerData}.
 *
 * Close/Prev/Next/Zoom in/Zoom out reuse `button[kuiIconButton]` (`shape="ghost"`) with static
 * inline SVG content instead of its network-dependent, name-resolved `icon` input -- the same
 * pattern `kui-pagination`'s First/Prev/Next/Last already use, for the same reason: these are
 * essential-to-operate controls, not consumer-chosen decoration.
 */
@Component({
  selector: 'kui-media-viewer',
  template: `
    <h2 class="kui-dialog-title kui-media-viewer__visually-hidden">{{ panelLabel() }}</h2>

    <div class="kui-media-viewer__toolbar">
      @if (isGallery()) {
        <span aria-live="polite" class="kui-media-viewer__counter">{{ counterText() }}</span>
      } @else {
        <!-- Keeps the toolbar's space-between layout with an empty start slot -- a single-item
             "1 / 1" counter carries no information worth a live region. -->
        <span></span>
      }
      <div class="kui-media-viewer__toolbar-actions">
        <button
          kuiIconButton
          shape="ghost"
          size="md"
          aria-label="Zoom out"
          [disabled]="zoomOutDisabled()"
          (click)="zoomOut()"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle
              cx="${KUI_SEARCH_CIRCLE.cx}"
              cy="${KUI_SEARCH_CIRCLE.cy}"
              r="${KUI_SEARCH_CIRCLE.r}"
              stroke="currentColor"
              stroke-width="1.6"
            />
            <path
              d="${KUI_SEARCH_HANDLE_D}"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
            />
            <path
              d="${KUI_ZOOM_LINE_H_D}"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
            />
          </svg>
        </button>
        <button
          kuiIconButton
          shape="ghost"
          size="md"
          aria-label="Zoom in"
          [disabled]="zoomInDisabled()"
          (click)="zoomIn()"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle
              cx="${KUI_SEARCH_CIRCLE.cx}"
              cy="${KUI_SEARCH_CIRCLE.cy}"
              r="${KUI_SEARCH_CIRCLE.r}"
              stroke="currentColor"
              stroke-width="1.6"
            />
            <path
              d="${KUI_SEARCH_HANDLE_D}"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
            />
            <path
              d="${KUI_ZOOM_LINE_H_D}"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
            />
            <path
              d="${KUI_ZOOM_LINE_V_D}"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
            />
          </svg>
        </button>
        <button
          kuiIconButton
          shape="ghost"
          size="md"
          class="kui-media-viewer__close"
          aria-label="Close photo viewer"
          (click)="close()"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="${KUI_X_D[0]}"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
            />
            <path
              d="${KUI_X_D[1]}"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </div>
    </div>

    <div class="kui-media-viewer__stage">
      @if (isGallery()) {
        <button
          kuiIconButton
          shape="ghost"
          size="lg"
          class="kui-media-viewer__nav kui-media-viewer__nav--prev"
          aria-label="Previous photo"
          [disabled]="prevDisabled()"
          (click)="goPrev()"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="${KUI_CHEVRON_LEFT_D}"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      }

      <div
        class="kui-media-viewer__frame"
        (pointerdown)="onFramePointerDown($event)"
        (pointermove)="onFramePointerMove($event)"
        (pointerup)="onFramePointerUp($event)"
        (pointercancel)="onFramePointerUp($event)"
        (wheel)="onFrameWheel($event)"
      >
        @if (currentStatus() === 'loading') {
          <div kuiSkeleton shape="rect" class="kui-media-viewer__placeholder"></div>
        }
        @if (currentStatus() === 'error') {
          <kui-empty-state
            class="kui-media-viewer__placeholder"
            heading="Could not load this photo"
            description="Check your connection and try again"
            context="error"
            size="sm"
          />
        }
        <img
          class="kui-media-viewer__image"
          [class.kui-media-viewer__image--hidden]="currentStatus() !== 'loaded'"
          [src]="current().src"
          [alt]="current().alt"
          draggable="false"
          [style.transform]="imageTransform()"
          [style.transition]="dragging() ? 'none' : ''"
          [style.cursor]="zoom() > 1 ? 'grab' : ''"
          (load)="onPhotoLoad(itemKey(current()))"
          (error)="onPhotoError(itemKey(current()))"
        />
      </div>

      @if (isGallery()) {
        <button
          kuiIconButton
          shape="ghost"
          size="lg"
          class="kui-media-viewer__nav kui-media-viewer__nav--next"
          aria-label="Next photo"
          [disabled]="nextDisabled()"
          (click)="goNext()"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="${KUI_CHEVRON_RIGHT_D}"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      }
    </div>

    @if (isGallery()) {
      <div class="kui-media-viewer__strip">
        @for (item of items(); track itemKey(item)) {
          <button
            type="button"
            class="kui-media-viewer__thumb"
            [class.kui-media-viewer__thumb--active]="$index === index()"
            [attr.aria-current]="$index === index() ? 'true' : null"
            [attr.aria-label]="'Go to photo ' + ($index + 1) + ' of ' + items().length"
            (click)="goTo($index)"
          >
            <img [src]="item.src" alt="" loading="lazy" />
          </button>
        }
      </div>
    }
  `,
  imports: [KuiIconButtonDirective, KuiSkeletonDirective, KuiEmptyStateComponent],
  host: {
    class: 'kui-media-viewer',
    '(keydown)': 'onKeydown($event)',
  },
  encapsulation: ViewEncapsulation.None,
})
/** Renders the fullscreen photo lightbox opened by {@link kuiMediaViewer}. */
export class KuiMediaViewerComponent implements KuiDialogHost<void, KuiMediaViewerData> {
  public readonly dialogContext =
    inject<KuiDialogContext<void, KuiMediaViewerData>>(KUI_DIALOG_CONTEXT);

  private readonly ctx = this.dialogContext;
  private readonly maxZoom = this.ctx.data.maxZoom ?? 3;
  private readonly zoomStep = this.ctx.data.zoomStep ?? 0.5;

  protected readonly items = computed(() => this.ctx.data.items);

  protected readonly index = signal(
    clamp(this.ctx.data.index ?? 0, 0, Math.max(this.ctx.data.items.length - 1, 0)),
  );
  protected readonly zoom = signal(1);
  protected readonly panX = signal(0);
  protected readonly panY = signal(0);
  protected readonly dragging = signal(false);

  private readonly photoStatus = signal<ReadonlyMap<string, KuiMediaViewerPhotoStatus>>(new Map());

  protected readonly current = computed(() => this.items()[this.index()]);
  protected readonly currentStatus = computed<KuiMediaViewerPhotoStatus>(
    () => this.photoStatus().get(this.itemKey(this.current())) ?? 'loading',
  );

  /**
   * A single photo needs no counter, Prev/Next, or thumbnail strip -- the same gallery API just
   * renders less chrome, rather than a separate single-photo directive/component. This is the
   * same approach established lightbox libraries (PhotoSwipe, yet-another-react-lightbox) take:
   * one API for both, not a duplicate surface for the one-item case.
   */
  protected readonly isGallery = computed(() => this.items().length > 1);

  protected readonly counterText = computed(() => `${this.index() + 1} / ${this.items().length}`);
  protected readonly panelLabel = computed(() =>
    this.isGallery()
      ? `${this.ctx.data.ariaLabel ?? 'Photo viewer'}, photo ${this.index() + 1} of ${this.items().length}`
      : (this.ctx.data.ariaLabel ?? 'Photo viewer'),
  );

  protected readonly prevDisabled = computed(() => this.index() <= 0);
  protected readonly nextDisabled = computed(() => this.index() >= this.items().length - 1);
  protected readonly zoomInDisabled = computed(() => this.zoom() >= this.maxZoom);
  protected readonly zoomOutDisabled = computed(() => this.zoom() <= 1);

  protected readonly imageTransform = computed(
    () => `translate(${this.panX()}px, ${this.panY()}px) scale(${this.zoom()})`,
  );

  private dragStart: { pointerX: number; pointerY: number; panX: number; panY: number } | null =
    null;
  private readonly activePointers = new Map<number, { x: number; y: number }>();
  private pinchStart: { distance: number; zoom: number } | null = null;

  constructor() {
    this.ctx.data.onIndexChange?.(this.index());
  }

  protected close(): void {
    this.ctx.close();
  }

  protected goTo(index: number): void {
    const total = this.items().length;
    if (index < 0 || index >= total || index === this.index()) return;

    this.index.set(index);
    this.zoom.set(1);
    this.panX.set(0);
    this.panY.set(0);
    this.ctx.data.onIndexChange?.(index);
  }

  protected goPrev(): void {
    this.goTo(this.index() - 1);
  }

  protected goNext(): void {
    this.goTo(this.index() + 1);
  }

  protected zoomIn(): void {
    this.setZoom(this.zoom() + this.zoomStep);
  }

  protected zoomOut(): void {
    this.setZoom(this.zoom() - this.zoomStep);
  }

  private setZoom(target: number): void {
    const next = clamp(roundToStep(target), 1, this.maxZoom);
    this.zoom.set(next);
    if (next === 1) {
      this.panX.set(0);
      this.panY.set(0);
    }
  }

  /** `item.id` when given; `item.src` otherwise -- see the `id` field's own JSDoc. */
  protected itemKey(item: KuiMediaViewerItem): string {
    return item.id ?? item.src;
  }

  protected onPhotoLoad(id: string): void {
    this.setPhotoStatus(id, 'loaded');
  }

  protected onPhotoError(id: string): void {
    this.setPhotoStatus(id, 'error');
  }

  private setPhotoStatus(id: string, status: KuiMediaViewerPhotoStatus): void {
    this.photoStatus.update((current) => {
      const next = new Map(current);
      next.set(id, status);
      return next;
    });
  }

  protected onFramePointerDown(event: PointerEvent): void {
    this.activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    // Optional chaining: not every test/legacy DOM implements pointer capture; the pan/pinch
    // logic below degrades gracefully to plain event listening without it.
    (event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId);

    if (this.activePointers.size === 2) {
      // A second finger landed -- switch from single-pointer pan to pinch-zoom, discarding any
      // pan drag the first finger had started. `dragging` doubles as "suspend the CSS transform
      // transition while actively manipulating" for both gestures.
      this.dragStart = null;
      this.dragging.set(true);
      this.pinchStart = { distance: this.pinchDistance(), zoom: this.zoom() };
      return;
    }

    if (this.activePointers.size > 2 || this.zoom() <= 1) return;

    // Prevents the browser's own default pointerdown handling -- most importantly, starting a
    // native "drag this image out" or "drag the current text selection" gesture, which would
    // otherwise compete with the pan below for every subsequent pointermove.
    event.preventDefault();
    this.dragging.set(true);
    this.dragStart = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      panX: this.panX(),
      panY: this.panY(),
    };
  }

  protected onFramePointerMove(event: PointerEvent): void {
    if (!this.activePointers.has(event.pointerId)) return;
    this.activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (this.activePointers.size === 2 && this.pinchStart) {
      const distance = this.pinchDistance();
      if (distance > 0) {
        this.setZoom((this.pinchStart.zoom * distance) / this.pinchStart.distance);
      }
      return;
    }

    if (!this.dragStart) return;

    // Stop panning once the pointer leaves the lightbox entirely. `kuiMediaViewer()` always opens
    // at `size: 'fullscreen'`, so the lightbox *is* the viewport -- checked against
    // ownerDocument.defaultView (never the bare global `window`, the same convention
    // `kui-color-input` already uses), not an element's own `getBoundingClientRect()`. The
    // obvious candidate, this component's own host element, is unusable for that:
    // `KuiDialogContainerComponent.attachContent()` sets the attached content's host to
    // `display: contents` so its children become direct flex items of `.kui-dialog` -- and a
    // `display: contents` element's own `getBoundingClientRect()` is always a zero rect, which
    // made every pointermove read as "outside" and cancel the pan on its very first move.
    const view = (event.currentTarget as HTMLElement).ownerDocument.defaultView;
    const insideViewer =
      !view ||
      (event.clientX >= 0 &&
        event.clientX <= view.innerWidth &&
        event.clientY >= 0 &&
        event.clientY <= view.innerHeight);

    if (!insideViewer) {
      this.onFramePointerUp(event);
      return;
    }

    const limit = PAN_LIMIT_PER_ZOOM_STEP * (this.zoom() - 1);
    const nextX = this.dragStart.panX + (event.clientX - this.dragStart.pointerX);
    const nextY = this.dragStart.panY + (event.clientY - this.dragStart.pointerY);

    this.panX.set(clamp(nextX, -limit, limit));
    this.panY.set(clamp(nextY, -limit, limit));
  }

  protected onFramePointerUp(event: PointerEvent): void {
    this.activePointers.delete(event.pointerId);
    const frame = event.currentTarget as HTMLElement;
    if (frame.hasPointerCapture?.(event.pointerId)) {
      frame.releasePointerCapture(event.pointerId);
    }

    this.pinchStart = null;
    this.dragging.set(false);
    this.dragStart = null;
  }

  /** Zoom with the mouse wheel, or a trackpad pinch (browsers report that as `ctrlKey` + wheel). */
  protected onFrameWheel(event: WheelEvent): void {
    event.preventDefault();
    if (event.deltaY < 0) this.zoomIn();
    else if (event.deltaY > 0) this.zoomOut();
  }

  private pinchDistance(): number {
    const [a, b] = this.activePointers.values();
    return a && b ? Math.hypot(b.x - a.x, b.y - a.y) : 0;
  }

  protected onKeydown(event: KeyboardEvent): void {
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
        this.goTo(this.items().length - 1);
        break;
    }
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function roundToStep(value: number): number {
  return Math.round(value * 100) / 100;
}

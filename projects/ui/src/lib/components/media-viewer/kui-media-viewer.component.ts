import { Component, computed, inject, signal, ViewEncapsulation } from '@angular/core';

import { injectKuiMessages } from '../../i18n/inject-kui-messages';
import { KuiI18n } from '../../i18n/kui-i18n.service';
import type { KuiDialogContext, KuiDialogHost } from '../dialog/kui-dialog-context.token';
import { KUI_DIALOG_CONTEXT } from '../dialog/kui-dialog-context.token';
import { KuiEmptyStateComponent } from '../empty-state/kui-empty-state.component';
import { injectKuiGlyph } from '../icon/inject-kui-glyph';
import {
  KUI_GLYPH_CHEVRON_LEFT,
  KUI_GLYPH_CHEVRON_RIGHT,
  KUI_GLYPH_X,
  KUI_GLYPH_ZOOM_IN,
  KUI_GLYPH_ZOOM_OUT,
} from '../icon/kui-chrome-glyphs';
import { KuiGlyphComponent } from '../icon/kui-glyph.component';
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
  templateUrl: './kui-media-viewer.component.html',
  imports: [
    KuiIconButtonDirective,
    KuiSkeletonDirective,
    KuiEmptyStateComponent,
    KuiGlyphComponent,
  ],
  host: {
    class: 'kui-media-viewer',
    '(keydown)': 'onKeydown($event)',
  },
  encapsulation: ViewEncapsulation.None,
})
/** Renders the fullscreen photo lightbox opened by {@link kuiMediaViewer}. */
export class KuiMediaViewerComponent implements KuiDialogHost<void, KuiMediaViewerData> {
  protected readonly closeGlyph = injectKuiGlyph({
    role: 'close',
    fallback: KUI_GLYPH_X,
  });

  protected readonly previousGlyph = injectKuiGlyph({
    role: 'previous',
    fallback: KUI_GLYPH_CHEVRON_LEFT,
  });

  protected readonly nextGlyph = injectKuiGlyph({
    role: 'next',
    fallback: KUI_GLYPH_CHEVRON_RIGHT,
  });

  protected readonly zoomInGlyph = KUI_GLYPH_ZOOM_IN;
  protected readonly zoomOutGlyph = KUI_GLYPH_ZOOM_OUT;

  public readonly dialogContext =
    inject<KuiDialogContext<void, KuiMediaViewerData>>(KUI_DIALOG_CONTEXT);

  private readonly ctx = this.dialogContext;
  private readonly i18n = inject(KuiI18n);

  protected readonly t = injectKuiMessages('mediaViewer', () => this.ctx.data.messages);
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

  protected readonly counterText = computed(() => {
    const { formatNumber } = this.i18n.context();

    return `${formatNumber(this.index() + 1)} / ${formatNumber(this.items().length)}`;
  });
  protected readonly panelLabel = computed(() => {
    const label = this.ctx.data.ariaLabel ?? this.t().label;

    return this.isGallery()
      ? this.t().position({ label, index: this.index() + 1, total: this.items().length })
      : label;
  });

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

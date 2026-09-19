import type { FlexibleConnectedPositionStrategyOrigin, Overlay } from '@angular/cdk/overlay';
import { isPlatformBrowser } from '@angular/common';

import type { KuiTooltipOverlayHandle } from '../../utils/kui-tooltip-overlay.util';
import { createKuiTooltipOverlay } from '../../utils/kui-tooltip-overlay.util';

/**
 * Owns the one shared tooltip overlay for a chart instance: `show()` creates it on the first
 * call and retargets/updates its text on every call after, `hide()` disposes it. Callers must
 * only call `hide()` when focus/hover leaves the whole marks group (not on every individual
 * mark's own leave/blur) -- a per-mark `hide()` call defeats retargeting by disposing and
 * recreating the overlay on every adjacent-mark hover (found and fixed in `kui-line-chart`
 * during browser verification; centralized here so `kui-bar-chart`/donut/scatter cannot repeat
 * it). See `.local-notes/v2/chart-architecture-plan.md`'s 2026-09-17 browser-verification
 * revision, item 2.
 *
 * The anchor is a `{x, y}` viewport point (the pointer position), not the hovered mark element --
 * a mark-as-anchor tooltip is pinned to that element's own `getBoundingClientRect`, which for a
 * keyboard-focused mark is exactly what you want, but for a mouse-hovered one means the tooltip
 * jumps to wherever CDK's connected-position logic puts it relative to that box (for a small
 * point-like mark, close to the cursor by coincidence; for a large or non-convex shape like a
 * donut slice's wedge, potentially nowhere near it -- see `KuiDonutChartComponent`'s doc). Callers
 * pass a mark element to `show`/`move` only for keyboard focus (see `showAt`); pointer interactions
 * pass the event's `{clientX, clientY}` instead, and `move` keeps that point updated on
 * `pointermove` so the tooltip visibly follows the cursor, matching common chart libraries'
 * hover-tooltip behavior (Chart.js, Highcharts).
 */
/** `pointerType` values a touchscreen/stylus reports -- shared by every chart component to decide
 * between mouse-style hover-follow (`show`/`move`, hidden by `onXsPointerLeave`) and touch-style
 * tap-to-pin (`showPinned`, dismissed only by an outside tap/Escape -- see its doc). */
export function isTouchPointerType(pointerType: string): boolean {
  return pointerType === 'touch' || pointerType === 'pen';
}

export class KuiChartTooltipController {
  private handle: KuiTooltipOverlayHandle | null = null;
  private readonly onWindowBlur = (): void => this.hide();
  private touchDismissCleanup: (() => void) | null = null;

  constructor(
    private readonly overlay: Overlay,
    private readonly platformId: object,
  ) {
    // Alt-tabbing away (or switching to another app/devtools) never fires a `pointerleave` on the
    // marks group -- the pointer just stops moving mid-hover -- so without this, a tooltip shown
    // right before the switch stays parked on screen indefinitely, outliving the hover it was
    // showing (found from a real repro: alt-tab away and back, then move the mouse elsewhere on
    // the page -- the tooltip doesn't budge until the next click). `blur` covers this regardless
    // of *why* the pointer stopped generating events.
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('blur', this.onWindowBlur);
    }
  }

  /** Releases the `window` listener from the constructor -- callers must call this once, from
   * their own `DestroyRef.onDestroy`, alongside `hide()`. */
  destroy(): void {
    this.disarmTouchDismissal();
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('blur', this.onWindowBlur);
    }
  }

  /** Shows/retargets the tooltip at a viewport point (typically the pointer position) with the
   * given text. Use `move` instead for a same-text position update on `pointermove` -- cheaper,
   * since it skips `updateText`'s change detection pass.
   *
   * Always passes `touchEnabled: true` to `createKuiTooltipOverlay` -- `tooltip.css` hides any
   * tooltip WITHOUT that flag at viewport widths <= 767px (`kuiTooltip`'s own default: a hover
   * tooltip is auxiliary, so it's suppressed on touch-sized viewports where hover doesn't really
   * exist). A chart's tooltip is the opposite: it's the primary way to read a data point's exact
   * value, not decorative, so it must never disappear from CSS alone at phone widths -- found as
   * the real root cause of "tooltip doesn't work on phones" (it wasn't a touch-event problem at
   * all; it was `display: none` unconditionally hiding it below 768px, mouse or touch). */
  show(anchor: FlexibleConnectedPositionStrategyOrigin, text: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (!this.handle) {
      this.handle = createKuiTooltipOverlay({
        anchor,
        overlay: this.overlay,
        placement: 'top',
        text,
        touchEnabled: true,
      });
    } else {
      this.handle.retarget(anchor);
      this.handle.updateText(text);
    }
  }

  /** Repositions an already-shown tooltip to a new point without touching its text -- for
   * `pointermove` while the pointer stays over the same mark (the mark's own `pointerenter` is
   * what calls `show` with the new text when the pointer crosses into a different mark). A no-op
   * if the tooltip isn't currently shown (e.g. a stray `pointermove` after `hide`). */
  move(anchor: FlexibleConnectedPositionStrategyOrigin): void {
    this.handle?.retarget(anchor);
  }

  /**
   * Touch equivalent of `show` + `move`: there's no hover to follow (no drag = no `pointermove`,
   * and a touch `pointerleave` fires right on release, almost immediately after `pointerenter` --
   * so treating touch like mouse hover made the tooltip flash and vanish before it could be read,
   * the second real cause behind "tooltip doesn't work on phones", alongside this class's `show`
   * doc on the `touchEnabled` CSS visibility fix). Instead, a tap PINS the tooltip open: it stays
   * up until the user taps outside `containerEl` (the whole marks group -- tapping a DIFFERENT
   * mark inside it just retargets/updates text via this same method, it doesn't dismiss) or the
   * tooltip itself, or presses Escape. Callers must still skip their own `pointerleave`-triggered
   * `hide()` for touch (check `event.pointerType`) -- this method's dismissal is what closes it
   * instead. `onDismiss` lets the caller clear its own hover-highlight state (e.g.
   * `hoveredMarkKey`) in step with the tooltip closing.
   */
  showPinned(
    anchor: FlexibleConnectedPositionStrategyOrigin,
    text: string,
    containerEl: Element,
    onDismiss: () => void,
  ): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.show(anchor, text);
    this.armTouchDismissal(containerEl, onDismiss);
  }

  hide(): void {
    this.disarmTouchDismissal();
    this.handle?.overlayRef.dispose();
    this.handle = null;
  }

  private armTouchDismissal(containerEl: Element, onDismiss: () => void): void {
    this.disarmTouchDismissal();
    const dismiss = (): void => {
      this.disarmTouchDismissal();
      this.hide();
      onDismiss();
    };
    const onOutsidePointerDown = (event: PointerEvent): void => {
      const target = event.target as Node | null;
      const tooltipEl = this.handle?.tooltipEl;
      if (target && (containerEl.contains(target) || tooltipEl?.contains(target))) return;
      dismiss();
    };
    const onEscape = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') dismiss();
    };
    // The pinned anchor is a static `{x, y}` viewport point captured at tap time, not the mark's
    // own element -- CDK's `reposition()` scroll strategy keeps the overlay glued to that same
    // fixed point as the page scrolls under it, not to the mark, which scrolls away underneath it
    // (found from a screenshot: dragging the chart to scroll the page left the tooltip floating in
    // place, detached from any mark). Re-deriving the anchor from scroll deltas would need a live
    // reference to the original mark element this class doesn't keep; dismissing on scroll is the
    // same "leaving the chart's context closes it" rule `onOutsidePointerDown` already applies,
    // and matches how touch chart tooltips commonly behave elsewhere (Google Charts, native iOS/
    // Android chart popovers).
    document.addEventListener('pointerdown', onOutsidePointerDown, { capture: true });
    document.addEventListener('keydown', onEscape, { capture: true });
    document.addEventListener('scroll', dismiss, { capture: true, passive: true });
    this.touchDismissCleanup = () => {
      document.removeEventListener('pointerdown', onOutsidePointerDown, { capture: true });
      document.removeEventListener('keydown', onEscape, { capture: true });
      document.removeEventListener('scroll', dismiss, { capture: true });
    };
  }

  private disarmTouchDismissal(): void {
    this.touchDismissCleanup?.();
    this.touchDismissCleanup = null;
  }
}

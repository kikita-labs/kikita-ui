import type { FlexibleConnectedPositionStrategyOrigin, Overlay } from '@angular/cdk/overlay';
import { isPlatformBrowser } from '@angular/common';

import { KuiTooltipPresenter } from '../../tooltip/kui-tooltip-presenter';

/** `pointerType` values a touchscreen/stylus reports -- shared by every chart component to decide
 * between mouse-style hover-follow (`show`/`move`, hidden by `onXsPointerLeave`) and touch-style
 * tap-to-pin (`showPinned`, dismissed only by an outside tap/Escape -- see its doc). */
export function isTouchPointerType(pointerType: string): boolean {
  return pointerType === 'touch' || pointerType === 'pen';
}

/**
 * Reuses one overlay per chart while moving between marks. Dispose only when
 * interaction leaves the marks group; per-mark disposal breaks retargeting.
 * Pointer interactions use viewport coordinates so the tooltip follows the cursor.
 * Keyboard focus uses the mark element as its anchor. The surface is hoverable and
 * dismissible with Escape (WCAG 1.4.13) through the shared presenter. See docs/chart.md.
 */
export class KuiChartTooltipController {
  private readonly presenter: KuiTooltipPresenter;
  private readonly onWindowBlur = (): void => this.hide();
  private touchDismissCleanup: (() => void) | null = null;

  constructor(
    overlay: Overlay,
    private readonly platformId: object,
    private readonly document: Document,
  ) {
    // A chart tooltip is the primary way to read a value, so it must also show at phone widths
    // (`touchEnabled`), follows WCAG 1.4.13 (hoverable, Escape-dismissible, persistent) through the
    // shared presenter, and is removed at once instead of fading, because it retargets constantly.
    this.presenter = new KuiTooltipPresenter({
      overlay,
      document,
      placement: () => 'top',
      touchEnabled: () => true,
      // The tooltip follows the pointer, so it must not be a target of its own.
      hoverable: false,
      animateHide: false,
    });

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
    this.presenter.show(anchor, text);
  }

  /** Repositions an already-shown tooltip to a new point without touching its text -- for
   * `pointermove` while the pointer stays over the same mark. A no-op if no tooltip is shown. */
  move(anchor: FlexibleConnectedPositionStrategyOrigin): void {
    this.presenter.retarget(anchor);
  }

  /** Whether the user pressed Escape and the tooltip is held closed until the next intentional trigger. */
  get dismissed(): boolean {
    return this.presenter.dismissed;
  }

  /** Lets the next hover or focus show the tooltip again after an Escape. */
  resetDismissed(): void {
    this.presenter.resetDismissed();
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
    this.presenter.pin();
    this.armTouchDismissal(containerEl, onDismiss);
  }

  /** Closes the tooltip now. */
  hide(): void {
    this.disarmTouchDismissal();
    this.presenter.hide();
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
      const tooltipEl = this.presenter.surface;
      if (target && (containerEl.contains(target) || tooltipEl?.contains(target))) return;
      dismiss();
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
    // Escape is handled by the presenter, so a pinned tooltip closes with it too.
    this.document.addEventListener('pointerdown', onOutsidePointerDown, { capture: true });
    this.document.addEventListener('scroll', dismiss, { capture: true, passive: true });
    this.touchDismissCleanup = () => {
      this.document.removeEventListener('pointerdown', onOutsidePointerDown, { capture: true });
      this.document.removeEventListener('scroll', dismiss, { capture: true });
    };
  }

  private disarmTouchDismissal(): void {
    this.touchDismissCleanup?.();
    this.touchDismissCleanup = null;
  }
}

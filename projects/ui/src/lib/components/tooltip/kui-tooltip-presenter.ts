import type { FlexibleConnectedPositionStrategyOrigin, Overlay } from '@angular/cdk/overlay';

import type { KuiTooltipOverlayHandle } from './kui-tooltip-overlay.util';
import { createKuiTooltipOverlay } from './kui-tooltip-overlay.util';
import type { KuiTooltipPlacement } from './kui-tooltip-placement.type';

/** How long a tooltip stays open after the pointer left both its trigger and its surface, in ms. */
export const KUI_TOOLTIP_CLOSE_DELAY = 150;

/** @internal Options of {@link KuiTooltipPresenter}. */
export interface KuiTooltipPresenterOptions {
  readonly overlay: Overlay;
  readonly document: Document;
  /** Read every time a tooltip opens, so a changed input applies to the next one. */
  readonly placement: () => KuiTooltipPlacement;
  /** Gap in px between the anchor and the tooltip, read when a tooltip opens. */
  readonly offset?: () => number | undefined;
  /** Lets the tooltip render at mobile widths, read when a tooltip opens. */
  readonly touchEnabled?: () => boolean;
  /**
   * Lets the pointer rest on the tooltip (WCAG 1.4.13). Defaults to `true`. A tooltip that follows the
   * pointer turns it off: the surface then ignores pointer events, so the pointer never lands on it.
   */
  readonly hoverable?: boolean;
  /** Fades the tooltip out before removing it. Defaults to `true`. */
  readonly animateHide?: boolean;
  /** Called whenever the tooltip closes, for any reason. */
  readonly onHide?: () => void;
  /** Called after the user dismissed the tooltip with Escape (after `onHide`). */
  readonly onDismiss?: () => void;
}

/**
 * @internal
 * The one owner of a tooltip's life: it creates the overlay, retargets it, and meets WCAG 1.4.13
 * (Content on Hover or Focus) for every producer that uses it.
 *
 * - **Hoverable**: the pointer can move from the trigger onto the tooltip. Leaving the trigger only
 *   schedules the close, entering the surface cancels it, and leaving the surface schedules it again.
 * - **Dismissible**: Escape closes the tooltip without moving focus or the pointer, and nothing else
 *   sees that Escape while a tooltip is open (a dialog underneath stays open). The tooltip stays
 *   closed until the producer calls {@link resetDismissed}, which it does when the trigger is left or
 *   focus moves, so Escape is not undone by the next `pointermove`.
 * - **Persistent**: it stays until the trigger is left, the user dismisses it, or the producer hides it.
 */
export class KuiTooltipPresenter {
  private handle: KuiTooltipOverlayHandle | null = null;
  private closeTimer: ReturnType<typeof setTimeout> | null = null;
  private surfaceHovered = false;
  private dismissedFlag = false;
  private pinnedFlag = false;
  private detachSurface: (() => void) | null = null;
  private detachEscape: (() => void) | null = null;

  constructor(private readonly options: KuiTooltipPresenterOptions) {}

  /** Whether a tooltip is currently shown. */
  get isOpen(): boolean {
    return this.handle !== null;
  }

  /** The tooltip surface, or `null` while nothing is shown. */
  get surface(): HTMLElement | null {
    return this.handle?.tooltipEl ?? null;
  }

  /** `true` after Escape, until {@link resetDismissed}. A dismissed tooltip does not show. */
  get dismissed(): boolean {
    return this.dismissedFlag;
  }

  /** Forgets an Escape: the next intentional trigger may show the tooltip again. */
  resetDismissed(): void {
    this.dismissedFlag = false;
  }

  /** Shows the tooltip at an anchor, or retargets and updates the one that is open. */
  show(anchor: FlexibleConnectedPositionStrategyOrigin, text: string, id?: string): void {
    if (this.dismissedFlag) return;

    this.cancelClose();

    if (this.handle) {
      this.handle.retarget(anchor);
      this.handle.updateText(text);
      return;
    }

    this.handle = createKuiTooltipOverlay({
      anchor,
      id,
      overlay: this.options.overlay,
      placement: this.options.placement(),
      offset: this.options.offset?.(),
      text,
      touchEnabled: this.options.touchEnabled?.(),
      hoverable: this.options.hoverable ?? true,
    });
    if (this.options.hoverable ?? true) this.attachSurface(this.handle.tooltipEl);
    this.attachEscape();
  }

  /** Moves the open tooltip to a new anchor without touching its text. */
  retarget(anchor: FlexibleConnectedPositionStrategyOrigin): void {
    this.handle?.retarget(anchor);
  }

  /** Replaces the text of the open tooltip. */
  updateText(text: string): void {
    this.handle?.updateText(text);
  }

  /** Recomputes the position of the open tooltip. */
  updatePosition(): void {
    this.handle?.updatePosition();
  }

  /**
   * Closes the tooltip after {@link KUI_TOOLTIP_CLOSE_DELAY} unless the pointer is on its surface. The
   * delay counts from the first call: a pointer that keeps moving outside the trigger calls this on
   * every move, and restarting the timer each time would keep the tooltip frozen on screen until
   * the pointer stopped.
   */
  scheduleClose(): void {
    if (!this.handle || this.pinnedFlag || this.closeTimer !== null) return;

    this.closeTimer = setTimeout(() => {
      this.closeTimer = null;
      if (!this.surfaceHovered) this.hide();
    }, KUI_TOOLTIP_CLOSE_DELAY);
  }

  /** Cancels a scheduled close. */
  cancelClose(): void {
    if (this.closeTimer !== null) {
      clearTimeout(this.closeTimer);
      this.closeTimer = null;
    }
  }

  /**
   * Pins the open tooltip, as a tap does: it no longer closes when a pointer leaves it, and stays until
   * the owner hides it. Cleared by {@link hide}.
   */
  pin(): void {
    this.pinnedFlag = true;
    this.cancelClose();
  }

  /** Closes the tooltip now. */
  hide(): void {
    this.pinnedFlag = false;
    this.cancelClose();
    this.detachEscape?.();
    this.detachEscape = null;
    this.detachSurface?.();
    this.detachSurface = null;
    this.surfaceHovered = false;

    const handle = this.handle;
    this.handle = null;
    if (!handle) return;

    this.options.onHide?.();

    const { overlayRef, tooltipEl } = handle;
    if (this.options.animateHide === false) {
      overlayRef.dispose();
      return;
    }

    tooltipEl.classList.add('is-hiding');
    let removed = false;
    const remove = (): void => {
      if (!removed) {
        removed = true;
        overlayRef.dispose();
      }
    };
    tooltipEl.addEventListener('animationend', remove, { once: true });
    setTimeout(remove, 200);
  }

  /** Closes the tooltip and releases everything; call once from the owner's destroy hook. */
  destroy(): void {
    this.hide();
  }

  private attachSurface(surface: HTMLElement): void {
    // A touch or pen tooltip is pinned until dismissed; only a mouse resting on it counts as hover.
    const enter = (event: PointerEvent): void => {
      if (event.pointerType === 'touch' || event.pointerType === 'pen') return;
      this.surfaceHovered = true;
      this.cancelClose();
    };
    const leave = (event: PointerEvent): void => {
      if (event.pointerType === 'touch' || event.pointerType === 'pen') return;
      this.surfaceHovered = false;
      this.scheduleClose();
    };

    surface.addEventListener('pointerenter', enter);
    surface.addEventListener('pointerleave', leave);
    this.detachSurface = () => {
      surface.removeEventListener('pointerenter', enter);
      surface.removeEventListener('pointerleave', leave);
    };
  }

  private attachEscape(): void {
    const onKeydown = (event: KeyboardEvent): void => {
      if (event.key !== 'Escape') return;

      event.stopPropagation();
      this.dismissedFlag = true;
      this.hide();
      this.options.onDismiss?.();
    };

    this.options.document.addEventListener('keydown', onKeydown, { capture: true });
    this.detachEscape = () =>
      this.options.document.removeEventListener('keydown', onKeydown, { capture: true });
  }
}

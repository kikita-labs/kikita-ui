import type {
  ConnectedPosition,
  FlexibleConnectedPositionStrategy,
  Overlay,
  OverlayRef,
} from '@angular/cdk/overlay';
import type { ViewportRuler } from '@angular/cdk/scrolling';

/**
 * Shared dismissal wiring for anchored floating panels (`kui-dropdown`, `kui-menu`, and any
 * future one): close on Escape, close on an outside click, and either reposition or
 * auto-close on scroll depending on whether the anchor itself has scrolled off-screen.
 *
 * Each consumer keeps its own overlay creation, template/content projection, and panel CSS --
 * this only covers the dismissal behavior that would otherwise be reimplemented (and
 * re-debugged) identically in every anchored panel.
 */
export interface KuiFloatingPanelHandlers {
  /** Called when Escape is pressed while the panel is open. */
  onEscape: () => void;
  /** Called on a pointer event outside both the panel and `outsideClickIgnoreEl`. */
  onOutside: () => void;
  /** Called when the anchor scrolls fully out of the viewport. */
  onAnchorOffscreen: () => void;
  /**
   * Also treat focus moving outside the panel as a close trigger (`kui-dropdown`'s behavior).
   * `kui-menu` only closes on clicks, so leave this off there.
   */
  watchFocusin?: boolean;
  /**
   * Pointer event used for outside-click detection. `kui-dropdown` uses `click`; `kui-menu`
   * uses `mousedown` (fires before the trigger's own click re-opens it on the same gesture).
   */
  outsideEventType?: 'click' | 'mousedown';
  /**
   * Optional selector for the real interactive surface inside the overlay pane. By default the
   * whole overlay pane is treated as inside; use this when empty pane space should close.
   */
  panelSelector?: string;
  /** Optional escape hatch for nested overlay surfaces that should not close the current panel. */
  shouldIgnoreOutside?: (target: Element) => boolean;
  /**
   * Called after every scroll-triggered `positionStrategy.apply()` (the anchor moved but is
   * still on-screen). Scrolling can change how much room is available without ever changing
   * *which* position pair is used (still "below", just shifted) -- `positionChanges` doesn't
   * fire in that case, so a panel clamped smaller earlier would otherwise never re-measure and
   * grow back even once scrolling opens up more room. Consumers that clamp panel height should
   * re-run that clamp here.
   */
  onReposition?: () => void;
}

/** Builds the shared `FlexibleConnectedPositionStrategy` all anchored panels position with. */
export function createFloatingPositionStrategy(
  overlay: Overlay,
  anchor: Element,
  positions: ConnectedPosition[],
): FlexibleConnectedPositionStrategy {
  return overlay.position().flexibleConnectedTo(anchor).withPositions(positions).withPush(false);
}

/**
 * A panel's own `max-height` clamp (e.g. `calc(100vh - margin)`) caps it against the *whole*
 * viewport, not against the space actually available in the direction it rendered. A panel
 * anchored low on the page that flips upward can still be shorter than the full-viewport cap
 * while still overflowing past the top of the screen, if the anchor leaves less room above it
 * than the cap allows -- with no way to scroll to the clipped part. Measure the panel's real
 * rendered position and shrink its `max-height` further, only if it actually overflows.
 */
export function clampPanelToAvailableSpace(
  panel: HTMLElement,
  viewportHeight: number,
  margin = 8,
): void {
  const rect = panel.getBoundingClientRect();
  let available = Infinity;

  if (rect.top < margin) {
    available = rect.bottom - margin;
  } else if (rect.bottom > viewportHeight - margin) {
    available = viewportHeight - margin - rect.top;
  }

  if (available < rect.height) {
    panel.style.maxHeight = `${Math.max(120, Math.round(available))}px`;
  }
}

/**
 * Re-applies `positionStrategy` and re-clamps `panel` whenever the viewport itself resizes.
 * Delegates viewport observation to Angular CDK so anchored panels stay SSR-friendly and avoid
 * direct browser-global listeners in library code.
 */
export function observeViewportResize(
  viewportRuler: ViewportRuler,
  onResize: () => void,
): { unsubscribe: () => void } {
  return viewportRuler.change().subscribe(onResize);
}

/**
 * Wires Escape/outside-click/scroll dismissal for an already-created+attached overlay.
 * Returns a single `unsubscribe()` to tear all of it down.
 */
export function wireFloatingPanelDismissal(
  document: Document,
  overlayRef: OverlayRef,
  positionStrategy: FlexibleConnectedPositionStrategy,
  anchor: Element,
  outsideClickIgnoreEl: Element | null,
  handlers: KuiFloatingPanelHandlers,
): { unsubscribe: () => void } {
  const overlayEl = overlayRef.overlayElement;
  const outsideEventType = handlers.outsideEventType ?? 'click';

  const escapeSub = overlayRef.keydownEvents().subscribe((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      handlers.onEscape();
    }
  });

  const isOutside = (target: Element): boolean => {
    const panelEl = handlers.panelSelector
      ? overlayEl.querySelector<HTMLElement>(handlers.panelSelector)
      : overlayEl;
    return !panelEl?.contains(target) && !outsideClickIgnoreEl?.contains(target);
  };

  const outsideHandler = (event: MouseEvent) => {
    const target = event.target as Element;
    if (isOutside(target) && !handlers.shouldIgnoreOutside?.(target)) handlers.onOutside();
  };

  const focusHandler = (event: FocusEvent) => {
    const target = event.target as Element | null;
    if (target && isOutside(target) && !handlers.shouldIgnoreOutside?.(target)) {
      handlers.onOutside();
    }
  };

  // CDK's own scroll-based reposition only tracks CdkScrollable-registered containers.
  // Capture scroll on document covers all scrollable ancestors, including unregistered ones.
  // Scroll events don't bubble, but capture-phase document listeners still receive them from
  // descendants -- including the panel's own internal scroll. Ignore those: repositioning
  // mid-scroll of the panel's own content races the browser's scroll commit.
  const scrollHandler = (event: Event) => {
    if (overlayEl.contains(event.target as Node)) return;

    const anchorRect = anchor.getBoundingClientRect();
    const viewportHeight = document.documentElement.clientHeight;
    const viewportWidth = document.documentElement.clientWidth;
    const anchorOffScreen =
      anchorRect.bottom <= 0 ||
      anchorRect.top >= viewportHeight ||
      anchorRect.right <= 0 ||
      anchorRect.left >= viewportWidth;

    if (anchorOffScreen) {
      handlers.onAnchorOffscreen();
      return;
    }

    positionStrategy.apply();
    handlers.onReposition?.();
  };

  document.addEventListener(outsideEventType, outsideHandler, { capture: true });
  if (handlers.watchFocusin) {
    document.addEventListener('focusin', focusHandler, { capture: true });
  }
  document.addEventListener('scroll', scrollHandler, { capture: true, passive: true });

  return {
    unsubscribe: () => {
      escapeSub.unsubscribe();
      document.removeEventListener(outsideEventType, outsideHandler, { capture: true });
      if (handlers.watchFocusin) {
        document.removeEventListener('focusin', focusHandler, { capture: true });
      }
      document.removeEventListener('scroll', scrollHandler, { capture: true });
    },
  };
}

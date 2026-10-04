import { CdkTrapFocus } from '@angular/cdk/a11y';
import type { ConnectedPosition, OverlayRef } from '@angular/cdk/overlay';
import { Overlay } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { ViewportRuler } from '@angular/cdk/scrolling';
import { DOCUMENT } from '@angular/common';
import type { OnDestroy, TemplateRef } from '@angular/core';
import {
  booleanAttribute,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  model,
  numberAttribute,
  signal,
  viewChild,
  ViewContainerRef,
  ViewEncapsulation,
} from '@angular/core';

import { injectKuiMessages } from '../../i18n/inject-kui-messages';
import { KuiDefaults } from '../../providers/kui-defaults.service';
import {
  createFloatingPositionStrategy,
  observeViewportResize,
  wireFloatingPanelDismissal,
} from '../../utils/kui-floating-panel.util';
import { kuiNextId } from '../../utils/kui-id.util';
import { optionalBooleanAttribute } from '../../utils/kui-input-transform.util';
import type {
  KuiPopoverAlign,
  KuiPopoverPlacement,
  KuiPopoverTriggerType,
} from './kui-popover.types';

function popoverOffsetAttribute(value: unknown): number | undefined {
  if (value === undefined || value === null) return undefined;
  const parsed = numberAttribute(value, 8);
  return Number.isFinite(parsed) ? parsed : 8;
}

function hoverDelayAttribute(value: unknown): number | undefined {
  if (value === undefined || value === null) return undefined;
  const parsed = numberAttribute(value, 100);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : 100;
}

/**
 * Floating content panel anchored to a trigger element.
 *
 * Pair with `[kuiPopoverFor]` on the trigger, or call `openFor(element)` imperatively.
 *
 * @example
 * ```html
 * <button [kuiPopoverFor]="pop" kuiButton>Open</button>
 * <kui-popover #pop>
 *   <p>Popover content</p>
 * </kui-popover>
 * ```
 */
@Component({
  selector: 'kui-popover',
  imports: [CdkTrapFocus],
  templateUrl: './kui-popover.component.html',
  encapsulation: ViewEncapsulation.None,
})
/** Renders an anchored popover surface with configurable trigger behavior. */
export class KuiPopover implements OnDestroy {
  /** Preferred side of the anchor. Auto-flips to fit in viewport. Defaults to `defaults.popover.placement`, then `bottom`. */
  readonly placement = input<KuiPopoverPlacement | undefined>();

  /** Alignment along the anchor edge. Defaults to `defaults.popover.align`, then `center`. */
  readonly align = input<KuiPopoverAlign | undefined>();

  /** Show the arrow caret pointing to the anchor. Defaults to `defaults.popover.arrow`, then `false`. */
  readonly arrow = input<boolean | undefined, unknown>(undefined, {
    transform: optionalBooleanAttribute,
  });

  /** `click` toggles on click and closes on outside click / ESC. `hover` opens on mouseenter and closes on mouseleave. Defaults to `defaults.popover.triggerType`, then `click`. */
  readonly triggerType = input<KuiPopoverTriggerType | undefined>();

  /**
   * Accessible name for the popover dialog panel. Defaults to the `popover.label` message;
   * override with content-specific text when possible.
   */
  readonly ariaLabel = input<string | undefined>();

  protected readonly messages = injectKuiMessages('popover');

  /** Delay before closing on mouseleave (ms). Allows mouse to travel from trigger to panel. */
  readonly hoverDelay = input<number | undefined, unknown>(undefined, {
    transform: hoverDelayAttribute,
  });

  /** Gap in px between anchor and panel (arrow adds extra offset automatically). */
  readonly offset = input<number | undefined, unknown>(undefined, {
    transform: popoverOffsetAttribute,
  });

  /** Trap focus inside the panel and auto-focus the first focusable element on open. */
  readonly trapFocus = input(false, { transform: booleanAttribute });

  /** Two-way binding for controlled open state. */
  readonly open = model(false);

  /** Stable id used by trigger controls for `aria-controls`. */
  readonly panelId = kuiNextId('kui-popover');

  private readonly popoverDefaults = inject(KuiDefaults).get('popover');

  protected readonly effectiveArrow = computed(
    () => this.arrow() ?? this.popoverDefaults()?.arrow ?? false,
  );

  private readonly effectivePlacement = computed(
    () => this.placement() ?? this.popoverDefaults()?.placement ?? 'bottom',
  );
  private readonly effectiveAlign = computed(
    () => this.align() ?? this.popoverDefaults()?.align ?? 'center',
  );
  /** @internal Trigger type after local input and defaults, read by `kuiPopoverFor`. */
  readonly effectiveTriggerType = computed(
    () => this.triggerType() ?? this.popoverDefaults()?.triggerType ?? 'click',
  );
  /** @internal Hover close delay after local input and defaults, read by `kuiPopoverFor`. */
  readonly effectiveHoverDelay = computed(
    () => this.hoverDelay() ?? this.popoverDefaults()?.hoverDelay ?? 100,
  );
  private readonly effectiveOffset = computed(
    () => this.offset() ?? this.popoverDefaults()?.offset ?? 8,
  );

  protected readonly _side = signal<KuiPopoverPlacement>('bottom');
  protected readonly _align = signal<KuiPopoverAlign>('center');
  protected readonly _closing = signal(false);

  protected readonly _alignTransform = computed(() => {
    const side = this._side();
    const aln = this._align();
    const horiz = side === 'top' || side === 'bottom';
    const tx = horiz
      ? aln === 'center'
        ? 'translateX(-50%)'
        : aln === 'end'
          ? 'translateX(-100%)'
          : ''
      : side === 'left'
        ? 'translateX(-100%)'
        : '';
    const ty = !horiz
      ? aln === 'center'
        ? 'translateY(-50%)'
        : aln === 'end'
          ? 'translateY(-100%)'
          : ''
      : '';
    return [tx, ty].filter(Boolean).join(' ') || null;
  });

  private readonly tplRef = viewChild.required<TemplateRef<void>>('tpl');
  private readonly overlay = inject(Overlay);
  private readonly vcr = inject(ViewContainerRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly document = inject(DOCUMENT);
  private readonly viewportRuler = inject(ViewportRuler);

  private _overlayRef: OverlayRef | null = null;
  private _openSubs: { unsubscribe: () => void }[] = [];
  private _triggerEl: Element | null = null;
  private _closeTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.destroyRef.onDestroy(() => {
      this._clearCloseTimer();
      this._cleanup();
      this._detach();
    });
  }

  /** Open the popover anchored to the given element. */
  openFor(anchor: Element): void {
    this._clearCloseTimer();
    if (this.open()) {
      if (this._triggerEl === anchor && !this._closing()) return;
      this._cleanup();
      this._detach();
      this._closing.set(false);
      this.open.set(false);
    }
    this._triggerEl = anchor;
    this._doOpen(anchor);
  }

  /** Toggle the popover for a trigger, reopening immediately if an exit animation is running. */
  toggleFor(anchor: Element): void {
    this.open() && !this._closing() ? this.close() : this.openFor(anchor);
  }

  /** Close the popover with exit animation. */
  close(): void {
    if (!this.open() || this._closing()) return;
    this._clearCloseTimer();
    this._cleanup();
    this._closing.set(true);
  }

  /** Schedule close after `delay` ms (used by hover mode). */
  scheduleClose(delay: number): void {
    this._clearCloseTimer();
    this._closeTimer = setTimeout(() => {
      this._closeTimer = null;
      this.close();
    }, delay);
  }

  /** Cancel a pending scheduled close (used by hover mode when mouse enters panel). */
  cancelClose(): void {
    this._clearCloseTimer();
  }

  protected onPanelMouseEnter(): void {
    if (this.effectiveTriggerType() === 'hover') this.cancelClose();
  }

  protected onPanelMouseLeave(): void {
    if (this.effectiveTriggerType() === 'hover') this.scheduleClose(this.effectiveHoverDelay());
  }

  protected onAnimationEnd(event: AnimationEvent): void {
    if (this._closing() && event.animationName.startsWith('kui-pop-out')) {
      this._closing.set(false);
      this.open.set(false);
      const trigger = this._triggerEl;
      this._triggerEl = null;
      this._detach();
      // Only restore focus for click/keyboard-opened popovers. A hover-triggered popover's
      // trigger listens for `focusin` to reopen on hover -- focusing it here would immediately
      // reopen the popover that just closed, permanently stuck open until the pointer leaves
      // and re-enters the trigger.
      if (trigger instanceof HTMLElement && this.effectiveTriggerType() !== 'hover')
        trigger.focus();
    }
  }

  private _doOpen(anchor: Element): void {
    const pref = this.effectivePlacement();
    const aln = this.effectiveAlign();
    const gap = this.effectiveOffset() + (this.effectiveArrow() ? 6 : 0);

    const posStrategy = createFloatingPositionStrategy(
      this.overlay,
      anchor,
      this._buildPositions(pref, aln, gap),
    );

    this._overlayRef = this.overlay.create({
      positionStrategy: posStrategy,
      scrollStrategy: this.overlay.scrollStrategies.noop(),
    });

    this._side.set(pref);
    this._align.set(aln);

    this._overlayRef.attach(new TemplatePortal(this.tplRef(), this.vcr));
    this.open.set(true);
    this._closing.set(false);

    const overlayEl = this._overlayRef.overlayElement;

    const posSub = posStrategy.positionChanges.subscribe((change) => {
      const side = this._sideFromPair(change.connectionPair);
      const align = this._alignFromPair(change.connectionPair, side);
      this._side.set(side);
      this._align.set(align);
    });

    const resizeSub = observeViewportResize(this.viewportRuler, () => posStrategy.apply());
    const dismissSub = wireFloatingPanelDismissal(
      this.document,
      this._overlayRef,
      posStrategy,
      anchor,
      this._triggerEl,
      {
        outsideEventType: 'mousedown',
        panelSelector: '.kui-popover',
        onEscape: () => this.close(),
        onOutside: () => this.close(),
        onAnchorOffscreen: () => this.close(),
        shouldIgnoreOutside: (target) =>
          target.closest(
            '.kui-color-input-popover, .kui-dropdown, .kui-menu, .kui-select, .kui-combobox, .kui-command-palette, .kui-popover',
          ) != null,
      },
    );

    this._openSubs = [posSub, resizeSub, dismissSub];

    if (this.trapFocus()) {
      setTimeout(() => {
        const panel = overlayEl.querySelector<HTMLElement>('.kui-popover');
        const first = panel?.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        first?.focus();
      }, 0);
    }
  }

  private _buildPositions(
    pref: KuiPopoverPlacement,
    aln: KuiPopoverAlign,
    gap: number,
  ): ConnectedPosition[] {
    const flip: Record<KuiPopoverPlacement, KuiPopoverPlacement> = {
      bottom: 'top',
      top: 'bottom',
      left: 'right',
      right: 'left',
    };
    return [this._makePosition(pref, aln, gap), this._makePosition(flip[pref], aln, gap)];
  }

  private _makePosition(
    side: KuiPopoverPlacement,
    aln: KuiPopoverAlign,
    gap: number,
  ): ConnectedPosition {
    const h = aln === 'start' ? 'start' : aln === 'end' ? 'end' : 'center'; // originX for top/bottom
    const v = aln === 'start' ? 'top' : aln === 'end' ? 'bottom' : 'center'; // originY for left/right

    // CDK 22: never use overlayX/Y 'center'/'end'; pane size=0 before paint gives wrong position.
    // Always 'start'; alignment compensated by _alignTransform on inner wrapper div.
    // offsetX/Y sign used to identify side in _sideFromPair (unambiguous).
    if (side === 'bottom')
      return { originX: h, originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: gap };
    if (side === 'top')
      return { originX: h, originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -gap };
    if (side === 'right')
      return { originX: 'end', originY: v, overlayX: 'start', overlayY: 'top', offsetX: gap };
    /* left */ return {
      originX: 'start',
      originY: v,
      overlayX: 'start',
      overlayY: 'top',
      offsetX: -gap,
    };
  }

  private _sideFromPair(pair: ConnectedPosition): KuiPopoverPlacement {
    // Side is encoded in offsetY vs offsetX sign (always set, never both)
    if (pair.offsetY != null) return pair.offsetY > 0 ? 'bottom' : 'top';
    return (pair.offsetX ?? 0) > 0 ? 'right' : 'left';
  }

  private _alignFromPair(pair: ConnectedPosition, side: KuiPopoverPlacement): KuiPopoverAlign {
    if (side === 'top' || side === 'bottom') {
      // originX encodes align (overlayX is always 'start')
      return pair.originX === 'start' ? 'start' : pair.originX === 'end' ? 'end' : 'center';
    }
    // originY encodes align (overlayY is always 'top')
    return pair.originY === 'top' ? 'start' : pair.originY === 'bottom' ? 'end' : 'center';
  }

  private _cleanup(): void {
    this._openSubs.forEach((s) => s.unsubscribe());
    this._openSubs = [];
  }

  private _detach(): void {
    this._overlayRef?.detach();
    this._overlayRef?.dispose();
    this._overlayRef = null;
  }

  private _clearCloseTimer(): void {
    if (this._closeTimer != null) {
      clearTimeout(this._closeTimer);
      this._closeTimer = null;
    }
  }

  ngOnDestroy(): void {
    this._clearCloseTimer();
    this._cleanup();
    this._detach();
  }
}

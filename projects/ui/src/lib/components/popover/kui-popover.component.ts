import {
  Component,
  DestroyRef,
  OnDestroy,
  TemplateRef,
  ViewContainerRef,
  ViewEncapsulation,
  computed,
  inject,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { CdkTrapFocus } from '@angular/cdk/a11y';
import { ConnectedPosition, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { ViewportRuler } from '@angular/cdk/scrolling';
import { DOCUMENT } from '@angular/common';

import {
  createFloatingPositionStrategy,
  observeViewportResize,
  wireFloatingPanelDismissal,
} from '../../utils/kui-floating-panel.util';
import type {
  KuiPopoverAlign,
  KuiPopoverPlacement,
  KuiPopoverTriggerType,
} from './kui-popover.types';

let nextPopoverId = 0;

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
  template: `
    <ng-template #tpl>
      <!-- Wrapper carries the alignment transform; kept separate from the animated element
           so CDK-applied transforms on the overlay pane don't cancel the gap offset. -->
      <div [style.transform]="_alignTransform()">
        <div
          [id]="panelId"
          class="kui-popover"
          [class.kui-popover--in]="!_closing()"
          [class.kui-popover--out]="_closing()"
          [attr.data-side]="_side()"
          [attr.data-align]="_align()"
          role="dialog"
          [attr.aria-label]="ariaLabel()"
          [cdkTrapFocus]="trapFocus()"
          (animationend)="onAnimationEnd($event)"
          (mouseenter)="onPanelMouseEnter()"
          (mouseleave)="onPanelMouseLeave()"
        >
          @if (arrow()) {
            <div class="kui-popover-arrow" aria-hidden="true"></div>
          }
          <ng-content />
        </div>
      </div>
    </ng-template>
  `,
  encapsulation: ViewEncapsulation.None,
})
export class KuiPopoverComponent implements OnDestroy {
  /** Preferred side of the anchor. Auto-flips to fit in viewport. */
  readonly placement = input<KuiPopoverPlacement>('bottom');

  /** Alignment along the anchor edge. */
  readonly align = input<KuiPopoverAlign>('center');

  /** Show the arrow caret pointing to the anchor. */
  readonly arrow = input(false);

  /** `click` toggles on click and closes on outside click / ESC. `hover` opens on mouseenter and closes on mouseleave. */
  readonly triggerType = input<KuiPopoverTriggerType>('click');

  /** Accessible name for the popover dialog panel. Override with content-specific text when possible. */
  readonly ariaLabel = input('Popover');

  /** Delay before closing on mouseleave (ms). Allows mouse to travel from trigger to panel. */
  readonly hoverDelay = input(100);

  /** Gap in px between anchor and panel (arrow adds extra offset automatically). */
  readonly offset = input(8);

  /** Trap focus inside the panel and auto-focus the first focusable element on open. */
  readonly trapFocus = input(false);

  /** Two-way binding for controlled open state. */
  readonly open = model(false);

  /** Stable id used by trigger controls for `aria-controls`. */
  readonly panelId = `kui-popover-${nextPopoverId++}`;

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
    if (this.triggerType() === 'hover') this.cancelClose();
  }

  protected onPanelMouseLeave(): void {
    if (this.triggerType() === 'hover') this.scheduleClose(this.hoverDelay());
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
      if (trigger instanceof HTMLElement && this.triggerType() !== 'hover') trigger.focus();
    }
  }

  private _doOpen(anchor: Element): void {
    const pref = this.placement();
    const aln = this.align();
    const gap = this.offset() + (this.arrow() ? 6 : 0);

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

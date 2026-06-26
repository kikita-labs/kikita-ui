import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  NgZone,
  OnDestroy,
  TemplateRef,
  ViewContainerRef,
  ViewEncapsulation,
  inject,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { ConnectedPosition, FlexibleConnectedPositionStrategy, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';

import type { KuiPopoverAlign, KuiPopoverPlacement, KuiPopoverTriggerType } from './kui-popover.types';

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
  template: `
    <ng-template #tpl>
      <div
        class="kui-popover"
        [class.kui-popover--in]="!_closing()"
        [class.kui-popover--out]="_closing()"
        [attr.data-side]="_side()"
        [attr.data-align]="_align()"
        role="dialog"
        (animationend)="onAnimationEnd($event)"
        (mouseenter)="onPanelMouseEnter()"
        (mouseleave)="onPanelMouseLeave()"
      >
        @if (arrow()) {
          <div class="kui-popover-arrow"></div>
        }
        <ng-content />
      </div>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class KuiPopoverComponent implements OnDestroy {
  /** Preferred side of the anchor. Auto-flips to fit in viewport. */
  readonly placement = input<KuiPopoverPlacement>('bottom');

  /** Alignment along the anchor edge. */
  readonly align = input<KuiPopoverAlign>('center');

  /** Show the arrow caret pointing to the anchor. */
  readonly arrow = input(false);

  /** `click` — toggle on click, close on outside click / ESC. `hover` — open on mouseenter, close on mouseleave. */
  readonly triggerType = input<KuiPopoverTriggerType>('click');

  /** Delay before closing on mouseleave (ms). Allows mouse to travel from trigger to panel. */
  readonly hoverDelay = input(100);

  /** Gap in px between anchor and panel (arrow adds extra offset automatically). */
  readonly offset = input(8);

  /** Move focus to the first focusable element in the panel on open. */
  readonly trapFocus = input(false);

  /** Two-way binding for controlled open state. */
  readonly open = model(false);

  protected readonly _side = signal<KuiPopoverPlacement>('bottom');
  protected readonly _align = signal<KuiPopoverAlign>('center');
  protected readonly _closing = signal(false);

  private readonly tplRef = viewChild.required<TemplateRef<void>>('tpl');
  private readonly overlay = inject(Overlay);
  private readonly vcr = inject(ViewContainerRef);
  private readonly zone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);

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
      if (this._triggerEl === anchor) return;
      this._cleanup();
      this._detach();
      this._closing.set(false);
      this.open.set(false);
    }
    this._triggerEl = anchor;
    this._doOpen(anchor);
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
      this.zone.run(() => this.close());
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
      if (trigger instanceof HTMLElement) trigger.focus();
    }
  }

  private _doOpen(anchor: Element): void {
    const pref = this.placement();
    const aln = this.align();
    const gap = this.offset() + (this.arrow() ? 6 : 0);

    const posStrategy: FlexibleConnectedPositionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(anchor)
      .withPositions(this._buildPositions(pref, aln, gap))
      .withPush(false);

    this._overlayRef = this.overlay.create({
      positionStrategy: posStrategy,
      scrollStrategy: this.overlay.scrollStrategies.noop(),
    });

    this._side.set(pref);
    this._align.set(aln);

    this._overlayRef.attach(new TemplatePortal(this.tplRef(), this.vcr));
    this.open.set(true);
    this._closing.set(false);

    // Apply alignment transform immediately (CDK 22: never use overlayX/Y 'center'/'end'
    // because pane width/height = 0 before paint → wrong position. Transform compensates.)
    this._applyAlignTransform(pref, aln);

    const overlayEl = this._overlayRef.overlayElement;

    const posSub = posStrategy.positionChanges.subscribe((change) => {
      const side = this._sideFromPair(change.connectionPair);
      const align = this._alignFromPair(change.connectionPair, side);
      this._side.set(side);
      this._align.set(align);
      this._applyAlignTransform(side, align);
    });

    const escapeSub = this._overlayRef.keydownEvents().subscribe((e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        this.zone.run(() => this.close());
      }
    });

    const outsideHandler = (e: MouseEvent) => {
      if (!overlayEl.contains(e.target as Element)) {
        const isTrigger = this._triggerEl?.contains(e.target as Element);
        if (!isTrigger) this.zone.run(() => this.close());
      }
    };

    const scrollHandler = () => posStrategy.apply();

    this.zone.runOutsideAngular(() => {
      document.addEventListener('mousedown', outsideHandler, { capture: true });
      document.addEventListener('scroll', scrollHandler, { capture: true, passive: true });
    });

    this._openSubs = [
      posSub,
      escapeSub,
      { unsubscribe: () => document.removeEventListener('mousedown', outsideHandler, { capture: true }) },
      { unsubscribe: () => document.removeEventListener('scroll', scrollHandler, { capture: true }) },
    ];

    if (this.trapFocus()) {
      setTimeout(() => {
        const first = overlayEl.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        first?.focus();
      }, 50);
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

  private _makePosition(side: KuiPopoverPlacement, aln: KuiPopoverAlign, gap: number): ConnectedPosition {
    const h = aln === 'start' ? 'start' : aln === 'end' ? 'end' : 'center'; // originX for top/bottom
    const v = aln === 'start' ? 'top' : aln === 'end' ? 'bottom' : 'center'; // originY for left/right

    // CDK 22: never use overlayX 'center'/'end' or overlayY 'center'/'end' — pane size is 0
    // at positioning time → wrong position. Always use overlayX/Y 'start'; compensate via
    // CSS transform on the overlay pane element (_applyAlignTransform).
    // Use offsetX/Y sign to identify side in _sideFromPair.
    if (side === 'bottom') return { originX: h, originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: gap };
    if (side === 'top')    return { originX: h, originY: 'top',    overlayX: 'start', overlayY: 'bottom', offsetY: -gap };
    if (side === 'right')  return { originX: 'end',   originY: v, overlayX: 'start', overlayY: 'top', offsetX: gap };
    /* left */             return { originX: 'start', originY: v, overlayX: 'start', overlayY: 'top', offsetX: -gap };
  }

  private _applyAlignTransform(side: KuiPopoverPlacement, aln: KuiPopoverAlign): void {
    const pane = this._overlayRef?.overlayElement;
    if (!pane) return;
    const horiz = side === 'top' || side === 'bottom';
    const tx = horiz
      ? aln === 'center' ? 'translateX(-50%)' : aln === 'end' ? 'translateX(-100%)' : ''
      : side === 'left' ? 'translateX(-100%)' : '';
    const ty = !horiz
      ? aln === 'center' ? 'translateY(-50%)' : aln === 'end' ? 'translateY(-100%)' : ''
      : '';
    pane.style.transform = [tx, ty].filter(Boolean).join(' ');
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

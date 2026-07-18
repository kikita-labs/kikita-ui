import type { ConnectedPosition, OverlayRef } from '@angular/cdk/overlay';
import { Overlay } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { ViewportRuler } from '@angular/cdk/scrolling';
import { DOCUMENT } from '@angular/common';
import type { OnDestroy, TemplateRef } from '@angular/core';
import {
  Component,
  computed,
  contentChildren,
  DestroyRef,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
  ViewContainerRef,
  ViewEncapsulation,
} from '@angular/core';

import {
  clampPanelToAvailableSpace,
  createFloatingPositionStrategy,
  observeViewportResize,
  wireFloatingPanelDismissal,
} from '../../utils/kui-floating-panel.util';
import type { KuiMenuAlign } from './kui-menu-align.type';
import { KuiMenuItemDirective } from './kui-menu-item.directive';
import type { KuiMenuPlacement } from './kui-menu-placement.type';

let nextMenuId = 0;

/**
 * Floating action menu rendered in an Angular CDK overlay.
 *
 * Pair with `[kuiMenuFor]` on a native trigger and use `button[kuiMenuItem]`
 * or `a[kuiMenuItem]` for action items.
 */
@Component({
  selector: 'kui-menu',
  exportAs: 'kuiMenu',
  template: `
    <ng-template #menuTpl>
      <div [style.transform]="alignTransform()">
        <div
          [id]="panelId"
          class="kui-menu"
          [class.kui-menu--closing]="isClosing()"
          role="menu"
          [attr.aria-label]="ariaLabel()"
          (click)="onPanelClick($event)"
          (keydown)="onPanelKeydown($event)"
          (animationend)="onAnimationEnd($event)"
        >
          <ng-content />
        </div>
      </div>
    </ng-template>
  `,
  encapsulation: ViewEncapsulation.None,
})
export class KuiMenuComponent implements OnDestroy {
  /** Accessible name for the menu panel. */
  readonly ariaLabel = input('Actions');

  /**
   * Preferred side of the trigger the menu opens on. Auto-flips to the opposite side if there
   * isn't enough room. Defaults to `bottom`, matching every existing usage.
   */
  readonly placement = input<KuiMenuPlacement>('bottom');

  /**
   * Alignment along the trigger edge. For `top`/`bottom` placement this is horizontal
   * (`start` = left-aligned, `end` = right-aligned); for `left`/`right` it's vertical
   * (`start` = top-aligned, `end` = bottom-aligned).
   */
  readonly menuAlign = input<KuiMenuAlign>('start');

  /** Gap in px between the trigger and menu panel. */
  readonly offset = input(4);

  /** Minimum panel width. */
  readonly minWidth = input<string | null>(null);

  /** Whether the menu is currently open. */
  readonly isOpen = signal(false);

  /** Stable id used by trigger controls for `aria-controls`. */
  readonly panelId = `kui-menu-${nextMenuId++}`;

  protected readonly isClosing = signal(false);
  /** @internal Actual rendered side, tracked separately from `placement` since it can flip. */
  protected readonly renderedSide = signal<KuiMenuPlacement>('bottom');
  /** @internal Actual rendered align, tracked separately from `menuAlign` for the same reason. */
  protected readonly renderedAlign = signal<KuiMenuAlign>('start');

  // Wrapper carries the alignment transform; kept separate from the animated `.kui-menu` div
  // so CDK-applied transforms on the overlay pane don't cancel the gap offset -- same reasoning
  // as kui-popover's identical split (see kui-popover.component.ts).
  protected readonly alignTransform = computed(() => {
    const side = this.renderedSide();
    const align = this.renderedAlign();
    const horizontal = side === 'top' || side === 'bottom';
    const tx = horizontal
      ? align === 'end'
        ? 'translateX(-100%)'
        : ''
      : side === 'left'
        ? 'translateX(-100%)'
        : '';
    const ty = !horizontal ? (align === 'end' ? 'translateY(-100%)' : '') : '';
    return [tx, ty].filter(Boolean).join(' ') || null;
  });

  private readonly tplRef = viewChild.required<TemplateRef<void>>('menuTpl');
  private readonly items = contentChildren(KuiMenuItemDirective, { descendants: true });
  private readonly overlay = inject(Overlay);
  private readonly vcr = inject(ViewContainerRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly document = inject(DOCUMENT);
  private readonly viewportRuler = inject(ViewportRuler);

  private overlayRef: OverlayRef | null = null;
  private triggerEl: HTMLElement | null = null;
  private openSubs: { unsubscribe: () => void }[] = [];
  private restoreFocusOnClose = true;

  constructor() {
    this.destroyRef.onDestroy(() => this.cleanup());
  }

  /** Opens the menu for a trigger element. */
  openFor(anchor: HTMLElement, focus: 'first' | 'last' | 'none' = 'none'): void {
    if (this.isOpen() && this.triggerEl === anchor) {
      if (focus === 'first') this.focusFirstItem();
      if (focus === 'last') this.focusLastItem();
      return;
    }

    if (this.isOpen() || this.isClosing()) {
      this.cleanup();
      this.detachOverlay();
      this.isOpen.set(false);
      this.isClosing.set(false);
    }

    this.triggerEl = anchor;
    this.restoreFocusOnClose = true;
    this.doOpen(anchor);

    if (focus === 'first') this.focusFirstItem();
    if (focus === 'last') this.focusLastItem();
  }

  /** Toggles the menu for a trigger element. */
  toggleFor(anchor: HTMLElement): void {
    this.isOpen() ? this.close() : this.openFor(anchor);
  }

  /** Closes the menu. */
  close(restoreFocus = true): void {
    if (!this.isOpen() && !this.isClosing()) return;

    this.cleanup();
    this.restoreFocusOnClose = restoreFocus;
    this.isClosing.set(true);

    if (!this.overlayRef) {
      this.isClosing.set(false);
      this.isOpen.set(false);
      if (this.restoreFocusOnClose) this.triggerEl?.focus();
    }
  }

  protected onPanelClick(event: MouseEvent): void {
    const target = event.target as Element;
    const item = target.closest('.kui-menu-item:not(.kui-menu-item--disabled)');
    if (item) this.close();
  }

  protected onPanelKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.focusAdjacent(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.focusAdjacent(-1);
        break;
      case 'Home':
        event.preventDefault();
        this.focusFirstItem();
        break;
      case 'End':
        event.preventDefault();
        this.focusLastItem();
        break;
      case 'Escape':
        event.preventDefault();
        this.close();
        break;
      case 'Tab':
        this.close(false);
        break;
    }
  }

  protected onAnimationEnd(event: AnimationEvent): void {
    if (this.isClosing() && event.animationName === 'kui-menu-out') {
      this.isClosing.set(false);
      this.isOpen.set(false);
      this.detachOverlay();
      if (this.restoreFocusOnClose) this.triggerEl?.focus();
      this.restoreFocusOnClose = true;
    }
  }

  private doOpen(anchor: HTMLElement): void {
    const gap = this.offset();
    const pref = this.placement();
    const align = this.menuAlign();
    this.renderedSide.set(pref);
    this.renderedAlign.set(align);

    const positionStrategy = createFloatingPositionStrategy(
      this.overlay,
      anchor,
      this.buildPositions(pref, align, gap),
    );

    this.overlayRef = this.overlay.create({
      minWidth: this.minWidth() ?? undefined,
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.noop(),
    });

    this.overlayRef.attach(new TemplatePortal(this.tplRef(), this.vcr));

    const overlayEl = this.overlayRef.overlayElement;
    const clampPanel = (): void => {
      const panel = overlayEl.querySelector<HTMLElement>('.kui-menu');
      if (!panel) return;
      panel.style.maxHeight = 'calc(100vh - var(--kui-menu-viewport-margin, 32px))';
      clampPanelToAvailableSpace(panel, this.document.documentElement.clientHeight);
    };
    clampPanel();

    const posSub = positionStrategy.positionChanges.subscribe((change) => {
      const side = this.sideFromPair(change.connectionPair);
      this.renderedSide.set(side);
      this.renderedAlign.set(this.alignFromPair(change.connectionPair, side));
      clampPanel();
    });

    const resizeSub = observeViewportResize(this.viewportRuler, () => {
      positionStrategy.apply();
      clampPanel();
    });

    const dismissSub = wireFloatingPanelDismissal(
      this.document,
      this.overlayRef,
      positionStrategy,
      anchor,
      this.triggerEl,
      {
        outsideEventType: 'mousedown',
        onEscape: () => this.close(),
        onOutside: () => this.close(false),
        onAnchorOffscreen: () => this.close(false),
        onReposition: clampPanel,
      },
    );

    this.openSubs = [posSub, resizeSub, dismissSub];

    this.isOpen.set(true);
    this.isClosing.set(false);
  }

  /** Preferred position, then its opposite-side fallback -- same shape as `kui-popover`. */
  private buildPositions(
    pref: KuiMenuPlacement,
    align: KuiMenuAlign,
    gap: number,
  ): ConnectedPosition[] {
    const flip: Record<KuiMenuPlacement, KuiMenuPlacement> = {
      bottom: 'top',
      top: 'bottom',
      left: 'right',
      right: 'left',
    };
    return [this.makePosition(pref, align, gap), this.makePosition(flip[pref], align, gap)];
  }

  private makePosition(
    side: KuiMenuPlacement,
    align: KuiMenuAlign,
    gap: number,
  ): ConnectedPosition {
    const h = align === 'end' ? 'end' : 'start'; // originX for top/bottom
    const v = align === 'end' ? 'bottom' : 'top'; // originY for left/right

    // CDK 22: never use overlayX/Y 'center'/'end'; pane size is 0 before paint, giving the
    // wrong position. Always 'start'; alignment compensated by alignTransform on the wrapper.
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

  private sideFromPair(pair: ConnectedPosition): KuiMenuPlacement {
    // Side is encoded in offsetY vs offsetX sign (always set, never both).
    if (pair.offsetY != null) return pair.offsetY > 0 ? 'bottom' : 'top';
    return (pair.offsetX ?? 0) > 0 ? 'right' : 'left';
  }

  private alignFromPair(pair: ConnectedPosition, side: KuiMenuPlacement): KuiMenuAlign {
    if (side === 'top' || side === 'bottom') {
      return pair.originX === 'end' ? 'end' : 'start';
    }
    return pair.originY === 'bottom' ? 'end' : 'start';
  }

  private focusAdjacent(delta: 1 | -1): void {
    const items = this.focusableItems();
    if (!items.length) return;

    const active = this.document.activeElement;
    const index = items.findIndex((item) => item.getElement() === active);
    const nextIndex = index === -1 ? 0 : (index + delta + items.length) % items.length;
    items[nextIndex]?.focus();
  }

  private focusFirstItem(): void {
    this.focusableItems()[0]?.focus();
  }

  private focusLastItem(): void {
    const items = this.focusableItems();
    items[items.length - 1]?.focus();
  }

  private focusableItems(): readonly KuiMenuItemDirective[] {
    return this.items().filter((item) => item.isFocusable());
  }

  private cleanup(): void {
    this.openSubs.forEach((s) => s.unsubscribe());
    this.openSubs = [];
  }

  private detachOverlay(): void {
    this.overlayRef?.detach();
    this.overlayRef?.dispose();
    this.overlayRef = null;
  }

  ngOnDestroy(): void {
    this.cleanup();
    this.detachOverlay();
  }
}

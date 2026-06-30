import {
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  OnDestroy,
  TemplateRef,
  ViewContainerRef,
  ViewEncapsulation,
  contentChildren,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { FlexibleConnectedPositionStrategy, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';

import { KuiMenuAlign } from './kui-menu-align.type';
import { KuiMenuItemDirective } from './kui-menu-item.directive';

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

  /** Horizontal alignment relative to the trigger. */
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
  protected readonly alignTransform = computed(() =>
    this.menuAlign() === 'end' ? 'translateX(-100%)' : null,
  );

  private readonly tplRef = viewChild.required<TemplateRef<void>>('menuTpl');
  private readonly items = contentChildren(KuiMenuItemDirective, { descendants: true });
  private readonly overlay = inject(Overlay);
  private readonly vcr = inject(ViewContainerRef);
  private readonly zone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);

  private overlayRef: OverlayRef | null = null;
  private triggerEl: HTMLElement | null = null;
  private openSubs: { unsubscribe: () => void }[] = [];

  constructor() {
    this.destroyRef.onDestroy(() => this.cleanup());
  }

  /** Opens the menu for a trigger element. */
  openFor(anchor: HTMLElement, focus: 'first' | 'last' | 'none' = 'none'): void {
    if (this.isOpen() && this.triggerEl === anchor) return;

    if (this.isOpen() || this.isClosing()) {
      this.cleanup();
      this.detachOverlay();
      this.isOpen.set(false);
      this.isClosing.set(false);
    }

    this.triggerEl = anchor;
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
    this.isClosing.set(true);

    if (!this.overlayRef) {
      this.isClosing.set(false);
      this.isOpen.set(false);
      if (restoreFocus) this.triggerEl?.focus();
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
      this.triggerEl?.focus();
    }
  }

  private doOpen(anchor: HTMLElement): void {
    const gap = this.offset();
    const originX = this.menuAlign();
    const positionStrategy: FlexibleConnectedPositionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(anchor)
      .withPositions([
        { originX, originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: gap },
        { originX, originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -gap },
      ])
      .withPush(false);

    this.overlayRef = this.overlay.create({
      minWidth: this.minWidth() ?? undefined,
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.noop(),
    });

    this.overlayRef.attach(new TemplatePortal(this.tplRef(), this.vcr));

    const overlayEl = this.overlayRef.overlayElement;

    const escapeSub = this.overlayRef.keydownEvents().subscribe((e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        this.zone.run(() => this.close());
      }
    });

    const outsideHandler = (e: MouseEvent) => {
      if (overlayEl.contains(e.target as Element)) return;
      if (this.triggerEl?.contains(e.target as Element)) return;
      this.zone.run(() => this.close(false));
    };

    const scrollHandler = () => positionStrategy.apply();

    this.zone.runOutsideAngular(() => {
      document.addEventListener('mousedown', outsideHandler, { capture: true });
      document.addEventListener('scroll', scrollHandler, { capture: true, passive: true });
    });

    this.openSubs = [
      escapeSub,
      {
        unsubscribe: () =>
          document.removeEventListener('mousedown', outsideHandler, { capture: true }),
      },
      {
        unsubscribe: () => document.removeEventListener('scroll', scrollHandler, { capture: true }),
      },
    ];

    this.isOpen.set(true);
    this.isClosing.set(false);
  }

  private focusAdjacent(delta: 1 | -1): void {
    const items = this.focusableItems();
    if (!items.length) return;

    const active = document.activeElement;
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

import {
  Component,
  DestroyRef,
  inject,
  input,
  NgZone,
  OnDestroy,
  signal,
  TemplateRef,
  ViewContainerRef,
  ViewEncapsulation,
  viewChild,
} from '@angular/core';
import { FlexibleConnectedPositionStrategy, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';

let nextDropdownId = 0;

/**
 * Floating listbox panel rendered in an Angular CDK overlay.
 *
 * Place inside `<kui-field>` alongside `input[kuiSelect]`, or use standalone
 * with the `[anchor]` input.
 *
 * @example
 * ```html
 * <kui-field label="Role">
 *   <input kuiSelect [(value)]="role" />
 *   <kui-dropdown>
 *     <div kuiOption value="admin">Admin</div>
 *   </kui-dropdown>
 * </kui-field>
 * ```
 */
@Component({
  selector: 'kui-dropdown',
  template: `
    <ng-template #dropdownTpl>
      <div
        [id]="panelId"
        class="kui-dropdown"
        [class.kui-dropdown--closing]="isClosing()"
        [class.kui-dropdown--scroll]="maxHeight() != null"
        [style.max-height]="maxHeight()"
        role="listbox"
        (click)="handlePanelClick($event)"
        (animationend)="onAnimationEnd($event)"
      >
        <ng-content />
      </div>
    </ng-template>
  `,
  styles: ``,
  encapsulation: ViewEncapsulation.None,
})
export class KuiDropdownComponent implements OnDestroy {
  /** Maximum height of the panel before scrolling activates. */
  readonly maxHeight = input<string | null>('240px');

  /** Gap in px between the anchor and the panel edge. */
  readonly offset = input(4);

  /** Whether the panel is currently open. */
  readonly isOpen = signal(false);

  /** Stable id used by trigger controls for `aria-controls`. */
  readonly panelId = `kui-dropdown-${nextDropdownId++}`;

  protected readonly isClosing = signal(false);

  private readonly tplRef = viewChild.required<TemplateRef<void>>('dropdownTpl');
  private readonly overlay = inject(Overlay);
  private readonly vcr = inject(ViewContainerRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly zone = inject(NgZone);

  private _anchorEl: HTMLElement | null = null;
  private overlayRef: OverlayRef | null = null;
  private openSubs: { unsubscribe: () => void }[] = [];

  constructor() {
    this.destroyRef.onDestroy(() => this._cleanup());
  }

  /**
   * Called by KuiFieldComponent to wire up the anchor element.
   * @param positionEl element used for overlay positioning and minWidth (e.g. the control slot)
   * @param _outsideClickIgnoreEl reserved — not used with backdrop strategy (kept for API compat)
   */
  setAnchor(positionEl: HTMLElement, _outsideClickIgnoreEl?: HTMLElement): void {
    this._anchorEl = positionEl;
  }

  /** Returns the rendered panel element for keyboard navigation queries. */
  getPanel(): HTMLElement | null {
    return this.overlayRef?.overlayElement.querySelector<HTMLElement>('.kui-dropdown') ?? null;
  }

  /** Returns the rendered panel id for trigger ARIA wiring. */
  getPanelId(): string {
    return this.panelId;
  }

  toggle(): void {
    this.isOpen() ? this.close() : this.open();
  }

  open(): void {
    const anchor = this._anchorEl;
    if (!anchor || this.isOpen()) return;

    const gap = this.offset();
    const positionStrategy: FlexibleConnectedPositionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(anchor)
      .withPositions([
        { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: gap },
        { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -gap },
      ])
      .withPush(false);

    this.overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.noop(),
      width: anchor.offsetWidth,
    });

    this.overlayRef.attach(new TemplatePortal(this.tplRef(), this.vcr));

    const overlayEl = this.overlayRef.overlayElement;

    const posSub = positionStrategy.positionChanges.subscribe((change) => {
      const isFlipped =
        change.connectionPair.originY === 'top' && change.connectionPair.overlayY === 'bottom';
      const div = overlayEl.querySelector<HTMLElement>('.kui-dropdown');
      if (div) {
        div.setAttribute('data-placement', isFlipped ? 'top' : 'bottom');
      }
    });

    const escapeSub = this.overlayRef.keydownEvents().subscribe((e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        this.zone.run(() => this.close());
      }
    });

    // CDK 22 popover: backdrop fires only within bounding-box area (not full viewport).
    // For above-positioned panels the click target below anchor misses the backdrop.
    // document capture fires before any element handler regardless of top-layer.
    const outsideHandler = (e: MouseEvent) => {
      if (!overlayEl.contains(e.target as Element)) {
        this.zone.run(() => this.close());
      }
    };

    // CDK reposition() only tracks CdkScrollable-registered containers.
    // Capture scroll on document covers all scrollable ancestors including unregistered ones.
    const scrollHandler = () => positionStrategy.apply();

    this.zone.runOutsideAngular(() => {
      document.addEventListener('click', outsideHandler, { capture: true });
      document.addEventListener('scroll', scrollHandler, { capture: true, passive: true });
    });
    const outsideSub = {
      unsubscribe: () => document.removeEventListener('click', outsideHandler, { capture: true }),
    };
    const scrollSub = {
      unsubscribe: () => document.removeEventListener('scroll', scrollHandler, { capture: true }),
    };

    this.openSubs = [posSub, escapeSub, outsideSub, scrollSub];
    this.isOpen.set(true);
    this.isClosing.set(false);
  }

  close(): void {
    if (!this.isOpen() && !this.isClosing()) return;
    this._cleanup();
    this.isClosing.set(true);
  }

  private _cleanup(): void {
    this.openSubs.forEach((s) => s.unsubscribe());
    this.openSubs = [];
  }

  private _detachOverlay(): void {
    this.overlayRef?.detach();
    this.overlayRef?.dispose();
    this.overlayRef = null;
  }

  protected handlePanelClick(e: MouseEvent): void {
    const target = e.target as Element;
    if (target.closest('.kui-listbox-option:not(.kui-listbox-option--disabled)')) {
      this.close();
    }
  }

  protected onAnimationEnd(event: AnimationEvent): void {
    if (this.isClosing() && event.animationName === 'kui-dropdown-out') {
      this.isOpen.set(false);
      this.isClosing.set(false);
      this._detachOverlay();
    }
  }

  ngOnDestroy(): void {
    this._cleanup();
    this._detachOverlay();
  }
}

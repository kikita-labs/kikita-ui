import {
  ChangeDetectionStrategy,
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class KuiDropdownComponent implements OnDestroy {
  /** Maximum height of the panel before scrolling activates. */
  readonly maxHeight = input<string | null>('240px');

  /** Gap in px between the anchor and the panel edge. */
  readonly offset = input(4);

  /** Whether the panel is currently open. */
  readonly isOpen = signal(false);

  protected readonly isClosing = signal(false);

  private readonly tplRef = viewChild.required<TemplateRef<void>>('dropdownTpl');
  private readonly overlay = inject(Overlay);
  private readonly vcr = inject(ViewContainerRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly zone = inject(NgZone);

  private _anchorEl: HTMLElement | null = null;
  private _outsideClickIgnoreEl: HTMLElement | null = null;
  private overlayRef: OverlayRef | null = null;
  private openSubs: { unsubscribe: () => void }[] = [];
  private outsideTimeoutId: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.destroyRef.onDestroy(() => this._cleanup());
  }

  /**
   * Called by KuiFieldComponent to wire up the anchor element.
   * @param positionEl element used for overlay positioning and minWidth (e.g. the control slot)
   * @param outsideClickIgnoreEl element whose subtree should NOT trigger close on outside-click
   *   (e.g. the full kui-field host, so clicking the label doesn't close-then-reopen)
   */
  setAnchor(positionEl: HTMLElement, outsideClickIgnoreEl?: HTMLElement): void {
    this._anchorEl = positionEl;
    this._outsideClickIgnoreEl = outsideClickIgnoreEl ?? positionEl;
  }

  /** Returns the rendered panel element for keyboard navigation queries. */
  getPanel(): HTMLElement | null {
    return this.overlayRef?.overlayElement.querySelector<HTMLElement>('.kui-dropdown') ?? null;
  }

  toggle(): void {
    this.isOpen() ? this.close() : this.open();
  }

  open(): void {
    const anchor = this._anchorEl;
    if (!anchor || this.isOpen()) return;

    const positionStrategy: FlexibleConnectedPositionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(anchor)
      .withPositions([
        { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' },
        { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom' },
      ])
      .withPush(false)
      .withDefaultOffsetY(this.offset());

    this.overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      minWidth: anchor.offsetWidth,
      hasBackdrop: false,
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

    this.openSubs = [posSub, escapeSub];

    // Defer outside-pointerdown listener one tick so the triggering event doesn't close immediately.
    // CDK 22 outsidePointerEvents() is unreliable with popover/top-layer; use document directly.
    this.outsideTimeoutId = this.zone.runOutsideAngular(() =>
      setTimeout(() => {
        const ignoreEl = this._outsideClickIgnoreEl ?? anchor;
        const onPointerDown = (e: PointerEvent) => {
          const overlayEl = this.overlayRef?.overlayElement;
          if (!ignoreEl.contains(e.target as Node) && !overlayEl?.contains(e.target as Node)) {
            this.zone.run(() => this.close());
          }
        };
        document.addEventListener('pointerdown', onPointerDown, { capture: true });
        this.openSubs.push({ unsubscribe: () => document.removeEventListener('pointerdown', onPointerDown, { capture: true }) });
      }, 0),
    );

    this.isOpen.set(true);
    this.isClosing.set(false);
  }

  close(): void {
    if (!this.isOpen() && !this.isClosing()) return;
    this._cleanup();
    this.isClosing.set(true);
  }

  private _cleanup(): void {
    if (this.outsideTimeoutId !== null) {
      clearTimeout(this.outsideTimeoutId);
      this.outsideTimeoutId = null;
    }
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

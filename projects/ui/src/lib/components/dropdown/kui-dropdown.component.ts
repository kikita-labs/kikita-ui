import {
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  model,
  OnDestroy,
  signal,
  TemplateRef,
  ViewContainerRef,
  ViewEncapsulation,
  viewChild,
} from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { ViewportRuler } from '@angular/cdk/scrolling';
import { DOCUMENT } from '@angular/common';

import {
  clampPanelToAvailableSpace,
  createFloatingPositionStrategy,
  observeViewportResize,
  wireFloatingPanelDismissal,
} from '../../utils/kui-floating-panel.util';

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
        class="kui-dropdown kui-dropdown--scroll"
        [class.kui-dropdown--closing]="isClosing()"
        [attr.role]="panelRole()"
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
  /**
   * Preferred maximum height of the panel before scrolling activates. This is always
   * additionally clamped to the viewport (`calc(100vh - <margin>)`) so the panel can never
   * render taller than the screen with no way to reach its overflowing content — see
   * `--kui-dropdown-viewport-margin`.
   */
  readonly maxHeight = input<string | null>('240px');

  /**
   * @internal Actual max-height applied to the panel: `maxHeight`, clamped to the viewport.
   * Applied imperatively in `open()` (not as a template binding) because it's a starting point
   * for `clampPanelToAvailableSpace`, which further shrinks it to whatever room the panel
   * actually rendered into -- a template binding would fight that direct style write.
   */
  protected readonly effectiveMaxHeight = computed(() => {
    const viewportCap = 'calc(100vh - var(--kui-dropdown-viewport-margin, 32px))';
    const intrinsic = this.maxHeight();
    return intrinsic ? `min(${intrinsic}, ${viewportCap})` : viewportCap;
  });

  /** Gap in px between the anchor and the panel edge. */
  readonly offset = input(4);

  /** Close the panel when a selectable option is clicked. */
  readonly closeOnSelect = model(true);

  /**
   * ARIA role rendered on the panel. Defaults to `listbox` for `kuiSelect`/`kuiCombobox`.
   * Set to `dialog` (or `null` to omit the role entirely) when projecting non-listbox
   * content, e.g. `kui-calendar` inside a date picker.
   */
  readonly panelRole = input<'listbox' | 'dialog' | 'grid' | null>('listbox');

  /**
   * Panel width strategy.
   * - `anchor` (default): matches `kuiSelect`/`kuiCombobox` listboxes to the trigger's width.
   * - `content`: at least as wide as the trigger, but can grow with content — e.g. `kui-calendar`
   *   inside a date picker, so it isn't clipped to a narrower field.
   * - `auto`: sized purely by content, completely ignoring the trigger's width — for panels
   *   that are their own small self-contained widget regardless of how wide the trigger is
   *   (e.g. `kui-color-input`'s picker).
   */
  readonly panelWidth = input<'anchor' | 'content' | 'auto'>('anchor');

  /**
   * Explicit panel width (any valid CSS width, e.g. `'320px'`, `'20rem'`). When set, this
   * overrides `panelWidth` entirely — the panel is exactly this wide regardless of the
   * trigger's width or the panel's own content. For consumers that want a dropdown wider or
   * narrower than its trigger (`kuiSelect`/`kuiCombobox` otherwise always match the trigger via
   * `panelWidth="anchor"`) without having to fight the trigger's own width.
   */
  readonly width = input<string | null>(null);

  /** Whether the panel is currently open. */
  readonly isOpen = signal(false);

  /** Stable id used by trigger controls for `aria-controls`. */
  readonly panelId = `kui-dropdown-${nextDropdownId++}`;

  protected readonly isClosing = signal(false);

  private readonly tplRef = viewChild.required<TemplateRef<void>>('dropdownTpl');
  private readonly overlay = inject(Overlay);
  private readonly vcr = inject(ViewContainerRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly document = inject(DOCUMENT);
  private readonly viewportRuler = inject(ViewportRuler);

  private _anchorEl: HTMLElement | null = null;
  private _outsideClickIgnoreEl: HTMLElement | null = null;
  private overlayRef: OverlayRef | null = null;
  private openSubs: { unsubscribe: () => void }[] = [];

  constructor() {
    this.destroyRef.onDestroy(() => this._cleanup());
  }

  /**
   * Called by KuiFieldComponent to wire up the anchor element.
   * @param positionEl element used for overlay positioning and minWidth (e.g. the control slot)
   * @param outsideClickIgnoreEl element that should not close the overlay on document capture click
   */
  setAnchor(positionEl: HTMLElement, outsideClickIgnoreEl?: HTMLElement): void {
    this._anchorEl = positionEl;
    this._outsideClickIgnoreEl = outsideClickIgnoreEl ?? null;
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
    const positionStrategy = createFloatingPositionStrategy(this.overlay, anchor, [
      { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: gap },
      { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -gap },
    ]);

    const explicitWidth = this.width();

    this.overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.noop(),
      ...(explicitWidth
        ? { width: explicitWidth }
        : this.panelWidth() === 'anchor'
          ? { width: anchor.offsetWidth }
          : this.panelWidth() === 'content'
            ? { minWidth: anchor.offsetWidth }
            : {}),
    });

    this.overlayRef.attach(new TemplatePortal(this.tplRef(), this.vcr));

    const overlayEl = this.overlayRef.overlayElement;
    this.bindAccessibleName(overlayEl, anchor);

    const clampPanel = (): void => {
      const panel = overlayEl.querySelector<HTMLElement>('.kui-dropdown');
      if (!panel) return;
      panel.style.maxHeight = this.effectiveMaxHeight();
      clampPanelToAvailableSpace(panel, this.document.documentElement.clientHeight);
    };
    clampPanel();

    const posSub = positionStrategy.positionChanges.subscribe((change) => {
      const isFlipped =
        change.connectionPair.originY === 'top' && change.connectionPair.overlayY === 'bottom';
      const div = overlayEl.querySelector<HTMLElement>('.kui-dropdown');
      if (div) {
        div.setAttribute('data-placement', isFlipped ? 'top' : 'bottom');
      }
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
      this._outsideClickIgnoreEl,
      {
        watchFocusin: true,
        onEscape: () => this.close(),
        onOutside: () => this.close(),
        onAnchorOffscreen: () => this.close(),
        onReposition: clampPanel,
      },
    );

    this.openSubs = [posSub, resizeSub, dismissSub];
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

  /**
   * `role="listbox"`/`"grid"` panels need their own accessible name (axe `aria-input-field-name`).
   * Standalone triggers wired via `[kuiDropdownFor]` (e.g. an icon or text button) have no other
   * association with the panel, so borrow the trigger's own accessible name. Skipped for form
   * controls (e.g. `input[kuiSelect]`) -- those are labelled through `kui-field`'s own `<label>`
   * instead, and have no useful `textContent` to borrow from.
   */
  private bindAccessibleName(overlayEl: HTMLElement, anchor: HTMLElement): void {
    const role = this.panelRole();
    if (role !== 'listbox' && role !== 'grid') return;

    const panel = overlayEl.querySelector<HTMLElement>('.kui-dropdown');
    if (!panel || panel.hasAttribute('aria-label') || panel.hasAttribute('aria-labelledby')) {
      return;
    }
    if (anchor.tagName === 'INPUT' || anchor.tagName === 'TEXTAREA') return;

    const name = anchor.getAttribute('aria-label') ?? anchor.textContent?.trim();
    if (name) panel.setAttribute('aria-label', name);
  }

  private _detachOverlay(): void {
    this.overlayRef?.detach();
    this.overlayRef?.dispose();
    this.overlayRef = null;
  }

  protected handlePanelClick(e: MouseEvent): void {
    const target = e.target as Element;
    if (
      this.closeOnSelect() &&
      target.closest('.kui-listbox-option:not(.kui-listbox-option--disabled)')
    ) {
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

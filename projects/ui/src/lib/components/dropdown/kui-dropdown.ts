import type { OverlayRef } from '@angular/cdk/overlay';
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
  effect,
  inject,
  input,
  model,
  signal,
  viewChild,
  ViewContainerRef,
  ViewEncapsulation,
} from '@angular/core';

import { KuiDefaults } from '../../providers/kui-defaults';
import {
  clampPanelToAvailableSpace,
  createFloatingPositionStrategy,
  observeViewportResize,
  wireFloatingPanelDismissal,
} from '../../utils/kui-floating-panel.util';
import { kuiNextId } from '../../utils/kui-id.util';
import {
  optionalBooleanAttribute,
  optionalOverlayOffsetAttribute,
} from '../../utils/kui-input-transform.util';
import { KUI_FIELD_DROPDOWN, registerKuiFieldPart } from '../field/kui-field-host.token';
import { KUI_OPTION_CONTEXT } from '../field/kui-option-context.token';

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
  templateUrl: './kui-dropdown.html',
  styles: ``,
  encapsulation: ViewEncapsulation.None,
})
/** Renders an anchored selectable dropdown panel. */
export class KuiDropdown implements OnDestroy {
  private readonly dropdownDefaults = inject(KuiDefaults).get('dropdown');

  /**
   * Preferred maximum height of the panel before scrolling activates. This is always
   * additionally clamped to the viewport (`calc(100vh - <margin>)`) so the panel can never
   * render taller than the screen with no way to reach its overflowing content — see
   * `--kui-dropdown-viewport-margin`. Defaults to `defaults.dropdown.maxHeight`, then `240px`.
   */
  readonly maxHeight = input<string | null | undefined>();

  /**
   * @internal Actual max-height applied to the panel: `maxHeight`, clamped to the viewport.
   * Applied imperatively in `open()` (not as a template binding) because it's a starting point
   * for `clampPanelToAvailableSpace`, which further shrinks it to whatever room the panel
   * actually rendered into -- a template binding would fight that direct style write.
   */
  protected readonly effectiveMaxHeight = computed(() => {
    const viewportCap =
      'calc(100vh - var(--kui-dropdown-viewport-margin, var(--_kui-dropdown-viewport-margin, 32px)))';
    const local = this.maxHeight();
    const intrinsic = local !== undefined ? local : (this.dropdownDefaults()?.maxHeight ?? '240px');
    return intrinsic ? `min(${intrinsic}, ${viewportCap})` : viewportCap;
  });

  private readonly effectiveOffset = computed(
    () => this.offset() ?? this.dropdownDefaults()?.offset ?? 4,
  );
  private readonly effectiveCloseOnSelect = computed(
    () => this.closeOnSelect() ?? this.dropdownDefaults()?.closeOnSelect ?? true,
  );
  private readonly effectivePanelWidth = computed(
    () => this.panelWidth() ?? this.dropdownDefaults()?.panelWidth ?? 'anchor',
  );

  /** Gap in px between the anchor and the panel edge. Defaults to `defaults.dropdown.offset`, then `4`. */
  readonly offset = input<number | undefined, unknown>(undefined, {
    transform: optionalOverlayOffsetAttribute,
  });

  /** Close the panel when a selectable option is clicked. Defaults to `defaults.dropdown.closeOnSelect`, then `true`. */
  readonly closeOnSelect = input<boolean | undefined, unknown>(undefined, {
    transform: optionalBooleanAttribute,
  });

  /**
   * Controlled open state exposed as the `open` model input.
   *
   * The imperative `open()`, `close()`, and `toggle()` methods remain available and keep this
   * model synchronized. The separate field name is required because `open()` is an existing
   * public method.
   */
  readonly openState = model(false, { alias: 'open' });

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
  readonly panelWidth = input<'anchor' | 'content' | 'auto' | undefined>();

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
  readonly panelId = kuiNextId('kui-dropdown');

  protected readonly isClosing = signal(false);

  private readonly tplRef = viewChild.required<TemplateRef<void>>('dropdownTpl');
  private readonly overlay = inject(Overlay);
  private readonly vcr = inject(ViewContainerRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly document = inject(DOCUMENT);
  private readonly viewportRuler = inject(ViewportRuler);
  private readonly optionContext = inject(KUI_OPTION_CONTEXT, { optional: true });

  private _anchorEl: HTMLElement | null = null;
  private _outsideClickIgnoreEl: HTMLElement | null = null;
  private _focusReturnTarget: (() => HTMLElement | null) | null = null;
  private overlayRef: OverlayRef | null = null;
  private openSubs: { unsubscribe: () => void }[] = [];

  constructor() {
    registerKuiFieldPart(KUI_FIELD_DROPDOWN, this);

    effect(() => {
      const requestedOpen = this.openState();
      const renderedOpen = this.isOpen();
      const closing = this.isClosing();

      if (requestedOpen && !renderedOpen && !closing) {
        this.open();
      } else if (!requestedOpen && renderedOpen && !closing) {
        this.close();
      }
    });

    this.destroyRef.onDestroy(() => this._cleanup());
  }

  /**
   * Called by KuiField to wire up the anchor element.
   * @param positionEl element used for overlay positioning and minWidth (e.g. the control slot)
   * @param outsideClickIgnoreEl element that should not close the overlay on document capture click
   * @param focusReturnTarget resolves the element that receives focus when Escape closes a panel
   * that held focus; defaults to `positionEl`, which only works when that element is focusable
   */
  setAnchor(
    positionEl: HTMLElement,
    outsideClickIgnoreEl?: HTMLElement,
    focusReturnTarget?: () => HTMLElement | null,
  ): void {
    this._anchorEl = positionEl;
    this._outsideClickIgnoreEl = outsideClickIgnoreEl ?? null;
    this._focusReturnTarget = focusReturnTarget ?? null;

    if (this.openState() && !this.isOpen()) this.open();
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

    const gap = this.effectiveOffset();
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
        : this.effectivePanelWidth() === 'anchor'
          ? { width: anchor.offsetWidth }
          : this.effectivePanelWidth() === 'content'
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
        onEscape: () => this.closeRestoringFocus(),
        onOutside: () => this.close(),
        onAnchorOffscreen: () => this.close(),
        onReposition: clampPanel,
      },
    );

    this.openSubs = [posSub, resizeSub, dismissSub];
    this.openState.set(true);
    this.isOpen.set(true);
    this.isClosing.set(false);
  }

  close(): void {
    if (!this.isOpen() && !this.isClosing()) return;
    this.openState.set(false);
    this._cleanup();
    this.isClosing.set(true);
  }

  /**
   * Closes the panel after the user finished with it (Escape, or a value chosen inside it). Closing
   * removes the panel, which drops focus to <body> when it was inside the panel (a Time Picker unit
   * column, or an option chosen with the keyboard), so focus goes back to the control and keyboard
   * users keep their place. A panel opened from the control never took focus, so nothing moves.
   * An outside click or an anchor scrolled away use plain `close()`: focus must stay where the user
   * put it, and moving it would also scroll the page back to the control.
   */
  private closeRestoringFocus(): void {
    const panel = this.overlayRef?.overlayElement;
    const focusWasInPanel = !!panel && panel.contains(this.document.activeElement);
    this.close();
    if (focusWasInPanel) (this._focusReturnTarget?.() ?? this._anchorEl)?.focus();
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
      (this.optionContext?.shouldCloseOnSelect?.() ?? this.effectiveCloseOnSelect()) &&
      target.closest('.kui-listbox-option:not(.kui-listbox-option--disabled)')
    ) {
      this.closeRestoringFocus();
    }
  }

  /** A projected single-date picker reported a pick; the panel closes unless `closeOnSelect` is off. */
  protected handlePicked(): void {
    if (this.effectiveCloseOnSelect()) this.closeRestoringFocus();
  }

  protected handlePanelKeydown(e: KeyboardEvent): void {
    if (e.key !== 'Enter' && e.key !== ' ') return;

    const target = e.target as HTMLElement | null;
    // The same rule as a click: a multiple Select keeps the panel open, whatever `closeOnSelect` says.
    if (
      (this.optionContext?.shouldCloseOnSelect?.() ?? this.effectiveCloseOnSelect()) &&
      target?.closest('.kui-listbox-option:not(.kui-listbox-option--disabled)')
    ) {
      this.closeRestoringFocus();
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

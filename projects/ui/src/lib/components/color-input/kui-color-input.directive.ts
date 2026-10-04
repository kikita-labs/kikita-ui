import { Overlay } from '@angular/cdk/overlay';
import { isPlatformBrowser } from '@angular/common';
import type { AfterViewInit, ComponentRef, DoCheck, OnDestroy } from '@angular/core';
import {
  afterNextRender,
  booleanAttribute,
  computed,
  Directive,
  effect,
  ElementRef,
  inject,
  Injector,
  input,
  PLATFORM_ID,
  Renderer2,
  signal,
  untracked,
  ViewContainerRef,
} from '@angular/core';

import { injectKuiMessages } from '../../i18n/inject-kui-messages';
import type { KuiColorInputMessages } from '../../i18n/kui-messages.interface';
import { KuiDefaults } from '../../providers/kui-defaults.service';
import { injectKuiRootSizeDefault } from '../../providers/kui-defaults.util';
import type { KuiSize } from '../../types';
import {
  createKuiControlSize,
  createKuiFieldWiring,
} from '../../utils/kui-field-control-wiring.util';
import { kuiIdFactory } from '../../utils/kui-id.util';
import { KuiDropdown } from '../dropdown/kui-dropdown.component';
import { KUI_FIELD } from '../field/kui-field-host.token';
import { injectKuiGlyph } from '../icon/inject-kui-glyph';
import { KUI_GLYPH_CHEVRON_DOWN } from '../icon/kui-chrome-glyphs';
import { createKuiGlyphElement } from '../icon/kui-glyph-dom.util';
import type { KuiIconGlyph } from '../icon/kui-icon-glyph.type';
import type { KuiTooltipOverlayHandle } from '../tooltip/kui-tooltip-overlay.util';
import { createKuiTooltipOverlay } from '../tooltip/kui-tooltip-overlay.util';
import { hexToParsed, type KuiParsedColor, parseColor } from './kui-color-input-color.util';
import { KuiColorPickerPanel } from './kui-color-picker-panel';

/**
 * Applies Kikita UI color-input styling to a native text input.
 *
 * The native input remains the form value source. It accepts hex colors and OKLCH values for
 * Kikita theme seed editing, while the swatch/chevron open a Kikita picker popover.
 * The server keeps the native input in its template position; picker controls are added in the
 * browser so hydration sees the same DOM shape on both platforms.
 *
 * @example
 * ```html
 * <kui-field label="Primary seed" hint="Hex or oklch().">
 *   <input kuiColorInput value="#5b4fe0" />
 * </kui-field>
 * ```
 */
@Directive({
  selector: 'input[kuiColorInput]',
  host: {
    class: 'kui-color-input__control kui-input',
    spellcheck: 'false',
    autocomplete: 'off',
    autocorrect: 'off',
    autocapitalize: 'off',
    '[attr.id]': 'inputId()',
    '[attr.aria-describedby]': 'describedBy()',
    '[attr.aria-required]': 'ariaRequired()',
    '[attr.aria-invalid]': 'effectiveInvalid() ? "true" : null',
  },
})
export class KuiColorInput implements AfterViewInit, DoCheck, OnDestroy {
  private readonly nextId = kuiIdFactory();

  /** Control height matched to Kikita UI size tokens. Defaults to `defaults.colorInput.size`, then the parent field, then the global `defaults.size`, then `'md'`. */
  readonly size = input<KuiSize | undefined>();

  /** Applies error border. Also inherited from a parent `kui-field` with an error. */
  readonly invalidInput = input(false, { alias: 'invalid', transform: booleanAttribute });

  /** Id override for the native input. Falls back to the parent `kui-field` control id. */
  readonly id = input<string | undefined>();

  /** Accessible label for the swatch button. Defaults to the `colorInput.openPicker` message. */
  readonly swatchLabel = input<string | undefined>();

  /** Per-instance text overrides; they win over the scoped and root messages. */
  readonly messages = input<Partial<KuiColorInputMessages> | undefined>();

  private readonly t = injectKuiMessages('colorInput', () => this.messages());

  private readonly effectiveSwatchLabel = computed(() => this.swatchLabel() ?? this.t().openPicker);

  private readonly el = inject<ElementRef<HTMLInputElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly overlay = inject(Overlay);
  private readonly vcr = inject(ViewContainerRef);
  private readonly injector = inject(Injector);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly field = inject(KUI_FIELD, { optional: true, host: true });
  private readonly colorInputDefaults = inject(KuiDefaults).get('colorInput');
  private readonly rootDefaultSize = injectKuiRootSizeDefault();
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private readonly wiring = createKuiFieldWiring({
    field: this.field,
    id: this.id,
    invalid: this.invalidInput,
  });

  protected readonly inputId = this.wiring.hostId;
  protected readonly describedBy = this.wiring.describedBy;
  protected readonly ariaRequired = this.wiring.ariaRequired;

  /** The field-derived invalid state, plus the control's own parse-error state (`invalidValue`). */
  protected readonly effectiveInvalid = computed(
    () => this.wiring.invalid() || this.invalidValue(),
  );

  protected readonly effectiveSize = createKuiControlSize({
    field: this.field,
    local: this.size,
    keyDefault: computed(() => this.colorInputDefaults()?.size),
    root: this.rootDefaultSize,
  });

  private containerEl!: HTMLElement;
  private swatchBtn!: HTMLButtonElement;
  private swatchFill!: HTMLElement;
  private chevronBtn!: HTMLButtonElement;
  private chevronSvg: SVGElement | null = null;
  private renderedChevronGlyph: KuiIconGlyph | null = null;

  private readonly chevronGlyph = injectKuiGlyph({
    role: 'pickerChevron',
    slot: () => this.colorInputDefaults()?.chevronIcon,
    fallback: KUI_GLYPH_CHEVRON_DOWN,
  });
  private dropdownRef: ComponentRef<KuiDropdown> | null = null;
  private panelEl: HTMLElement | null = null;
  private picker: KuiColorPickerPanel | null = null;
  private focusReturnTarget: HTMLElement | null = null;
  private readonly invalidValue = signal(false);
  private readonly open = signal(false);
  private lastValid = hexToParsed('#5b4fe0')!;
  private lastState = '';
  private swatchTooltipText = '';
  private tooltipOverlay: KuiTooltipOverlayHandle | null = null;
  private tooltipAnchor: HTMLElement | null = null;
  private readonly unlisten: (() => void)[] = [];

  constructor() {
    effect(() => {
      const glyph = this.chevronGlyph();

      untracked(() => this.renderChevronGlyph(glyph));
    });

    // ngDoCheck only runs when the parent view is checked, so a size change that comes from a
    // signal (for example a runtime defaults update) must also resync the generated container.
    effect(() => {
      this.effectiveSize();
      if (this.containerEl) untracked(() => this.syncState());
    });
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;

    this.buildDom();
    this.syncState();
  }

  ngDoCheck(): void {
    if (!this.containerEl) return;

    const native = this.el.nativeElement;
    const state = [
      native.value,
      native.disabled,
      native.readOnly,
      this.effectiveSize(),
      this.invalidInput(),
      this.field?.invalid() ?? false,
      this.effectiveSwatchLabel(),
      this.t().openPicker,
      this.open(),
    ].join('|');

    if (state === this.lastState) return;
    this.lastState = state;
    this.syncState();
  }

  ngOnDestroy(): void {
    this.unlisten.forEach((fn) => fn());
    this.unlisten.length = 0;
    this.picker?.destroy();
    this.hideTooltip();
    this.dropdownRef?.destroy();
    this.dropdownRef = null;
    this.teardownDom();
  }

  /** Draws the resolved chevron glyph into the toggle button, replacing the previous one. */
  private renderChevronGlyph(glyph: KuiIconGlyph): void {
    if (!this.chevronBtn || (this.chevronSvg && this.renderedChevronGlyph === glyph)) {
      return;
    }

    if (this.chevronSvg) {
      this.renderer.removeChild(this.chevronBtn, this.chevronSvg);
    }

    this.chevronSvg = createKuiGlyphElement(this.renderer, glyph, { size: 14, strokeWidth: 2 });
    this.renderedChevronGlyph = glyph;
    this.renderer.appendChild(this.chevronBtn, this.chevronSvg);
  }

  private buildDom(): void {
    const native = this.el.nativeElement;
    const parent = native.parentNode;
    if (!parent) return;

    this.containerEl = this.renderer.createElement('div');
    this.renderer.addClass(this.containerEl, 'kui-color-input');
    this.renderer.addClass(this.containerEl, 'kui-input-group');
    this.renderer.insertBefore(parent, this.containerEl, native);

    this.swatchBtn = this.renderer.createElement('button');
    this.renderer.addClass(this.swatchBtn, 'kui-color-input__swatch');
    this.renderer.setAttribute(this.swatchBtn, 'type', 'button');

    this.swatchFill = this.renderer.createElement('span');
    this.renderer.addClass(this.swatchFill, 'kui-color-input__swatch-fill');
    this.renderer.appendChild(this.swatchBtn, this.swatchFill);

    this.chevronBtn = this.renderer.createElement('button');
    this.renderer.addClass(this.chevronBtn, 'kui-field-action');
    this.renderer.addClass(this.chevronBtn, 'kui-color-input__trigger');
    this.renderer.setAttribute(this.chevronBtn, 'type', 'button');
    this.renderer.setAttribute(this.chevronBtn, 'aria-label', this.t().openPicker);
    this.renderChevronGlyph(untracked(this.chevronGlyph));

    this.renderer.appendChild(this.containerEl, this.swatchBtn);
    this.renderer.appendChild(this.containerEl, native);
    this.renderer.appendChild(this.containerEl, this.chevronBtn);

    this.unlisten.push(
      this.renderer.listen(native, 'input', () => this.syncState()),
      this.renderer.listen(native, 'change', () => this.syncState()),
      this.renderer.listen(this.containerEl, 'click', (event: MouseEvent) =>
        this.handleFieldClick(event),
      ),
      this.renderer.listen(this.swatchBtn, 'click', (event: MouseEvent) =>
        this.togglePicker(this.swatchBtn, event),
      ),
      this.renderer.listen(this.chevronBtn, 'click', (event: MouseEvent) =>
        this.togglePicker(this.chevronBtn, event),
      ),
      this.renderer.listen(this.swatchBtn, 'mouseenter', () =>
        this.showTooltip(this.swatchBtn, this.swatchTooltipText),
      ),
      this.renderer.listen(this.swatchBtn, 'mouseleave', () => this.hideTooltip()),
      this.renderer.listen(this.swatchBtn, 'focusin', () =>
        this.showTooltipOnFocus(this.swatchBtn, this.swatchTooltipText),
      ),
      this.renderer.listen(this.swatchBtn, 'focusout', () => this.hideTooltip()),
      this.renderer.listen(this.chevronBtn, 'mouseenter', () =>
        this.showTooltip(this.chevronBtn, this.t().openPicker),
      ),
      this.renderer.listen(this.chevronBtn, 'mouseleave', () => this.hideTooltip()),
      this.renderer.listen(this.chevronBtn, 'focusin', () =>
        this.showTooltipOnFocus(this.chevronBtn, this.t().openPicker),
      ),
      this.renderer.listen(this.chevronBtn, 'focusout', () => this.hideTooltip()),
    );
  }

  private teardownDom(): void {
    const native = this.el.nativeElement;
    const parent = this.containerEl?.parentNode;
    if (!parent) return;

    this.renderer.insertBefore(parent, native, this.containerEl);
    this.renderer.removeChild(parent, this.containerEl);
  }

  private syncState(): void {
    const native = this.el.nativeElement;
    const value = native.value.trim();
    const parsed = parseColor(value);
    const valid = value === '' || parsed != null;

    if (parsed && parsed.hex !== this.lastValid.hex) {
      this.lastValid = parsed;
    }

    this.invalidValue.set(!valid);

    this.renderer.setAttribute(this.containerEl, 'data-kui-size', this.effectiveSize());
    this.setBooleanAttr(this.containerEl, 'data-kui-open', this.open());
    this.setBooleanAttr(this.containerEl, 'data-kui-invalid', this.effectiveInvalid());
    this.setBooleanAttr(this.containerEl, 'data-kui-disabled', native.disabled);
    this.setBooleanAttr(this.containerEl, 'data-kui-readonly', native.readOnly);

    this.swatchBtn.disabled = native.disabled || native.readOnly;
    this.chevronBtn.disabled = native.disabled || native.readOnly;
    this.chevronBtn.hidden = native.readOnly;
    this.swatchTooltipText = this.lastValid.hex;
    this.swatchBtn.setAttribute(
      'aria-label',
      value ? `${this.effectiveSwatchLabel()}: ${this.lastValid.hex}` : this.effectiveSwatchLabel(),
    );
    if (this.tooltipAnchor === this.swatchBtn) {
      this.updateTooltipText(this.swatchTooltipText);
      this.tooltipOverlay?.updatePosition();
    }
    this.chevronBtn.setAttribute('aria-label', this.t().openPicker);
    this.chevronBtn.setAttribute('aria-expanded', this.open() ? 'true' : 'false');
    this.chevronBtn.setAttribute('aria-hidden', native.readOnly ? 'true' : 'false');

    this.renderer.setStyle(
      this.swatchFill,
      'background',
      valid && value ? this.lastValid.hex : this.lastValid.hex,
    );

    this.picker?.sync();
  }

  /**
   * Lazily creates the `kui-dropdown` instance the picker renders into, on first open. The
   * dropdown owns positioning, viewport-safe sizing/scrolling, outside-click, Escape, and
   * anchor-offscreen auto-close -- same as every other Kikita UI floating panel -- instead of
   * this directive re-implementing all of that against a raw CDK overlay.
   */
  private ensureDropdown(): ComponentRef<KuiDropdown> {
    if (this.dropdownRef) return this.dropdownRef;

    this.panelEl = this.renderer.createElement('div') as HTMLElement;
    this.renderer.addClass(this.panelEl, 'kui-color-input-popover');
    this.picker = new KuiColorPickerPanel({
      renderer: this.renderer,
      panel: this.panelEl,
      messages: () => this.t(),
      color: () => this.lastValid,
      commit: (color) => this.commitColor(color),
      showTooltip: (anchor, text) => this.showTooltip(anchor, text),
      showTooltipOnFocus: (anchor, text) => this.showTooltipOnFocus(anchor, text),
      hideTooltip: () => this.hideTooltip(),
    });

    // The field must not adopt this dropdown: the directive owns its open state, and a field that
    // also toggled it on click would close the panel it just opened.
    const dropdownRef = this.vcr.createComponent(KuiDropdown, {
      projectableNodes: [[this.panelEl]],
      injector: Injector.create({
        providers: [{ provide: KUI_FIELD, useValue: null }],
        parent: this.injector,
      }),
    });
    dropdownRef.setInput('panelRole', 'dialog');
    dropdownRef.setInput('panelWidth', 'auto');
    dropdownRef.setInput('maxHeight', null);
    this.dropdownRef = dropdownRef;

    // The dropdown can also close itself (outside click, Escape, anchor scrolled offscreen).
    // Mirror that back into our own `open` signal/state when it does.
    effect(
      () => {
        if (!dropdownRef.instance.isOpen() && this.open()) {
          this.open.set(false);
          this.syncState();
        }
      },
      { injector: this.injector },
    );

    return dropdownRef;
  }

  /**
   * A click anywhere on the field that is not the swatch or the chevron, including the padding
   * around the text, focuses the text input and opens the picker, like the other picker fields. It
   * never closes the picker, so the caret can be placed while typing a value.
   */
  private handleFieldClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    const native = this.el.nativeElement;

    if (!target || target.closest('button') || native.disabled || native.readOnly) return;

    native.focus();
    if (!this.open()) this.openPicker();
  }

  private togglePicker(trigger: HTMLElement, event: MouseEvent): void {
    // A click with no pointer (`detail` 0) comes from Enter or Space on the trigger.
    this.open() ? this.closePicker() : this.openPicker(trigger, event.detail === 0);
  }

  /**
   * Opens the picker. A pointer user keeps the caret in the text field; a keyboard user is moved
   * into the panel, because it is rendered in an overlay that Tab from the field never reaches.
   * Escape or choosing a value returns focus to the trigger that opened it.
   */
  private openPicker(trigger: HTMLElement | null = null, focusPanel = false): void {
    const native = this.el.nativeElement;
    if (native.disabled || native.readOnly || this.open()) return;
    this.el.nativeElement.focus();
    this.focusReturnTarget = focusPanel && trigger ? trigger : this.el.nativeElement;

    const dropdownRef = this.ensureDropdown();
    dropdownRef.instance.setAnchor(
      this.containerEl,
      this.containerEl,
      () => this.focusReturnTarget,
    );
    dropdownRef.instance.open();
    this.open.set(true);
    this.syncState();

    if (focusPanel) {
      afterNextRender({ write: () => this.picker?.focusSurface() }, { injector: this.injector });
    }
  }

  private closePicker(): void {
    this.hideTooltip();
    this.dropdownRef?.instance.close();
    this.open.set(false);
    this.syncState();
  }

  /** Applies a colour chosen in the picker: keeps it, writes it to the native input and syncs. */
  private commitColor(parsed: KuiParsedColor): void {
    const native = this.el.nativeElement;
    this.lastValid = parsed;
    native.value = parsed.hex;
    native.dispatchEvent(new Event('input', { bubbles: true }));
    native.dispatchEvent(new Event('change', { bubbles: true }));
    this.syncState();
  }

  /**
   * Skips programmatic focus (e.g. the popover auto-focusing its first focusable child on
   * open) -- only real keyboard navigation should surface the tooltip on focus.
   */
  private showTooltipOnFocus(anchor: HTMLElement, text: string): void {
    if (!anchor.matches(':focus-visible')) return;
    this.showTooltip(anchor, text);
  }

  private showTooltip(anchor: HTMLElement, text: string): void {
    const value = text.trim();
    if (!value || !anchor.ownerDocument.defaultView || anchor.matches(':disabled')) return;

    if (this.tooltipOverlay && this.tooltipAnchor === anchor) {
      this.updateTooltipText(value);
      this.tooltipOverlay.updatePosition();
      return;
    }

    this.hideTooltip();
    const tooltipId = this.nextId('kui-color-input-tooltip', 1);
    this.tooltipOverlay = createKuiTooltipOverlay({
      anchor,
      id: tooltipId,
      overlay: this.overlay,
      placement: 'top',
      text: value,
    });
    this.renderer.setAttribute(anchor, 'aria-describedby', tooltipId);
    this.tooltipAnchor = anchor;
  }

  private updateTooltipText(text: string): void {
    this.tooltipOverlay?.updateText(text);
  }

  private hideTooltip(): void {
    const tooltipOverlay = this.tooltipOverlay;
    if (!tooltipOverlay) return;

    const anchor = this.tooltipAnchor;
    this.tooltipOverlay = null;
    this.tooltipAnchor = null;
    anchor?.removeAttribute('aria-describedby');
    this.renderer.addClass(tooltipOverlay.tooltipEl, 'is-hiding');
    let removed = false;
    const remove = () => {
      if (!removed) {
        removed = true;
        tooltipOverlay.overlayRef.dispose();
      }
    };
    tooltipOverlay.tooltipEl.addEventListener('animationend', remove, { once: true });
    setTimeout(remove, 200);
  }

  private setBooleanAttr(el: HTMLElement, name: string, active: boolean): void {
    if (active) {
      this.renderer.setAttribute(el, name, '');
    } else {
      this.renderer.removeAttribute(el, name);
    }
  }
}

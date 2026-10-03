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

import { hexToOklch, oklchToRgb8, rgbToHex } from '../../foundation/color/kui-color-math';
import { injectKuiMessages } from '../../i18n/inject-kui-messages';
import type { KuiColorInputMessages } from '../../i18n/kui-messages.interface';
import { KuiDefaults } from '../../providers/kui-defaults.service';
import { injectKuiRootSizeDefault } from '../../providers/kui-defaults.util';
import { DEFAULT_KUI_THEME } from '../../theme/default-kui-theme.const';
import type { KuiSize } from '../../types';
import {
  createKuiControlSize,
  createKuiFieldWiring,
} from '../../utils/kui-field-control-wiring.util';
import { kuiIdFactory } from '../../utils/kui-id.util';
import { KuiDropdownComponent } from '../dropdown/kui-dropdown.component';
import { KUI_FIELD } from '../field/kui-field-host.token';
import { injectKuiGlyph } from '../icon/inject-kui-glyph';
import { KUI_GLYPH_CHEVRON_DOWN, KUI_GLYPH_COPY } from '../icon/kui-chrome-glyphs';
import { createKuiGlyphElement } from '../icon/kui-glyph-dom.util';
import type { KuiIconGlyph } from '../icon/kui-icon-glyph.type';
import type { KuiTooltipOverlayHandle } from '../tooltip/kui-tooltip-overlay.util';
import { createKuiTooltipOverlay } from '../tooltip/kui-tooltip-overlay.util';

const HEX_COLOR_RE = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;
const OKLCH_COLOR_RE =
  /^oklch\(\s*(?:0|1|0?\.\d+|\d+(?:\.\d+)?%)\s+\d*(?:\.\d+)?\s+\d+(?:\.\d+)?(?:\s*\/\s*(?:0|1|0?\.\d+|\d+(?:\.\d+)?%))?\s*\)$/i;
const MAX_CHROMA = 0.32;

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
export class KuiColorInputDirective implements AfterViewInit, DoCheck, OnDestroy {
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
  private dropdownRef: ComponentRef<KuiDropdownComponent> | null = null;
  private panelEl: HTMLElement | null = null;
  private pickerEl: HTMLElement | null = null;
  private focusReturnTarget: HTMLElement | null = null;
  private thumbEl: HTMLElement | null = null;
  private hueThumbEl: HTMLElement | null = null;
  private hueInputEl: HTMLInputElement | null = null;
  private lInputEl: HTMLInputElement | null = null;
  private cInputEl: HTMLInputElement | null = null;
  private hInputEl: HTMLInputElement | null = null;
  private hexInputEl: HTMLInputElement | null = null;
  private previewFillEl: HTMLElement | null = null;
  private pickerBuilt = false;
  private readonly invalidValue = signal(false);
  private readonly open = signal(false);
  private lastValid = hexToParsed('#5b4fe0')!;
  private dragAbort: (() => void) | null = null;
  private lastState = '';
  private swatchTooltipText = '';
  private tooltipOverlay: KuiTooltipOverlayHandle | null = null;
  private tooltipAnchor: HTMLElement | null = null;
  private readonly unlisten: (() => void)[] = [];
  private readonly pickerUnlisten: (() => void)[] = [];

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
    this.clearPickerListeners();
    this.hideTooltip();
    this.dragAbort?.();
    this.dragAbort = null;
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

    if (this.panelEl) {
      this.pickerBuilt ? this.updatePickerVisuals() : this.renderPicker();
    }
  }

  /**
   * Lazily creates the `kui-dropdown` instance the picker renders into, on first open. The
   * dropdown owns positioning, viewport-safe sizing/scrolling, outside-click, Escape, and
   * anchor-offscreen auto-close -- same as every other Kikita UI floating panel -- instead of
   * this directive re-implementing all of that against a raw CDK overlay.
   */
  private ensureDropdown(): ComponentRef<KuiDropdownComponent> {
    if (this.dropdownRef) return this.dropdownRef;

    this.panelEl = this.renderer.createElement('div') as HTMLElement;
    this.renderer.addClass(this.panelEl, 'kui-color-input-popover');

    // The field must not adopt this dropdown: the directive owns its open state, and a field that
    // also toggled it on click would close the panel it just opened.
    const dropdownRef = this.vcr.createComponent(KuiDropdownComponent, {
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
      afterNextRender({ write: () => this.pickerEl?.focus() }, { injector: this.injector });
    }
  }

  private closePicker(): void {
    this.hideTooltip();
    this.dropdownRef?.instance.close();
    this.open.set(false);
    this.syncState();
  }

  private renderPicker(): void {
    const panel = this.panelEl;
    if (!panel) return;

    this.clearPickerListeners();
    panel.replaceChildren();

    this.pickerEl = this.renderer.createElement('div');
    this.renderer.addClass(this.pickerEl, 'kui-color-input-picker');
    this.renderer.setStyle(this.pickerEl, 'background', this.surfaceBackground());
    this.renderer.setAttribute(this.pickerEl, 'role', 'slider');
    this.renderer.setAttribute(this.pickerEl, 'tabindex', '0');
    this.renderer.setAttribute(this.pickerEl, 'aria-label', this.t().pickerLabel);
    this.renderer.setAttribute(this.pickerEl, 'aria-valuetext', this.lastValid.hex);

    this.thumbEl = this.renderer.createElement('span');
    this.renderer.addClass(this.thumbEl, 'kui-color-input-thumb');
    this.renderer.setStyle(this.thumbEl, 'left', `${(this.lastValid.c / MAX_CHROMA) * 100}%`);
    this.renderer.setStyle(this.thumbEl, 'top', `${(1 - this.lastValid.l) * 100}%`);
    this.renderer.setStyle(this.thumbEl, 'background', this.lastValid.hex);
    this.renderer.appendChild(this.pickerEl, this.thumbEl);
    this.renderer.appendChild(panel, this.pickerEl);

    this.pickerUnlisten.push(
      this.renderer.listen(this.pickerEl, 'pointerdown', (event: PointerEvent) =>
        this.handleSurfacePointer(event),
      ),
      this.renderer.listen(this.pickerEl, 'keydown', (event: KeyboardEvent) =>
        this.handleSurfaceKeydown(event),
      ),
    );

    const hue = this.renderer.createElement('div');
    this.renderer.addClass(hue, 'kui-color-input-hue');
    const hueTrack = this.renderer.createElement('div');
    this.renderer.addClass(hueTrack, 'kui-color-input-hue-track');
    this.renderer.setStyle(hueTrack, 'background', this.hueBackground());
    this.hueThumbEl = this.renderer.createElement('span');
    this.renderer.addClass(this.hueThumbEl, 'kui-color-input-hue-thumb');
    this.renderer.setStyle(this.hueThumbEl, 'left', `${(this.lastValid.h / 360) * 100}%`);
    this.hueInputEl = this.renderer.createElement('input');
    this.renderer.addClass(this.hueInputEl, 'kui-color-input-hue-native');
    this.renderer.setAttribute(this.hueInputEl, 'type', 'range');
    this.renderer.setAttribute(this.hueInputEl, 'min', '0');
    this.renderer.setAttribute(this.hueInputEl, 'max', '360');
    this.renderer.setAttribute(this.hueInputEl, 'aria-label', this.t().hue);
    this.renderer.setProperty(this.hueInputEl, 'value', String(Math.round(this.lastValid.h)));
    this.renderer.appendChild(hue, hueTrack);
    this.renderer.appendChild(hue, this.hueThumbEl);
    this.renderer.appendChild(hue, this.hueInputEl);
    this.renderer.appendChild(panel, hue);
    this.pickerUnlisten.push(
      this.renderer.listen(this.hueInputEl, 'input', () =>
        this.commitOklch(this.lastValid.l, this.lastValid.c, Number(this.hueInputEl!.value)),
      ),
    );

    this.renderNumberInputs(panel);
    this.renderPreviewRow(panel);
    this.renderPresets(panel);
    this.renderCopyButton(panel);
    this.pickerBuilt = true;
  }

  private updatePickerVisuals(): void {
    if (!this.pickerEl || !this.thumbEl || !this.hueThumbEl || !this.hueInputEl) return;
    const active = this.pickerEl.ownerDocument.activeElement;

    this.renderer.setStyle(this.pickerEl, 'background', this.surfaceBackground());
    this.renderer.setAttribute(this.pickerEl, 'aria-valuetext', this.lastValid.hex);
    this.renderer.setStyle(this.thumbEl, 'left', `${(this.lastValid.c / MAX_CHROMA) * 100}%`);
    this.renderer.setStyle(this.thumbEl, 'top', `${(1 - this.lastValid.l) * 100}%`);
    this.renderer.setStyle(this.thumbEl, 'background', this.lastValid.hex);
    this.renderer.setStyle(this.hueThumbEl, 'left', `${(this.lastValid.h / 360) * 100}%`);

    if (active !== this.hueInputEl) {
      this.renderer.setProperty(this.hueInputEl, 'value', String(Math.round(this.lastValid.h)));
    }
    if (this.lInputEl && active !== this.lInputEl) {
      this.renderer.setProperty(this.lInputEl, 'value', this.lastValid.l.toFixed(2));
    }
    if (this.cInputEl && active !== this.cInputEl) {
      this.renderer.setProperty(this.cInputEl, 'value', this.lastValid.c.toFixed(3));
    }
    if (this.hInputEl && active !== this.hInputEl) {
      this.renderer.setProperty(this.hInputEl, 'value', String(Math.round(this.lastValid.h)));
    }
    if (this.hexInputEl && active !== this.hexInputEl) {
      this.renderer.setProperty(this.hexInputEl, 'value', this.lastValid.hex);
    }
    if (this.previewFillEl) {
      this.renderer.setStyle(this.previewFillEl, 'background', this.lastValid.hex);
    }
  }

  private renderNumberInputs(panel: HTMLElement): void {
    const nums = this.renderer.createElement('div');
    this.renderer.addClass(nums, 'kui-color-input-nums');
    this.lInputEl = this.renderNumberInput(nums, 'L', this.lastValid.l.toFixed(2));
    this.cInputEl = this.renderNumberInput(nums, 'C', this.lastValid.c.toFixed(3));
    this.hInputEl = this.renderNumberInput(nums, 'H', String(Math.round(this.lastValid.h)));
    this.renderer.appendChild(panel, nums);

    this.pickerUnlisten.push(
      this.renderer.listen(this.lInputEl, 'change', () =>
        this.commitOklch(Number(this.lInputEl!.value), this.lastValid.c, this.lastValid.h),
      ),
      this.renderer.listen(this.cInputEl, 'change', () =>
        this.commitOklch(this.lastValid.l, Number(this.cInputEl!.value), this.lastValid.h),
      ),
      this.renderer.listen(this.hInputEl, 'change', () =>
        this.commitOklch(this.lastValid.l, this.lastValid.c, Number(this.hInputEl!.value)),
      ),
    );
  }

  private renderNumberInput(parent: HTMLElement, label: string, value: string): HTMLInputElement {
    const wrap = this.renderer.createElement('label');
    this.renderer.addClass(wrap, 'kui-color-input-num');
    const text = this.renderer.createElement('span');
    text.textContent = label;
    const inputEl = this.renderer.createElement('input') as HTMLInputElement;
    this.renderer.setAttribute(inputEl, 'type', 'text');
    this.renderer.setProperty(inputEl, 'value', value);
    this.renderer.appendChild(wrap, text);
    this.renderer.appendChild(wrap, inputEl);
    this.renderer.appendChild(parent, wrap);
    return inputEl;
  }

  private renderPreviewRow(panel: HTMLElement): void {
    const row = this.renderer.createElement('div');
    this.renderer.addClass(row, 'kui-color-input-preview-row');
    const swatch = this.renderer.createElement('span');
    this.renderer.addClass(swatch, 'kui-color-input-swatch');
    this.renderer.addClass(swatch, 'kui-color-input-swatch--lg');
    this.previewFillEl = this.renderer.createElement('span');
    this.renderer.addClass(this.previewFillEl, 'kui-color-input-swatch__fill');
    this.renderer.setStyle(this.previewFillEl, 'background', this.lastValid.hex);
    this.renderer.appendChild(swatch, this.previewFillEl);
    this.hexInputEl = this.renderer.createElement('input');
    this.renderer.addClass(this.hexInputEl, 'kui-color-input-hex');
    this.renderer.setAttribute(this.hexInputEl, 'type', 'text');
    this.renderer.setProperty(this.hexInputEl, 'value', this.lastValid.hex);
    this.renderer.appendChild(row, swatch);
    this.renderer.appendChild(row, this.hexInputEl);
    this.renderer.appendChild(panel, row);
    this.pickerUnlisten.push(
      this.renderer.listen(this.hexInputEl, 'change', () =>
        this.commitText(this.hexInputEl!.value),
      ),
    );
  }

  private renderPresets(panel: HTMLElement): void {
    // The default theme seeds (primary/neutral/success/warning/danger/info), so the swatches read
    // as theme-seed shortcuts and follow DEFAULT_KUI_THEME instead of a second copy of its colors.
    const seeds = DEFAULT_KUI_THEME.seeds.color;
    const presets: readonly [name: string, hex: string][] = (
      [
        [this.t().presetPrimary, seeds.primary],
        [this.t().presetNeutral, seeds.neutral],
        [this.t().presetSuccess, seeds.success],
        [this.t().presetWarning, seeds.warning],
        [this.t().presetDanger, seeds.danger],
        [this.t().presetInfo, seeds.info],
      ] as const
    ).flatMap(([name, seed]) =>
      seed ? [[name, parseColor(seed)?.hex ?? seed] as [string, string]] : [],
    );
    const row = this.renderer.createElement('div');
    this.renderer.addClass(row, 'kui-color-input-presets');
    for (const [name, preset] of presets) {
      const btn = this.renderer.createElement('button');
      this.renderer.addClass(btn, 'kui-color-input-preset');
      this.renderer.setAttribute(btn, 'type', 'button');
      const presetLabel = this.t().preset({ name, value: preset });
      this.renderer.setAttribute(btn, 'aria-label', presetLabel);
      this.renderer.setStyle(btn, 'background', preset);
      this.renderer.appendChild(row, btn);
      this.pickerUnlisten.push(
        this.renderer.listen(btn, 'click', () => this.commitText(preset)),
        this.renderer.listen(btn, 'mouseenter', () => this.showTooltip(btn, presetLabel)),
        this.renderer.listen(btn, 'mouseleave', () => this.hideTooltip()),
        this.renderer.listen(btn, 'focusin', () => this.showTooltipOnFocus(btn, presetLabel)),
        this.renderer.listen(btn, 'focusout', () => this.hideTooltip()),
      );
    }
    this.renderer.appendChild(panel, row);
  }

  private renderCopyButton(panel: HTMLElement): void {
    const btn = this.renderer.createElement('button');
    this.renderer.addClass(btn, 'kui-button');
    this.renderer.addClass(btn, 'kui-color-input-copy-btn');
    this.renderer.setAttribute(btn, 'data-kui-shape', 'ghost');
    this.renderer.setAttribute(btn, 'data-kui-size', 'xs');
    this.renderer.setAttribute(btn, 'type', 'button');
    this.renderer.appendChild(
      btn,
      createKuiGlyphElement(this.renderer, KUI_GLYPH_COPY, { size: 13, strokeWidth: 2 }),
    );
    this.renderer.appendChild(btn, this.renderer.createText(this.t().copyValue));
    this.renderer.appendChild(panel, btn);
    this.pickerUnlisten.push(
      this.renderer.listen(btn, 'click', () => {
        void navigator.clipboard?.writeText(this.lastValid.hex).catch(() => undefined);
      }),
      this.renderer.listen(btn, 'mouseenter', () => this.showTooltip(btn, this.t().copyValue)),
      this.renderer.listen(btn, 'mouseleave', () => this.hideTooltip()),
      this.renderer.listen(btn, 'focusin', () => this.showTooltipOnFocus(btn, this.t().copyValue)),
      this.renderer.listen(btn, 'focusout', () => this.hideTooltip()),
    );
  }

  private handleSurfacePointer(event: PointerEvent): void {
    event.preventDefault();
    this.pickerEl?.setPointerCapture?.(event.pointerId);
    this.updateFromSurface(event.clientX, event.clientY);
    const view = this.el.nativeElement.ownerDocument.defaultView;
    if (!view) return;

    const move = (moveEvent: PointerEvent) =>
      this.updateFromSurface(moveEvent.clientX, moveEvent.clientY);
    const up = () => {
      this.renderer.removeClass(this.thumbEl, 'kui-color-input-thumb--drag');
      this.pickerEl?.releasePointerCapture?.(event.pointerId);
      view.removeEventListener('pointermove', move);
      view.removeEventListener('pointerup', up);
      this.dragAbort = null;
    };
    this.renderer.addClass(this.thumbEl, 'kui-color-input-thumb--drag');
    view.addEventListener('pointermove', move);
    view.addEventListener('pointerup', up);
    this.dragAbort = up;
  }

  private updateFromSurface(clientX: number, clientY: number): void {
    const rect = this.pickerEl?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.min(rect.width, Math.max(0, clientX - rect.left));
    const y = Math.min(rect.height, Math.max(0, clientY - rect.top));
    this.commitOklch(1 - y / rect.height, (x / rect.width) * MAX_CHROMA, this.lastValid.h);
  }

  private handleSurfaceKeydown(event: KeyboardEvent): void {
    const stepC = MAX_CHROMA / 50;
    const stepL = 0.02;
    let { l, c } = this.lastValid;
    if (event.key === 'ArrowRight') c += stepC;
    else if (event.key === 'ArrowLeft') c -= stepC;
    else if (event.key === 'ArrowUp') l += stepL;
    else if (event.key === 'ArrowDown') l -= stepL;
    else if (event.key === 'Home') c = 0;
    else if (event.key === 'End') c = MAX_CHROMA;
    else return;
    event.preventDefault();
    this.commitOklch(l, c, this.lastValid.h);
  }

  private commitOklch(l: number, c: number, h: number): void {
    if (!Number.isFinite(l) || !Number.isFinite(c) || !Number.isFinite(h)) return;
    const next = normalizeOklch(l, c, h);
    this.commitParsed(next);
  }

  private commitText(value: string): void {
    const parsed = parseColor(value);
    if (!parsed) return;
    this.commitParsed(parsed);
  }

  private commitParsed(parsed: KuiParsedColor): void {
    const native = this.el.nativeElement;
    this.lastValid = parsed;
    native.value = parsed.hex;
    native.dispatchEvent(new Event('input', { bubbles: true }));
    native.dispatchEvent(new Event('change', { bubbles: true }));
    this.syncState();
  }

  private surfaceBackground(): string {
    const hueColor = normalizeOklch(
      0.72,
      Math.min(this.lastValid.c || 0.2, MAX_CHROMA),
      this.lastValid.h,
    ).hex;
    return `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, ${hueColor})`;
  }

  private hueBackground(): string {
    const stops = [0, 60, 120, 180, 240, 300, 360]
      .map((h) => normalizeOklch(0.72, 0.15, h).hex)
      .join(', ');
    return `linear-gradient(to right, ${stops})`;
  }

  private clearPickerListeners(): void {
    this.hideTooltip();
    this.pickerUnlisten.forEach((fn) => fn());
    this.pickerUnlisten.length = 0;
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

function isSupportedColor(value: string): boolean {
  return HEX_COLOR_RE.test(value) || OKLCH_COLOR_RE.test(value);
}

function normalizeHexForPicker(value: string): string | null {
  if (!HEX_COLOR_RE.test(value)) return null;

  if (value.length === 4) {
    const [, r, g, b] = value;
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }

  return value.toLowerCase();
}

interface KuiParsedColor {
  hex: string;
  l: number;
  c: number;
  h: number;
}

function parseColor(value: string): KuiParsedColor | null {
  const trimmed = value.trim();
  const hex = normalizeHexForPicker(trimmed);
  if (hex) return hexToParsed(hex);
  return parseOklch(trimmed);
}

function parseOklch(value: string): KuiParsedColor | null {
  if (!OKLCH_COLOR_RE.test(value)) return null;
  const match = value.match(/^oklch\(\s*([^\s]+)\s+([^\s]+)\s+([^\s/)]+)/i);
  if (!match) return null;
  const l = match[1].endsWith('%') ? Number(match[1].slice(0, -1)) / 100 : Number(match[1]);
  const c = Number(match[2]);
  const h = Number(match[3]);
  if (!Number.isFinite(l) || !Number.isFinite(c) || !Number.isFinite(h)) return null;
  return normalizeOklch(l, c, h);
}

function normalizeOklch(l: number, c: number, h: number): KuiParsedColor {
  const nextL = Math.min(1, Math.max(0, l));
  const nextC = Math.min(MAX_CHROMA, Math.max(0, c));
  const nextH = h === 360 ? 360 : ((h % 360) + 360) % 360;
  const [r, g, b] = oklchToRgb8({ lightness: nextL, chroma: nextC, hue: nextH });
  return { hex: rgbToHex(r, g, b), l: nextL, c: nextC, h: nextH };
}

function hexToParsed(hex: string): KuiParsedColor | null {
  const normalized = normalizeHexForPicker(hex);
  const oklch = normalized ? hexToOklch(normalized) : null;

  return normalized && oklch
    ? { hex: normalized, l: oklch.lightness, c: oklch.chroma, h: oklch.hue }
    : null;
}

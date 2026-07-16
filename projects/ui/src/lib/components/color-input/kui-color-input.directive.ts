import { Overlay } from '@angular/cdk/overlay';
import {
  AfterViewInit,
  ComponentRef,
  Directive,
  DoCheck,
  ElementRef,
  Injector,
  OnDestroy,
  Renderer2,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  signal,
  ViewContainerRef,
} from '@angular/core';

import { KuiSize } from '../../types';
import {
  KUI_CHEVRON_DOWN_D,
  KUI_COPY_D,
  KUI_COPY_RECT,
} from '../../utils/kui-chrome-icon-paths.util';
import {
  createKuiTooltipOverlay,
  KuiTooltipOverlayHandle,
} from '../../utils/kui-tooltip-overlay.util';
import { KuiDropdownComponent } from '../dropdown/kui-dropdown.component';
import { KuiFieldComponent } from '../field';

const HEX_COLOR_RE = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;
const OKLCH_COLOR_RE =
  /^oklch\(\s*(?:0|1|0?\.\d+|\d+(?:\.\d+)?%)\s+\d*(?:\.\d+)?\s+\d+(?:\.\d+)?(?:\s*\/\s*(?:0|1|0?\.\d+|\d+(?:\.\d+)?%))?\s*\)$/i;
const MAX_CHROMA = 0.32;

let nextColorInputTooltipId = 0;

/**
 * Applies Kikita UI color-input styling to a native text input.
 *
 * The native input remains the form value source. It accepts hex colors and OKLCH values for
 * Kikita theme seed editing, while the swatch/chevron open a Kikita picker popover.
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
    '[attr.aria-invalid]': 'effectiveInvalid() ? "true" : null',
  },
})
export class KuiColorInputDirective implements AfterViewInit, DoCheck, OnDestroy {
  /** Control height matched to Kikita UI size tokens. */
  readonly size = input<KuiSize>('md');

  /** Applies error border. Also inherited from a parent `kui-field` with an error. */
  readonly invalidInput = input(false, { alias: 'invalid', transform: booleanAttribute });

  /** Id override for the native input. Falls back to the parent `kui-field` control id. */
  readonly id = input<string | undefined>();

  /** Accessible label for the swatch button. */
  readonly swatchLabel = input('Open color picker');

  private readonly el = inject<ElementRef<HTMLInputElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly overlay = inject(Overlay);
  private readonly vcr = inject(ViewContainerRef);
  private readonly injector = inject(Injector);
  private readonly field = inject(KuiFieldComponent, { optional: true, host: true });

  protected readonly inputId = computed(() => this.id() ?? this.field?.controlId ?? null);
  protected readonly describedBy = computed(() => this.field?.describedBy() ?? null);
  protected readonly effectiveInvalid = computed(
    () => this.invalidInput() || Boolean(this.field?.invalid()) || this.invalidValue(),
  );

  private containerEl!: HTMLElement;
  private swatchBtn!: HTMLButtonElement;
  private swatchFill!: HTMLElement;
  private chevronBtn!: HTMLButtonElement;
  private dropdownRef: ComponentRef<KuiDropdownComponent> | null = null;
  private panelEl: HTMLElement | null = null;
  private pickerEl: HTMLElement | null = null;
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
  private lastValid = hexToOklch('#5b4fe0')!;
  private dragAbort: (() => void) | null = null;
  private lastState = '';
  private swatchTooltipText = '';
  private tooltipOverlay: KuiTooltipOverlayHandle | null = null;
  private tooltipAnchor: HTMLElement | null = null;
  private readonly unlisten: Array<() => void> = [];
  private readonly pickerUnlisten: Array<() => void> = [];

  ngAfterViewInit(): void {
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
      this.size(),
      this.invalidInput(),
      this.field?.invalid() ?? false,
      this.swatchLabel(),
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
    this.renderer.setAttribute(this.chevronBtn, 'aria-label', 'Open color picker');
    this.chevronBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="${KUI_CHEVRON_DOWN_D}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>`;

    this.renderer.appendChild(this.containerEl, this.swatchBtn);
    this.renderer.appendChild(this.containerEl, native);
    this.renderer.appendChild(this.containerEl, this.chevronBtn);

    this.unlisten.push(
      this.renderer.listen(native, 'input', () => this.syncState()),
      this.renderer.listen(native, 'change', () => this.syncState()),
      this.renderer.listen(this.swatchBtn, 'click', () => this.togglePicker()),
      this.renderer.listen(this.chevronBtn, 'click', () => this.togglePicker()),
      this.renderer.listen(this.swatchBtn, 'mouseenter', () =>
        this.showTooltip(this.swatchBtn, this.swatchTooltipText),
      ),
      this.renderer.listen(this.swatchBtn, 'mouseleave', () => this.hideTooltip()),
      this.renderer.listen(this.swatchBtn, 'focusin', () =>
        this.showTooltipOnFocus(this.swatchBtn, this.swatchTooltipText),
      ),
      this.renderer.listen(this.swatchBtn, 'focusout', () => this.hideTooltip()),
      this.renderer.listen(this.chevronBtn, 'mouseenter', () =>
        this.showTooltip(this.chevronBtn, 'Open color picker'),
      ),
      this.renderer.listen(this.chevronBtn, 'mouseleave', () => this.hideTooltip()),
      this.renderer.listen(this.chevronBtn, 'focusin', () =>
        this.showTooltipOnFocus(this.chevronBtn, 'Open color picker'),
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

    this.renderer.setAttribute(this.containerEl, 'data-kui-size', this.size());
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
      value ? `${this.swatchLabel()}: ${this.lastValid.hex}` : this.swatchLabel(),
    );
    if (this.tooltipAnchor === this.swatchBtn) {
      this.updateTooltipText(this.swatchTooltipText);
      this.tooltipOverlay?.updatePosition();
    }
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

    const dropdownRef = this.vcr.createComponent(KuiDropdownComponent, {
      projectableNodes: [[this.panelEl]],
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

  private togglePicker(): void {
    this.open() ? this.closePicker() : this.openPicker();
  }

  private openPicker(): void {
    const native = this.el.nativeElement;
    if (native.disabled || native.readOnly || this.open()) return;
    this.el.nativeElement.focus();

    const dropdownRef = this.ensureDropdown();
    dropdownRef.instance.setAnchor(this.containerEl, this.containerEl);
    dropdownRef.instance.open();
    this.open.set(true);
    this.syncState();
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
    this.renderer.setAttribute(this.pickerEl, 'aria-label', 'Lightness and chroma');
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
    this.renderer.setAttribute(this.hueInputEl, 'aria-label', 'Hue');
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
    // Matches the semantic seed roles createKuiTheme() expects (primary/gray/success/
    // warning/danger/info) -- named here so the swatches read as theme-seed shortcuts,
    // not just an arbitrary color palette.
    const presets: readonly [name: string, hex: string][] = [
      ['Primary', '#5b4fe0'],
      ['Neutral', '#74736d'],
      ['Success', '#168a35'],
      ['Warning', '#eea000'],
      ['Danger', '#de0029'],
      ['Info', '#1298b8'],
    ];
    const row = this.renderer.createElement('div');
    this.renderer.addClass(row, 'kui-color-input-presets');
    for (const [name, preset] of presets) {
      const btn = this.renderer.createElement('button');
      this.renderer.addClass(btn, 'kui-color-input-preset');
      this.renderer.setAttribute(btn, 'type', 'button');
      this.renderer.setAttribute(btn, 'aria-label', `${name} seed: ${preset}`);
      this.renderer.setStyle(btn, 'background', preset);
      this.renderer.appendChild(row, btn);
      this.pickerUnlisten.push(
        this.renderer.listen(btn, 'click', () => this.commitText(preset)),
        this.renderer.listen(btn, 'mouseenter', () =>
          this.showTooltip(btn, `${name} seed: ${preset}`),
        ),
        this.renderer.listen(btn, 'mouseleave', () => this.hideTooltip()),
        this.renderer.listen(btn, 'focusin', () =>
          this.showTooltipOnFocus(btn, `${name} seed: ${preset}`),
        ),
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
    btn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="${KUI_COPY_RECT.x}" y="${KUI_COPY_RECT.y}" width="${KUI_COPY_RECT.width}" height="${KUI_COPY_RECT.height}" rx="${KUI_COPY_RECT.rx}" ry="${KUI_COPY_RECT.ry}" stroke="currentColor" stroke-width="2"></rect><path d="${KUI_COPY_D}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>Copy value`;
    this.renderer.appendChild(panel, btn);
    this.pickerUnlisten.push(
      this.renderer.listen(btn, 'click', () => {
        void navigator.clipboard?.writeText(this.lastValid.hex).catch(() => undefined);
      }),
      this.renderer.listen(btn, 'mouseenter', () => this.showTooltip(btn, 'Copy value')),
      this.renderer.listen(btn, 'mouseleave', () => this.hideTooltip()),
      this.renderer.listen(btn, 'focusin', () => this.showTooltipOnFocus(btn, 'Copy value')),
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
    const tooltipId = `kui-color-input-tooltip-${++nextColorInputTooltipId}`;
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
  if (hex) return hexToOklch(hex);
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
  const [r, g, b] = oklchToRgb(nextL, nextC, nextH);
  return { hex: rgbToHex(r, g, b), l: nextL, c: nextC, h: nextH };
}

function hexToOklch(hex: string): KuiParsedColor | null {
  const normalized = normalizeHexForPicker(hex);
  if (!normalized) return null;
  const r = parseInt(normalized.slice(1, 3), 16) / 255;
  const g = parseInt(normalized.slice(3, 5), 16) / 255;
  const b = parseInt(normalized.slice(5, 7), 16) / 255;
  const lin = (channel: number) =>
    channel <= 0.04045 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
  const rl = lin(r);
  const gl = lin(g);
  const bl = lin(b);
  const l = 0.4122214708 * rl + 0.5363325363 * gl + 0.0514459929 * bl;
  const m = 0.2119034982 * rl + 0.6806995451 * gl + 0.1073969566 * bl;
  const s = 0.0883024619 * rl + 0.2817188376 * gl + 0.6299787005 * bl;
  const lRoot = Math.cbrt(l);
  const mRoot = Math.cbrt(m);
  const sRoot = Math.cbrt(s);
  const L = 0.2104542553 * lRoot + 0.793617785 * mRoot - 0.0040720468 * sRoot;
  const A = 1.9779984951 * lRoot - 2.428592205 * mRoot + 0.4505937099 * sRoot;
  const B = 0.0259040371 * lRoot + 0.7827717662 * mRoot - 0.808675766 * sRoot;
  const C = Math.sqrt(A * A + B * B);
  let H = (Math.atan2(B, A) * 180) / Math.PI;
  if (H < 0) H += 360;
  return { hex: normalized, l: L, c: C, h: H };
}

function oklchToRgb(l: number, c: number, h: number): [number, number, number] {
  const hRad = (h * Math.PI) / 180;
  const a = c * Math.cos(hRad);
  const b = c * Math.sin(hRad);
  const lPrime = l + 0.3963377774 * a + 0.2158037573 * b;
  const mPrime = l - 0.1055613458 * a - 0.0638541728 * b;
  const sPrime = l - 0.0894841775 * a - 1.291485548 * b;
  const lCube = lPrime * lPrime * lPrime;
  const mCube = mPrime * mPrime * mPrime;
  const sCube = sPrime * sPrime * sPrime;
  const r = 4.0767416621 * lCube - 3.3077115913 * mCube + 0.2309699292 * sCube;
  const g = -1.2684380046 * lCube + 2.6097574011 * mCube - 0.3413193965 * sCube;
  const blue = -0.0041960863 * lCube - 0.7034186147 * mCube + 1.707614701 * sCube;
  return [encodeRgb(r), encodeRgb(g), encodeRgb(blue)];
}

function encodeRgb(channel: number): number {
  const encoded =
    channel <= 0.0031308
      ? 12.92 * channel
      : 1.055 * Math.pow(Math.max(channel, 0), 1 / 2.4) - 0.055;
  return Math.round(Math.min(1, Math.max(0, encoded)) * 255);
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((value) => value.toString(16).padStart(2, '0')).join('')}`;
}

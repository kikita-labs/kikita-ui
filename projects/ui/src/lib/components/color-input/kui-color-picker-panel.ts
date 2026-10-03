import type { Renderer2 } from '@angular/core';

import type { KuiBoundMessages, KuiColorInputMessages } from '../../i18n/kui-messages.interface';
import { DEFAULT_KUI_THEME } from '../../theme/default-kui-theme.const';
import { KUI_GLYPH_COPY } from '../icon/kui-chrome-glyphs';
import { createKuiGlyphElement } from '../icon/kui-glyph-dom.util';
import {
  KUI_COLOR_INPUT_MAX_CHROMA,
  type KuiParsedColor,
  normalizeOklch,
  parseColor,
} from './kui-color-input-color.util';

/** What the picker panel needs from the colour input that owns it. */
export interface KuiColorPickerPanelOptions {
  readonly renderer: Renderer2;

  /** The element the picker renders into; the colour input puts it inside a dropdown. */
  readonly panel: HTMLElement;

  /** The colour input's current messages. */
  readonly messages: () => KuiBoundMessages<KuiColorInputMessages>;

  /** The colour the picker shows now. */
  readonly color: () => KuiParsedColor;

  /** Applies a colour the user chose; the colour input writes it to its native input. */
  readonly commit: (color: KuiParsedColor) => void;

  /** Shows a tooltip on hover, for a control of the panel. */
  readonly showTooltip: (anchor: HTMLElement, text: string) => void;

  /** Shows a tooltip on keyboard focus only, for a control of the panel. */
  readonly showTooltipOnFocus: (anchor: HTMLElement, text: string) => void;

  /** Hides the tooltip. */
  readonly hideTooltip: () => void;
}

/**
 * The content of the colour picker popover: the lightness and chroma surface, the hue slider, the
 * L, C and H fields, the hex field with its preview, the theme presets and the copy button. It builds
 * its DOM once, updates it when the colour changes and reports every choice through `commit`; the
 * colour input keeps the value, the native input and the popover.
 */
export class KuiColorPickerPanel {
  private pickerEl: HTMLElement | null = null;
  private thumbEl: HTMLElement | null = null;
  private hueThumbEl: HTMLElement | null = null;
  private hueInputEl: HTMLInputElement | null = null;
  private lInputEl: HTMLInputElement | null = null;
  private cInputEl: HTMLInputElement | null = null;
  private hInputEl: HTMLInputElement | null = null;
  private hexInputEl: HTMLInputElement | null = null;
  private previewFillEl: HTMLElement | null = null;
  private built = false;
  private dragAbort: (() => void) | null = null;
  private readonly unlisten: (() => void)[] = [];

  constructor(private readonly options: KuiColorPickerPanelOptions) {}

  /** Builds the panel on the first call and updates it afterwards. */
  sync(): void {
    if (this.built) this.update();
    else this.render();
  }

  /** Moves focus to the colour surface, the first control of the panel. */
  focusSurface(): void {
    this.pickerEl?.focus();
  }

  /** Removes the listeners and ends a drag in progress. */
  destroy(): void {
    this.clearListeners();
    this.dragAbort?.();
    this.dragAbort = null;
  }

  private get renderer(): Renderer2 {
    return this.options.renderer;
  }

  private get lastValid(): KuiParsedColor {
    return this.options.color();
  }

  private get t(): KuiBoundMessages<KuiColorInputMessages> {
    return this.options.messages();
  }

  private render(): void {
    const panel = this.options.panel;

    this.clearListeners();
    panel.replaceChildren();

    this.pickerEl = this.renderer.createElement('div');
    this.renderer.addClass(this.pickerEl, 'kui-color-input-picker');
    this.renderer.setStyle(this.pickerEl, 'background', this.surfaceBackground());
    this.renderer.setAttribute(this.pickerEl, 'role', 'slider');
    this.renderer.setAttribute(this.pickerEl, 'tabindex', '0');
    this.renderer.setAttribute(this.pickerEl, 'aria-label', this.t.pickerLabel);
    this.renderer.setAttribute(this.pickerEl, 'aria-valuetext', this.lastValid.hex);

    this.thumbEl = this.renderer.createElement('span');
    this.renderer.addClass(this.thumbEl, 'kui-color-input-thumb');
    this.renderer.setStyle(
      this.thumbEl,
      'left',
      `${(this.lastValid.c / KUI_COLOR_INPUT_MAX_CHROMA) * 100}%`,
    );
    this.renderer.setStyle(this.thumbEl, 'top', `${(1 - this.lastValid.l) * 100}%`);
    this.renderer.setStyle(this.thumbEl, 'background', this.lastValid.hex);
    this.renderer.appendChild(this.pickerEl, this.thumbEl);
    this.renderer.appendChild(panel, this.pickerEl);

    this.unlisten.push(
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
    this.renderer.setAttribute(this.hueInputEl, 'aria-label', this.t.hue);
    this.renderer.setProperty(this.hueInputEl, 'value', String(Math.round(this.lastValid.h)));
    this.renderer.appendChild(hue, hueTrack);
    this.renderer.appendChild(hue, this.hueThumbEl);
    this.renderer.appendChild(hue, this.hueInputEl);
    this.renderer.appendChild(panel, hue);
    this.unlisten.push(
      this.renderer.listen(this.hueInputEl, 'input', () =>
        this.commitOklch(this.lastValid.l, this.lastValid.c, Number(this.hueInputEl!.value)),
      ),
    );

    this.renderNumberInputs(panel);
    this.renderPreviewRow(panel);
    this.renderPresets(panel);
    this.renderCopyButton(panel);
    this.built = true;
  }

  private update(): void {
    if (!this.pickerEl || !this.thumbEl || !this.hueThumbEl || !this.hueInputEl) return;
    const active = this.pickerEl.ownerDocument.activeElement;

    this.renderer.setStyle(this.pickerEl, 'background', this.surfaceBackground());
    this.renderer.setAttribute(this.pickerEl, 'aria-valuetext', this.lastValid.hex);
    this.renderer.setStyle(
      this.thumbEl,
      'left',
      `${(this.lastValid.c / KUI_COLOR_INPUT_MAX_CHROMA) * 100}%`,
    );
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

    this.unlisten.push(
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
    this.unlisten.push(
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
        [this.t.presetPrimary, seeds.primary],
        [this.t.presetNeutral, seeds.neutral],
        [this.t.presetSuccess, seeds.success],
        [this.t.presetWarning, seeds.warning],
        [this.t.presetDanger, seeds.danger],
        [this.t.presetInfo, seeds.info],
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
      const presetLabel = this.t.preset({ name, value: preset });
      this.renderer.setAttribute(btn, 'aria-label', presetLabel);
      this.renderer.setStyle(btn, 'background', preset);
      this.renderer.appendChild(row, btn);
      this.unlisten.push(
        this.renderer.listen(btn, 'click', () => this.commitText(preset)),
        this.renderer.listen(btn, 'mouseenter', () => this.options.showTooltip(btn, presetLabel)),
        this.renderer.listen(btn, 'mouseleave', () => this.options.hideTooltip()),
        this.renderer.listen(btn, 'focusin', () =>
          this.options.showTooltipOnFocus(btn, presetLabel),
        ),
        this.renderer.listen(btn, 'focusout', () => this.options.hideTooltip()),
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
    this.renderer.appendChild(btn, this.renderer.createText(this.t.copyValue));
    this.renderer.appendChild(panel, btn);
    this.unlisten.push(
      this.renderer.listen(btn, 'click', () => {
        void navigator.clipboard?.writeText(this.lastValid.hex).catch(() => undefined);
      }),
      this.renderer.listen(btn, 'mouseenter', () =>
        this.options.showTooltip(btn, this.t.copyValue),
      ),
      this.renderer.listen(btn, 'mouseleave', () => this.options.hideTooltip()),
      this.renderer.listen(btn, 'focusin', () =>
        this.options.showTooltipOnFocus(btn, this.t.copyValue),
      ),
      this.renderer.listen(btn, 'focusout', () => this.options.hideTooltip()),
    );
  }

  private handleSurfacePointer(event: PointerEvent): void {
    event.preventDefault();
    this.pickerEl?.setPointerCapture?.(event.pointerId);
    this.updateFromSurface(event.clientX, event.clientY);
    const view = this.options.panel.ownerDocument.defaultView;
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
    this.commitOklch(
      1 - y / rect.height,
      (x / rect.width) * KUI_COLOR_INPUT_MAX_CHROMA,
      this.lastValid.h,
    );
  }

  private handleSurfaceKeydown(event: KeyboardEvent): void {
    const stepC = KUI_COLOR_INPUT_MAX_CHROMA / 50;
    const stepL = 0.02;
    let { l, c } = this.lastValid;
    if (event.key === 'ArrowRight') c += stepC;
    else if (event.key === 'ArrowLeft') c -= stepC;
    else if (event.key === 'ArrowUp') l += stepL;
    else if (event.key === 'ArrowDown') l -= stepL;
    else if (event.key === 'Home') c = 0;
    else if (event.key === 'End') c = KUI_COLOR_INPUT_MAX_CHROMA;
    else return;
    event.preventDefault();
    this.commitOklch(l, c, this.lastValid.h);
  }

  private commitOklch(l: number, c: number, h: number): void {
    if (!Number.isFinite(l) || !Number.isFinite(c) || !Number.isFinite(h)) return;
    this.options.commit(normalizeOklch(l, c, h));
  }

  private commitText(value: string): void {
    const parsed = parseColor(value);
    if (!parsed) return;
    this.options.commit(parsed);
  }

  private surfaceBackground(): string {
    const hueColor = normalizeOklch(
      0.72,
      Math.min(this.lastValid.c || 0.2, KUI_COLOR_INPUT_MAX_CHROMA),
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

  private clearListeners(): void {
    this.options.hideTooltip();
    this.unlisten.forEach((fn) => fn());
    this.unlisten.length = 0;
  }
}

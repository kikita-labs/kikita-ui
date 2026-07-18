import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  DOCUMENT,
  Directive,
  DoCheck,
  ElementRef,
  OnDestroy,
  PLATFORM_ID,
  Renderer2,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
} from '@angular/core';

import { KuiSize } from '../../types';
import { injectKuiRootSizeDefault } from '../../utils/kui-defaults.util';
import { KuiFieldComponent } from '../field';

/** Layout of the increment/decrement controls. */
export type KuiNumberInputVariant = 'a' | 'b';

const PRESS_DELAY_MS = 400;
const PRESS_INTERVAL_MS = 80;

const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * Applies Kikita UI number-input styling and increment/decrement controls to a
 * native `input[type=number]` element.
 *
 * The directive wraps the native input in a `.kui-number-input` container and
 * injects minus / plus buttons. Native keyboard behavior (ArrowUp/Down, Home, End),
 * Angular forms (`NgModel`, `ReactiveFormsModule`), and `kui-field` wiring all
 * work without extra configuration.
 *
 * Press and hold a button for accelerating auto-increment (400 ms delay, 80 ms interval).
 *
 * @example
 * ```html
 * <input type="number" kuiNumberInput min="0" max="100" [(ngModel)]="qty" />
 *
 * <kui-field label="Count" hint="1-100">
 *   <input type="number" kuiNumberInput min="1" max="100" [(ngModel)]="qty" />
 * </kui-field>
 * ```
 */
@Directive({
  selector: 'input[type=number][kuiNumberInput]',
  host: {
    class: 'kui-number-input__input',
    '[attr.id]': 'inputId()',
    '[attr.aria-describedby]': 'describedBy()',
    '[attr.aria-invalid]': 'effectiveInvalid() ? "true" : null',
  },
})
export class KuiNumberInputDirective implements AfterViewInit, DoCheck, OnDestroy {
  /** Control height matched to `--kui-control-height-*` tokens. */
  readonly size = input<KuiSize | undefined>();

  /** Button layout: `b` = minus/plus on sides (recommended), `a` = stacked arrows on right. */
  readonly variant = input<KuiNumberInputVariant>('b');

  /** Applies error border. Also inherited from a parent `kui-field` with an error. */
  readonly invalidInput = input(false, { alias: 'invalid', transform: booleanAttribute });

  /** Id override for the native input. Falls back to the parent `kui-field` control id. */
  readonly id = input<string | undefined>();

  private readonly el = inject(ElementRef<HTMLInputElement>);
  private readonly renderer = inject(Renderer2);
  private readonly doc = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly field = inject(KuiFieldComponent, { optional: true, host: true });
  private readonly rootDefaultSize = injectKuiRootSizeDefault();

  /** @internal */
  protected readonly inputId = computed(() => this.id() ?? this.field?.controlId ?? null);

  /** @internal */
  protected readonly effectiveInvalid = computed(
    () => this.invalidInput() || Boolean(this.field?.invalid()),
  );

  /** @internal */
  protected readonly describedBy = computed(() => this.field?.describedBy() ?? null);
  protected readonly effectiveSize = computed(
    () => this.size() ?? this.field?.effectiveSize() ?? this.rootDefaultSize ?? 'md',
  );

  private containerEl!: HTMLElement;
  private decBtn!: HTMLElement;
  private incBtn!: HTMLElement;

  private _pressTimer: ReturnType<typeof setTimeout> | null = null;
  private _pressInterval: ReturnType<typeof setInterval> | null = null;
  private _unlisten: Array<() => void> = [];
  private _lastState = '';
  private readonly _isBrowser = isPlatformBrowser(this.platformId);

  constructor() {
    // Read signals before the guard so they are tracked as dependencies
    // even on the first run when containerEl is not yet built (same pattern as kuiSlider).
    effect(() => {
      const size = this.effectiveSize();
      const invalid = this.effectiveInvalid();
      if (!this.containerEl) return;

      this.renderer.setAttribute(this.containerEl, 'data-kui-size', size);

      if (invalid) {
        this.renderer.setAttribute(this.containerEl, 'data-kui-invalid', '');
      } else {
        this.renderer.removeAttribute(this.containerEl, 'data-kui-invalid');
      }
    });
  }

  ngAfterViewInit(): void {
    if (!this._isBrowser) return;
    this._buildDOM();
    this._syncState();
  }

  ngDoCheck(): void {
    if (!this.containerEl) return;
    const native = this.el.nativeElement;
    const state = `${native.min}|${native.max}|${native.value}|${native.disabled}|${native.readOnly}`;
    if (state === this._lastState) return;
    this._lastState = state;
    this._syncState();
  }

  ngOnDestroy(): void {
    this._clearPress();
    this._unlisten.forEach((fn) => fn());
    this._unlisten = [];
    this._teardownDOM();
  }

  private _buildDOM(): void {
    const native = this.el.nativeElement;

    // A hydrated client instance re-runs ngAfterViewInit on the same DOM a server-side instance
    // already wrapped; adopt that structure instead of wrapping it a second time.
    const existingContainer = native.parentElement;
    if (existingContainer?.classList.contains('kui-number-input')) {
      this._adoptDOM(existingContainer, native);
      return;
    }

    const parent = native.parentNode!;

    this.containerEl = this.renderer.createElement('div');
    this.renderer.addClass(this.containerEl, 'kui-number-input');
    if (this.variant() === 'a') {
      this.renderer.addClass(this.containerEl, 'kui-number-input--a');
    }
    this.renderer.setAttribute(this.containerEl, 'data-kui-size', this.effectiveSize());

    this.renderer.insertBefore(parent, this.containerEl, native);

    if (this.variant() === 'b') {
      this._buildVariantB(native);
    } else {
      this._buildVariantA(native);
    }

    this._unlisten.push(
      this.renderer.listen(native, 'input', () => this._syncState()),
      this.renderer.listen(native, 'change', () => this._syncState()),
    );
  }

  private _adoptDOM(container: HTMLElement, native: HTMLElement): void {
    this.containerEl = container;
    this.decBtn = container.querySelector<HTMLElement>(
      '.kui-number-input__btn--dec, .kui-number-input__arrow--dec',
    )!;
    this.incBtn = container.querySelector<HTMLElement>(
      '.kui-number-input__btn--inc, .kui-number-input__arrow--inc',
    )!;

    this._wirePressEvents(this.decBtn, () => this._step(-1));
    this._wirePressEvents(this.incBtn, () => this._step(1));
    this._unlisten.push(
      this.renderer.listen(native, 'input', () => this._syncState()),
      this.renderer.listen(native, 'change', () => this._syncState()),
    );
  }

  private _buildVariantB(native: HTMLElement): void {
    this.decBtn = this._createBtn(
      ['kui-number-input__btn', 'kui-number-input__btn--dec'],
      'Decrease value',
      this._createMinusIcon(),
    );
    this.renderer.appendChild(this.containerEl, this.decBtn);
    this.renderer.appendChild(this.containerEl, native);

    this.incBtn = this._createBtn(
      ['kui-number-input__btn', 'kui-number-input__btn--inc'],
      'Increase value',
      this._createPlusIcon(),
    );
    this.renderer.appendChild(this.containerEl, this.incBtn);

    this._wirePressEvents(this.decBtn, () => this._step(-1));
    this._wirePressEvents(this.incBtn, () => this._step(1));
  }

  private _buildVariantA(native: HTMLElement): void {
    this.renderer.appendChild(this.containerEl, native);

    const arrowsEl = this.renderer.createElement('div');
    this.renderer.addClass(arrowsEl, 'kui-number-input__arrows');

    this.incBtn = this._createBtn(
      ['kui-number-input__arrow', 'kui-number-input__arrow--inc'],
      'Increase value',
      this._createChevronIcon('up'),
    );
    this.renderer.appendChild(arrowsEl, this.incBtn);

    this.decBtn = this._createBtn(
      ['kui-number-input__arrow', 'kui-number-input__arrow--dec'],
      'Decrease value',
      this._createChevronIcon('down'),
    );
    this.renderer.appendChild(arrowsEl, this.decBtn);

    this.renderer.appendChild(this.containerEl, arrowsEl);

    this._wirePressEvents(this.decBtn, () => this._step(-1));
    this._wirePressEvents(this.incBtn, () => this._step(1));
  }

  private _wirePressEvents(btn: HTMLElement, fn: () => void): void {
    const start = () => {
      const native = this.el.nativeElement;
      if (native.disabled || native.readOnly) return;
      this._startPress(fn);
    };
    const end = () => this._clearPress();

    this._unlisten.push(
      this.renderer.listen(btn, 'mousedown', start),
      this.renderer.listen(btn, 'mouseup', end),
      this.renderer.listen(btn, 'mouseleave', end),
      this.renderer.listen(btn, 'touchstart', start),
      this.renderer.listen(btn, 'touchend', end),
      this.renderer.listen(btn, 'touchcancel', end),
      this.renderer.listen(btn, 'keydown', (event: KeyboardEvent) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        fn();
      }),
    );
  }

  private _syncState(): void {
    const native = this.el.nativeElement;
    const value = parseFloat(native.value);
    const min = native.min !== '' ? parseFloat(native.min) : undefined;
    const max = native.max !== '' ? parseFloat(native.max) : undefined;

    const atMin = min !== undefined && !isNaN(value) && value <= min;
    const atMax = max !== undefined && !isNaN(value) && value >= max;

    const controlDisabled = native.disabled || native.readOnly;

    this._setButtonDisabled(this.decBtn, controlDisabled || atMin);
    this._setButtonDisabled(this.incBtn, controlDisabled || atMax);

    // Reflect native disabled/readonly to container.
    if (native.disabled) {
      this.renderer.setAttribute(this.containerEl, 'data-kui-disabled', '');
    } else {
      this.renderer.removeAttribute(this.containerEl, 'data-kui-disabled');
    }

    if (native.readOnly) {
      this.renderer.setAttribute(this.containerEl, 'data-kui-readonly', '');
    } else {
      this.renderer.removeAttribute(this.containerEl, 'data-kui-readonly');
    }
  }

  private _setButtonDisabled(btn: HTMLElement, disabled: boolean): void {
    if (disabled) {
      this.renderer.setAttribute(btn, 'aria-disabled', 'true');
      this.renderer.setAttribute(btn, 'disabled', '');
    } else {
      this.renderer.removeAttribute(btn, 'aria-disabled');
      this.renderer.removeAttribute(btn, 'disabled');
    }
  }

  private _step(direction: 1 | -1): void {
    const native = this.el.nativeElement;
    if (native.disabled || native.readOnly) return;

    const current = parseFloat(native.value) || 0;
    const step = parseFloat(native.step) || 1;
    const min = native.min !== '' ? parseFloat(native.min) : undefined;
    const max = native.max !== '' ? parseFloat(native.max) : undefined;

    // Prevent stepping past the boundary.
    if (direction === -1 && min !== undefined && current <= min) return;
    if (direction === 1 && max !== undefined && current >= max) return;

    let next = current + direction * step;
    if (min !== undefined) next = Math.max(min, next);
    if (max !== undefined) next = Math.min(max, next);

    native.value = String(next);
    // Dispatch input event so Angular forms and listeners are notified.
    native.dispatchEvent(new Event('input', { bubbles: true }));
    this._syncState();
  }

  private _startPress(fn: () => void): void {
    fn();
    this._pressTimer = setTimeout(() => {
      this._pressInterval = setInterval(fn, PRESS_INTERVAL_MS);
    }, PRESS_DELAY_MS);
  }

  private _clearPress(): void {
    if (this._pressTimer !== null) {
      clearTimeout(this._pressTimer);
      this._pressTimer = null;
    }
    if (this._pressInterval !== null) {
      clearInterval(this._pressInterval);
      this._pressInterval = null;
    }
  }

  private _createBtn(classes: string[], label: string, icon: Element): HTMLElement {
    const btn: HTMLElement = this.renderer.createElement('button');
    classes.forEach((c) => this.renderer.addClass(btn, c));
    this.renderer.setAttribute(btn, 'type', 'button');
    this.renderer.setAttribute(btn, 'aria-label', label);
    this.renderer.appendChild(btn, icon);
    return btn;
  }

  private _createSvg(viewBox: string): Element {
    const svg = this.doc.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', viewBox);
    svg.setAttribute('fill', 'none');
    svg.setAttribute('aria-hidden', 'true');
    // Rendered size is controlled by CSS (--_icon or explicit width/height on the element).
    svg.setAttribute('width', '1em');
    svg.setAttribute('height', '1em');
    return svg;
  }

  private _createLine(attrs: Record<string, string>): Element {
    const el = this.doc.createElementNS(SVG_NS, 'line');
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    return el;
  }

  private _createPolyline(points: string): Element {
    const el = this.doc.createElementNS(SVG_NS, 'polyline');
    el.setAttribute('points', points);
    el.setAttribute('stroke', 'currentColor');
    el.setAttribute('stroke-width', '1.5');
    el.setAttribute('stroke-linecap', 'round');
    el.setAttribute('stroke-linejoin', 'round');
    return el;
  }

  private _createMinusIcon(): Element {
    const svg = this._createSvg('0 0 12 12');
    svg.appendChild(
      this._createLine({
        x1: '2.5',
        y1: '6',
        x2: '9.5',
        y2: '6',
        stroke: 'currentColor',
        'stroke-width': '1.5',
        'stroke-linecap': 'round',
      }),
    );
    return svg;
  }

  private _createPlusIcon(): Element {
    const svg = this._createSvg('0 0 12 12');
    svg.appendChild(
      this._createLine({
        x1: '6',
        y1: '2.5',
        x2: '6',
        y2: '9.5',
        stroke: 'currentColor',
        'stroke-width': '1.5',
        'stroke-linecap': 'round',
      }),
    );
    svg.appendChild(
      this._createLine({
        x1: '2.5',
        y1: '6',
        x2: '9.5',
        y2: '6',
        stroke: 'currentColor',
        'stroke-width': '1.5',
        'stroke-linecap': 'round',
      }),
    );
    return svg;
  }

  private _createChevronIcon(direction: 'up' | 'down'): Element {
    const svg = this._createSvg('0 0 8 8');
    svg.appendChild(this._createPolyline(direction === 'up' ? '1,6 4,2.5 7,6' : '1,2 4,5.5 7,2'));
    return svg;
  }

  private _teardownDOM(): void {
    if (!this.containerEl) return;

    const native = this.el.nativeElement;
    const parent = this.containerEl.parentNode;

    if (!parent) return;

    if (native.parentNode === this.containerEl) {
      this.renderer.insertBefore(parent, native, this.containerEl);
    }

    this.renderer.removeChild(parent, this.containerEl);
  }
}

import {
  AfterViewInit,
  DOCUMENT,
  Directive,
  DoCheck,
  ElementRef,
  OnDestroy,
  Renderer2,
  booleanAttribute,
  effect,
  inject,
  input,
} from '@angular/core';

import { KuiTooltipDirective } from '../tooltip/kui-tooltip.directive';

/** Semantic color used by `kuiSlider`. */
export type KuiSliderColor = 'primary' | 'success' | 'danger' | 'neutral';

/** Size token used by `kuiSlider`. */
export type KuiSliderSize = 'sm' | 'md' | 'lg';

const TOOLTIP_GAP = 6;

@Directive({
  selector: 'input[type=range][kuiSlider]',
  host: {
    '(input)': 'updateFill()',
    '(mouseenter)': 'onMouseEnter()',
    '(mouseleave)': 'onMouseLeave()',
  },
})
export class KuiSliderDirective implements AfterViewInit, DoCheck, OnDestroy {
  private readonly el = inject(ElementRef<HTMLInputElement>);
  private readonly renderer = inject(Renderer2);
  private readonly doc = inject(DOCUMENT);
  // If user adds [kuiTooltip]="'static text'", we defer to it; empty = value mode.
  private readonly kuiTooltip = inject(KuiTooltipDirective, { optional: true, self: true });

  /** Semantic color applied to the generated slider fill and thumb. */
  readonly color = input<KuiSliderColor>('primary');

  /** Visual size of the generated slider control. */
  readonly size = input<KuiSliderSize>('md');

  /** Optional label rendered below the minimum side of the slider. */
  readonly minLabel = input<string>('');

  /** Optional label rendered below the maximum side of the slider. */
  readonly maxLabel = input<string>('');

  /** Mirrors disabled state onto the generated slider container. */
  readonly disabled = input(false, { transform: booleanAttribute });

  private containerEl!: HTMLElement;
  private fillEl!: HTMLElement;
  private thumbEl!: HTMLElement;
  private labelsEl: HTMLElement | null = null;
  private tooltipEl: HTMLElement | null = null;
  private tooltipVisible = false;
  private lastNativeState = '';

  constructor() {
    effect(() => {
      const color = this.color();
      const size = this.size();
      if (!this.containerEl) return;
      this.renderer.setAttribute(this.containerEl, 'data-kui-color', color);
      this.renderer.setAttribute(this.containerEl, 'data-kui-size', size);
    });

    effect(() => {
      const min = this.minLabel();
      const max = this.maxLabel();
      if (!this.containerEl) return;
      if ((min || max) && !this.labelsEl) {
        this.labelsEl = this.renderer.createElement('div');
        this.renderer.addClass(this.labelsEl, 'kui-slider-labels');
        const spanMin: HTMLElement = this.renderer.createElement('span');
        const spanMax: HTMLElement = this.renderer.createElement('span');
        spanMin.textContent = min;
        spanMax.textContent = max;
        this.renderer.appendChild(this.labelsEl, spanMin);
        this.renderer.appendChild(this.labelsEl, spanMax);
        this.renderer.appendChild(this.containerEl, this.labelsEl);
      } else if (!min && !max && this.labelsEl) {
        this.renderer.removeChild(this.containerEl, this.labelsEl);
        this.labelsEl = null;
      } else if (this.labelsEl) {
        const spans = this.labelsEl.querySelectorAll('span');
        if (spans[0]) spans[0].textContent = min;
        if (spans[1]) spans[1].textContent = max;
      }
    });
  }

  ngAfterViewInit(): void {
    this.buildDOM();
    this.updateFill();
  }

  ngDoCheck(): void {
    if (!this.containerEl) return;
    const native = this.el.nativeElement;
    const state = `${native.min}|${native.max}|${native.value}|${native.disabled}`;
    if (state === this.lastNativeState) return;
    this.lastNativeState = state;
    this.updateFill();
    if (native.disabled) {
      this.renderer.setAttribute(this.containerEl, 'data-kui-disabled', 'true');
    } else {
      this.renderer.removeAttribute(this.containerEl, 'data-kui-disabled');
    }
  }

  ngOnDestroy(): void {
    this.destroyTooltip();
  }

  protected onMouseEnter(): void {
    // If kuiTooltip has static text, let it handle display and skip value tooltip.
    if (this.kuiTooltip?.kuiTooltip()) return;
    this.tooltipVisible = true;
    this.ensureTooltip();
  }

  protected onMouseLeave(): void {
    this.tooltipVisible = false;
    this.destroyTooltip();
  }

  protected updateFill(): void {
    if (!this.fillEl) return;
    const native = this.el.nativeElement;
    const min = Number(native.min) || 0;
    const max = Number(native.max) || 100;
    const val = Number(native.value) || 0;
    const pct = max === min ? '0%' : `${((val - min) / (max - min)) * 100}%`;
    this.renderer.setStyle(this.fillEl, 'width', pct);
    this.renderer.setStyle(this.thumbEl, 'left', pct);

    if (this.tooltipVisible) {
      this.ensureTooltip();
      if (this.tooltipEl) {
        this.renderer.setProperty(this.tooltipEl, 'textContent', String(Math.round(val)));
        this.positionOverThumb();
      }
    }
  }

  private ensureTooltip(): void {
    if (this.tooltipEl) {
      this.positionOverThumb();
      return;
    }
    const val = Math.round(Number(this.el.nativeElement.value) || 0);
    const el: HTMLElement = this.renderer.createElement('div');
    this.renderer.setAttribute(el, 'role', 'tooltip');
    this.renderer.addClass(el, 'kui-tooltip');
    this.renderer.setAttribute(el, 'data-kui-placement', 'top');
    this.renderer.setProperty(el, 'textContent', String(val));
    this.renderer.appendChild(this.doc.body, el);
    this.tooltipEl = el;
    // Position after a microtask so the element has rendered dimensions.
    Promise.resolve().then(() => this.positionOverThumb());
  }

  private positionOverThumb(): void {
    const tip = this.tooltipEl;
    if (!tip || !this.thumbEl) return;
    const thumbRect = this.thumbEl.getBoundingClientRect();
    const { width: tipW, height: tipH } = tip.getBoundingClientRect();
    const top = thumbRect.top - tipH - TOOLTIP_GAP;
    const left = thumbRect.left + thumbRect.width / 2 - tipW / 2;
    this.renderer.setStyle(tip, 'top', `${Math.round(top)}px`);
    this.renderer.setStyle(tip, 'left', `${Math.round(left)}px`);
  }

  private destroyTooltip(): void {
    if (!this.tooltipEl) return;
    const el = this.tooltipEl;
    this.tooltipEl = null;
    this.renderer.addClass(el, 'is-hiding');
    let removed = false;
    const remove = () => {
      if (!removed && el.parentNode) {
        removed = true;
        this.renderer.removeChild(this.doc.body, el);
      }
    };
    el.addEventListener('animationend', remove, { once: true });
    setTimeout(remove, 200);
  }

  private buildDOM(): void {
    const native = this.el.nativeElement;
    const parent = native.parentNode!;

    this.containerEl = this.renderer.createElement('div');
    this.renderer.addClass(this.containerEl, 'kui-slider');

    const trackEl: HTMLElement = this.renderer.createElement('div');
    this.renderer.addClass(trackEl, 'kui-slider-track');

    this.fillEl = this.renderer.createElement('div');
    this.renderer.addClass(this.fillEl, 'kui-slider-fill');

    this.thumbEl = this.renderer.createElement('div');
    this.renderer.addClass(this.thumbEl, 'kui-slider-thumb');

    this.renderer.addClass(native, 'kui-slider-native');

    this.renderer.appendChild(trackEl, this.fillEl);
    this.renderer.appendChild(trackEl, this.thumbEl);

    this.renderer.insertBefore(parent, this.containerEl, native);
    this.renderer.appendChild(this.containerEl, native);
    this.renderer.appendChild(this.containerEl, trackEl);

    const color = this.color();
    const size = this.size();
    this.renderer.setAttribute(this.containerEl, 'data-kui-color', color);
    this.renderer.setAttribute(this.containerEl, 'data-kui-size', size);
    if (native.disabled) {
      this.renderer.setAttribute(this.containerEl, 'data-kui-disabled', 'true');
    }
    this.lastNativeState = `${native.min}|${native.max}|${native.value}|${native.disabled}`;
  }
}

import {
  AfterViewInit,
  Directive,
  ElementRef,
  Renderer2,
  booleanAttribute,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';

export type KuiSliderColor = 'primary' | 'success' | 'danger' | 'neutral';
export type KuiSliderSize = 'sm' | 'md' | 'lg';

@Directive({
  selector: 'input[type=range][kuiSlider]',
  host: {
    '(input)': 'updateFill()',
    '(mousedown)': 'isDragging.set(true)',
    '(mouseup)': 'isDragging.set(false)',
    '(focus)': 'isFocused.set(true)',
    '(blur)': 'isFocused.set(false)',
  },
})
export class KuiSliderDirective implements AfterViewInit {
  private readonly el = inject(ElementRef<HTMLInputElement>);
  private readonly renderer = inject(Renderer2);

  readonly color = input<KuiSliderColor>('primary');
  readonly size = input<KuiSliderSize>('md');
  readonly minLabel = input<string>('');
  readonly maxLabel = input<string>('');
  readonly showTooltip = input(false, { transform: booleanAttribute });

  protected readonly isDragging = signal(false);
  protected readonly isFocused = signal(false);
  protected readonly isHovering = signal(false);

  private containerEl!: HTMLElement;
  private trackEl!: HTMLElement;
  private fillEl!: HTMLElement;
  private thumbEl!: HTMLElement;
  private tooltipEl: HTMLElement | null = null;
  private labelsEl: HTMLElement | null = null;

  constructor() {
    // Read signals BEFORE the null-guard so Angular tracks them on every run.
    effect(() => {
      const color = this.color();
      const size = this.size();
      if (!this.containerEl) return;
      this.renderer.setAttribute(this.containerEl, 'data-kui-color', color);
      this.renderer.setAttribute(this.containerEl, 'data-kui-size', size);
      const native = this.el.nativeElement;
      if (native.disabled) {
        this.renderer.setAttribute(this.containerEl, 'data-kui-disabled', 'true');
      } else {
        this.renderer.removeAttribute(this.containerEl, 'data-kui-disabled');
      }
    });

    effect(() => {
      const visible = (this.isDragging() || this.isHovering()) && this.showTooltip();
      if (!this.containerEl) return;
      if (visible && !this.tooltipEl) {
        this.tooltipEl = this.renderer.createElement('div');
        this.renderer.addClass(this.tooltipEl, 'kui-slider-tooltip');
        const text: HTMLElement = this.renderer.createElement('div');
        this.renderer.addClass(text, 'kui-slider-tooltip-text');
        text.textContent = String(Math.round(Number(this.el.nativeElement.value) || 0));
        const arrow: HTMLElement = this.renderer.createElement('div');
        this.renderer.addClass(arrow, 'kui-slider-tooltip-arrow');
        this.renderer.appendChild(this.tooltipEl, text);
        this.renderer.appendChild(this.tooltipEl, arrow);
        this.renderer.appendChild(this.thumbEl, this.tooltipEl);
      } else if (!visible && this.tooltipEl) {
        this.renderer.removeChild(this.thumbEl, this.tooltipEl);
        this.tooltipEl = null;
      }
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

  protected updateFill(): void {
    if (!this.fillEl) return;
    const native = this.el.nativeElement;
    const min = Number(native.min) || 0;
    const max = Number(native.max) || 100;
    const val = Number(native.value) || 0;
    const pct = max === min ? '0%' : `${((val - min) / (max - min)) * 100}%`;
    this.renderer.setStyle(this.fillEl, 'width', pct);
    this.renderer.setStyle(this.thumbEl, 'left', pct);
    if (this.tooltipEl) {
      const text = this.tooltipEl.querySelector('.kui-slider-tooltip-text');
      if (text) text.textContent = String(Math.round(val));
    }
  }

  private buildDOM(): void {
    const native = this.el.nativeElement;
    const parent = native.parentNode!;

    this.containerEl = this.renderer.createElement('div');
    this.renderer.addClass(this.containerEl, 'kui-slider');

    this.trackEl = this.renderer.createElement('div');
    this.renderer.addClass(this.trackEl, 'kui-slider-track');

    this.fillEl = this.renderer.createElement('div');
    this.renderer.addClass(this.fillEl, 'kui-slider-fill');

    this.thumbEl = this.renderer.createElement('div');
    this.renderer.addClass(this.thumbEl, 'kui-slider-thumb');

    this.renderer.addClass(native, 'kui-slider-native');

    this.renderer.appendChild(this.trackEl, this.fillEl);
    this.renderer.appendChild(this.trackEl, this.thumbEl);

    // Insert container before native in DOM, then move native inside container
    // Native is FIRST child (before track) so CSS sibling selectors work:
    // .kui-slider-native:hover ~ .kui-slider-track .kui-slider-thumb
    this.renderer.insertBefore(parent, this.containerEl, native);
    this.renderer.appendChild(this.containerEl, native);
    this.renderer.appendChild(this.containerEl, this.trackEl);

    this.renderer.listen(this.containerEl, 'mouseenter', () => this.isHovering.set(true));
    this.renderer.listen(this.containerEl, 'mouseleave', () => {
      this.isHovering.set(false);
      this.isDragging.set(false);
    });

    // Trigger effects now that containerEl exists
    const color = this.color();
    const size = this.size();
    this.renderer.setAttribute(this.containerEl, 'data-kui-color', color);
    this.renderer.setAttribute(this.containerEl, 'data-kui-size', size);
    if (native.disabled) {
      this.renderer.setAttribute(this.containerEl, 'data-kui-disabled', 'true');
    }
  }
}

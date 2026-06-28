import {
  Directive,
  ElementRef,
  Renderer2,
  booleanAttribute,
  effect,
  inject,
  input,
  signal,
  AfterViewInit,
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
  private fillEl!: HTMLElement;
  private thumbEl!: HTMLElement;
  private tooltipEl: HTMLElement | null = null;
  private labelsEl: HTMLElement | null = null;

  constructor() {
    effect(() => this.syncDataAttrs());
    effect(() => this.syncTooltip());
    effect(() => this.syncLabels());
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
    this.renderer.appendChild(this.containerEl, trackEl);
    this.renderer.appendChild(trackEl, native);

    this.renderer.listen(this.containerEl, 'mouseenter', () => this.isHovering.set(true));
    this.renderer.listen(this.containerEl, 'mouseleave', () => {
      this.isHovering.set(false);
      this.isDragging.set(false);
    });

    this.syncDataAttrs();
    this.syncLabels();
  }

  private syncDataAttrs(): void {
    if (!this.containerEl) return;
    const native = this.el.nativeElement;
    this.renderer.setAttribute(this.containerEl, 'data-kui-color', this.color());
    this.renderer.setAttribute(this.containerEl, 'data-kui-size', this.size());

    if (native.disabled) {
      this.renderer.setAttribute(this.containerEl, 'data-kui-disabled', 'true');
    } else {
      this.renderer.removeAttribute(this.containerEl, 'data-kui-disabled');
    }
  }

  private syncTooltip(): void {
    if (!this.containerEl) return;
    const visible = (this.isDragging() || this.isHovering()) && this.showTooltip();

    if (visible && !this.tooltipEl) {
      this.tooltipEl = this.renderer.createElement('div');
      this.renderer.addClass(this.tooltipEl!, 'kui-slider-tooltip');

      const text: HTMLElement = this.renderer.createElement('div');
      this.renderer.addClass(text, 'kui-slider-tooltip-text');
      const native = this.el.nativeElement;
      text.textContent = String(Math.round(Number(native.value) || 0));

      const arrow: HTMLElement = this.renderer.createElement('div');
      this.renderer.addClass(arrow, 'kui-slider-tooltip-arrow');

      this.renderer.appendChild(this.tooltipEl!, text);
      this.renderer.appendChild(this.tooltipEl!, arrow);
      this.renderer.appendChild(this.thumbEl, this.tooltipEl!);
    } else if (!visible && this.tooltipEl) {
      this.renderer.removeChild(this.thumbEl, this.tooltipEl);
      this.tooltipEl = null;
    }
  }

  private syncLabels(): void {
    if (!this.containerEl) return;
    const min = this.minLabel();
    const max = this.maxLabel();

    if ((min || max) && !this.labelsEl) {
      this.labelsEl = this.renderer.createElement('div');
      this.renderer.addClass(this.labelsEl!, 'kui-slider-labels');
      const spanMin: HTMLElement = this.renderer.createElement('span');
      const spanMax: HTMLElement = this.renderer.createElement('span');
      spanMin.textContent = min;
      spanMax.textContent = max;
      this.renderer.appendChild(this.labelsEl!, spanMin);
      this.renderer.appendChild(this.labelsEl!, spanMax);
      this.renderer.appendChild(this.containerEl, this.labelsEl!);
    } else if (!min && !max && this.labelsEl) {
      this.renderer.removeChild(this.containerEl, this.labelsEl);
      this.labelsEl = null;
    } else if (this.labelsEl) {
      const spans = this.labelsEl.querySelectorAll('span');
      if (spans[0]) spans[0].textContent = min;
      if (spans[1]) spans[1].textContent = max;
    }
  }
}

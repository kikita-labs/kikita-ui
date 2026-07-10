import { Overlay } from '@angular/cdk/overlay';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Directive,
  DoCheck,
  ElementRef,
  HostListener,
  OnDestroy,
  PLATFORM_ID,
  Renderer2,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
} from '@angular/core';

import { KuiFieldComponent } from '../field';
import { KuiTooltipDirective } from '../tooltip/kui-tooltip.directive';
import {
  createKuiTooltipOverlay,
  KuiTooltipOverlayHandle,
} from '../../utils/kui-tooltip-overlay.util';

/** Semantic color used by `kuiSlider`. */
export type KuiSliderColor = 'primary' | 'success' | 'danger' | 'neutral';

/** Size token used by `kuiSlider`. */
export type KuiSliderSize = 'sm' | 'md' | 'lg';

@Directive({
  selector: 'input[type=range][kuiSlider]',
  host: {
    '[attr.id]': 'hostId()',
    '[attr.aria-describedby]': 'describedBy()',
    '[attr.aria-invalid]': 'effectiveInvalid() ? "true" : null',
    '(input)': 'updateFill()',
    '(mouseenter)': 'onMouseEnter()',
    '(mouseleave)': 'onMouseLeave()',
  },
})
export class KuiSliderDirective implements AfterViewInit, DoCheck, OnDestroy {
  private readonly el = inject(ElementRef<HTMLInputElement>);
  private readonly renderer = inject(Renderer2);
  private readonly overlay = inject(Overlay);
  private readonly doc = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly field = inject(KuiFieldComponent, { optional: true, host: true });
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

  /** Marks the slider as invalid outside a `kui-field` error state. */
  readonly invalidInput = input(false, { alias: 'invalid', transform: booleanAttribute });

  /** Explicit id override. If omitted inside `kui-field`, the field id is used. */
  readonly id = input<string | undefined>();

  /** @internal */
  protected readonly hostId = computed(() => this.id() ?? this.field?.controlId ?? null);

  /** @internal */
  protected readonly effectiveInvalid = computed(
    () => this.invalidInput() || Boolean(this.field?.invalid()),
  );

  /** @internal */
  protected readonly describedBy = computed(() => this.field?.describedBy() ?? null);

  private containerEl!: HTMLElement;
  private fillEl!: HTMLElement;
  private thumbEl!: HTMLElement;
  private labelsEl: HTMLElement | null = null;
  private tooltipOverlay: KuiTooltipOverlayHandle | null = null;
  private tooltipVisible = false;
  private lastNativeState = '';
  private scrollUnlisten: (() => void) | null = null;

  constructor() {
    effect(() => {
      const color = this.color();
      const size = this.size();
      const invalid = this.effectiveInvalid();
      if (!this.containerEl) return;
      this.syncContainerState(color, size, invalid);
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
    if (!this.isBrowser) return;
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
    this.stopScrollTracking();
    this.destroyTooltip();
  }

  protected onMouseEnter(): void {
    // If kuiTooltip has static text, let it handle display and skip value tooltip.
    if (!this.isBrowser) return;
    if (this.kuiTooltip?.kuiTooltip()) return;
    this.tooltipVisible = true;
    this.startScrollTracking();
    this.ensureTooltip();
  }

  protected onMouseLeave(): void {
    this.tooltipVisible = false;
    this.stopScrollTracking();
    this.destroyTooltip();
  }

  @HostListener('mousemove')
  protected onMouseMove(): void {
    if (this.tooltipVisible) {
      this.tooltipOverlay?.updatePosition();
    }
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
      const hadTooltip = Boolean(this.tooltipOverlay);
      this.ensureTooltip();
      this.tooltipOverlay?.updateText(String(Math.round(val)));
      if (hadTooltip) {
        this.tooltipOverlay?.updatePosition();
      }
    }
  }

  private ensureTooltip(): void {
    if (this.tooltipOverlay) {
      this.tooltipOverlay.updatePosition();
      return;
    }
    const val = Math.round(Number(this.el.nativeElement.value) || 0);
    this.tooltipOverlay = createKuiTooltipOverlay({
      anchor: this.thumbEl,
      overlay: this.overlay,
      placement: 'top',
      text: String(val),
    });
  }

  private destroyTooltip(): void {
    if (!this.tooltipOverlay) return;
    const { overlayRef, tooltipEl } = this.tooltipOverlay;
    this.tooltipOverlay = null;
    this.renderer.addClass(tooltipEl, 'is-hiding');
    let removed = false;
    const remove = () => {
      if (!removed) {
        removed = true;
        overlayRef.dispose();
      }
    };
    tooltipEl.addEventListener('animationend', remove, { once: true });
    setTimeout(remove, 200);
  }

  private startScrollTracking(): void {
    if (this.scrollUnlisten) return;
    const handler = (): void => {
      if (this.tooltipVisible) {
        this.tooltipOverlay?.updatePosition();
      }
    };
    this.doc.addEventListener('scroll', handler, { capture: true, passive: true });
    this.scrollUnlisten = () => {
      this.doc.removeEventListener('scroll', handler, { capture: true });
      this.scrollUnlisten = null;
    };
  }

  private stopScrollTracking(): void {
    this.scrollUnlisten?.();
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
    this.syncContainerState(color, size, this.effectiveInvalid());
    if (native.disabled) {
      this.renderer.setAttribute(this.containerEl, 'data-kui-disabled', 'true');
    }
    this.lastNativeState = `${native.min}|${native.max}|${native.value}|${native.disabled}`;
  }

  private syncContainerState(color: KuiSliderColor, size: KuiSliderSize, invalid: boolean): void {
    this.renderer.setAttribute(this.containerEl, 'data-kui-color', color);
    this.renderer.setAttribute(this.containerEl, 'data-kui-size', size);

    if (invalid) {
      this.renderer.setAttribute(this.containerEl, 'data-kui-invalid', '');
    } else {
      this.renderer.removeAttribute(this.containerEl, 'data-kui-invalid');
    }
  }
}

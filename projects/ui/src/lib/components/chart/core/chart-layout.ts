import { isPlatformBrowser } from '@angular/common';
import {
  afterNextRender,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  PLATFORM_ID,
  signal,
} from '@angular/core';

/** The font of the axis text, as the browser resolved it from the chart styles. */
export interface KuiChartFont {
  /** Size in CSS pixels. */
  readonly size: number;

  /** Font family list. */
  readonly family: string;

  /** Font weight. */
  readonly weight: string;
}

/** Used until the browser has told the real axis font: the default of `--kui-text-sm-size`. */
export const KUI_CHART_DEFAULT_FONT: KuiChartFont = {
  size: 13,
  family: 'sans-serif',
  weight: '400',
};

/** Used until the browser has told the real mark radius: the default of `--kui-chart-point-radius`. */
export const KUI_CHART_DEFAULT_MARK_RADIUS = 4;

/** Used until the browser has told the real bar radius: the default of `--kui-radius-xs`. */
export const KUI_CHART_DEFAULT_BAR_RADIUS = 4;

/** Average advance of a glyph in `em`, used where the browser cannot measure (the server). */
export const KUI_CHART_ESTIMATED_GLYPH_EM = 0.6;

/** Options of {@link KuiChartLayout}. */
export interface KuiChartLayoutOptions {
  /** The width a chart gets on the server and before the first measurement. */
  readonly nominalWidth: () => number;
}

/**
 * What a chart needs to lay itself out in real pixels: the width of its container, the font of its
 * axis text and the width of a piece of text in that font. A plain object created in the injection
 * context of the chart, like `KuiChartSession`.
 *
 * The server and the first client render use `nominalWidth`, so hydration finds the markup it
 * expects. After the first render the container is measured with a `ResizeObserver` and the axis font
 * and the mark radius are read from the probe `<text class="kui-chart__axis-probe">` the chart renders; both are signals,
 * so the chart lays itself out once more at the measured size. One user unit then equals one CSS
 * pixel, which keeps text, strokes and marks at their real size instead of scaling them with the
 * chart.
 */
export class KuiChartLayout {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly measuredWidth = signal<number | null>(null);
  private readonly cache = new Map<string, number>();
  private context: CanvasRenderingContext2D | null | undefined;
  private observer: ResizeObserver | null = null;
  private frame: ReturnType<typeof requestAnimationFrame> | null = null;

  /** The font of the axis text. */
  readonly font = signal<KuiChartFont>(KUI_CHART_DEFAULT_FONT);

  /** The radius of a mark in pixels, from `--kui-chart-point-radius`. */
  readonly markRadius = signal(KUI_CHART_DEFAULT_MARK_RADIUS);

  /** The rounding of the end of a bar in pixels, from `--kui-chart-bar-radius`. */
  readonly barRadius = signal(KUI_CHART_DEFAULT_BAR_RADIUS);

  /** The width of the chart: the measured container, or the nominal width before that. */
  readonly width = computed(() => this.measuredWidth() ?? this.options.nominalWidth());

  /** `true` once the browser has measured the container, so text is measured with real glyphs. */
  readonly measured = computed(() => this.measuredWidth() !== null);

  constructor(private readonly options: KuiChartLayoutOptions) {
    afterNextRender(() => this.start());
    inject(DestroyRef).onDestroy(() => this.stop());
  }

  /**
   * Width of `text` in the axis font. Measured with a canvas once the chart is on screen, estimated
   * from the character count before that (and on the server), so the first render never depends on
   * the browser.
   */
  textWidth(text: string): number {
    if (text.length === 0) return 0;

    const font = this.font();

    if (!this.measured()) return text.length * font.size * KUI_CHART_ESTIMATED_GLYPH_EM;

    const key = `${font.weight} ${font.size}px ${font.family}|${text}`;
    const cached = this.cache.get(key);
    if (cached !== undefined) return cached;

    const context = this.measureContext();
    if (!context) return text.length * font.size * KUI_CHART_ESTIMATED_GLYPH_EM;

    context.font = `${font.weight} ${font.size}px ${font.family}`;
    const width = context.measureText(text).width;
    this.cache.set(key, width);

    return width;
  }

  /** Reads the container width and the axis font now. Called by the observer and after a render. */
  refresh(): void {
    const width = Math.floor(this.host.getBoundingClientRect().width);

    // A container that is not laid out (`display: none`, a closed tab) measures 0; keep what we had.
    if (width > 0 && width !== this.measuredWidth()) this.measuredWidth.set(width);

    this.readFont();
  }

  private start(): void {
    if (!this.isBrowser) return;

    this.refresh();

    if (typeof ResizeObserver === 'undefined') return;

    this.observer = new ResizeObserver(() => {
      if (this.frame !== null) cancelAnimationFrame(this.frame);
      this.frame = requestAnimationFrame(() => {
        this.frame = null;
        this.refresh();
      });
    });
    this.observer.observe(this.host);
  }

  private stop(): void {
    this.observer?.disconnect();
    this.observer = null;
    if (this.frame !== null) cancelAnimationFrame(this.frame);
    this.frame = null;
  }

  private readBarRadius(): void {
    const probe = this.host.querySelector('.kui-chart__bar-probe');
    if (!probe) return;

    const radius = Number.parseFloat(getComputedStyle(probe).getPropertyValue('rx'));
    if (Number.isFinite(radius) && radius >= 0 && radius !== this.barRadius()) {
      this.barRadius.set(radius);
    }
  }

  private readFont(): void {
    this.readBarRadius();
    const probe = this.host.querySelector('.kui-chart__axis-probe');
    if (!probe) return;

    const style = getComputedStyle(probe);
    const radius = Number.parseFloat(style.getPropertyValue('--kui-chart-point-radius'));
    if (Number.isFinite(radius) && radius > 0 && radius !== this.markRadius()) {
      this.markRadius.set(radius);
    }

    const size = Number.parseFloat(style.fontSize);
    if (!Number.isFinite(size) || size <= 0) return;

    const next: KuiChartFont = { size, family: style.fontFamily, weight: style.fontWeight };
    const current = this.font();

    if (
      next.size !== current.size ||
      next.family !== current.family ||
      next.weight !== current.weight
    ) {
      this.cache.clear();
      this.font.set(next);
    }
  }

  private measureContext(): CanvasRenderingContext2D | null {
    if (this.context === undefined) {
      this.context = this.host.ownerDocument.createElement('canvas').getContext('2d');
    }

    return this.context;
  }
}

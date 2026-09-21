import { Overlay } from '@angular/cdk/overlay';
import {
  booleanAttribute,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  PLATFORM_ID,
  signal,
  viewChildren,
  ViewEncapsulation,
} from '@angular/core';

import { KuiButtonDirective } from '../button';
import {
  KuiCellDirective,
  KuiRowDirective,
  KuiTableDirective,
  KuiThDirective,
  KuiThGroupDirective,
} from '../table';
import type {
  KuiChartAxesOptions,
  KuiChartLegendItem,
  KuiChartLegendSource,
  KuiChartPoint,
  KuiChartScatterSeries,
  KuiChartTooltipFormatter,
  KuiChartValueFormat,
} from './chart.types';
import { computeRovingIndex } from './chart-keyboard-nav.util';
import { normalizeScatterSeries } from './chart-normalize.util';
import {
  computeLoadingGridLines,
  computeNiceScale,
  computeScatterDomain,
  formatCompact,
} from './chart-scale.util';
import { isTouchPointerType, KuiChartTooltipController } from './chart-tooltip.util';

let nextScatterChartId = 0;

/** See the matching constant's JSDoc in `kui-line-chart.component.ts` -- same rationale. */
const SIZE_DIMENSIONS = {
  sm: { width: 320, height: 200 },
  md: { width: 480, height: 280 },
  lg: { width: 640, height: 360 },
} as const;

/** See the matching constant's JSDoc in `kui-line-chart.component.ts` -- same rationale. Both
 * axes here are always numeric (no category text labels, unlike `kui-bar-chart` horizontal), so
 * `left` does not need the orientation-aware widening `kui-bar-chart` has. */
const PADDING = { top: 8, right: 8, bottom: 24, left: 32 };

/** Dot positions (fraction 0..1 of the plot area) for the scatter-chart skeleton -- a loose
 * scattered cluster, matching the chart's own visual language (points, not a line/bars). See
 * `kui-line-chart`'s `LOADING_WAVE_RATIOS` doc for why every chart type invents its own shape and
 * why fractions of the plot area, not the full box. */
const LOADING_SCATTER_RATIOS = [
  { x: 0.12, y: 0.7 },
  { x: 0.28, y: 0.3 },
  { x: 0.4, y: 0.55 },
  { x: 0.55, y: 0.2 },
  { x: 0.62, y: 0.62 },
  { x: 0.78, y: 0.4 },
  { x: 0.85, y: 0.75 },
  { x: 0.92, y: 0.25 },
] as const;

/** Default visual radius and minimum invisible hit target for every point. */
const DEFAULT_POINT_RADIUS = 3;
const MIN_HIT_RADIUS = 10;

interface KuiScatterChartMark {
  readonly seriesId: string;
  readonly seriesName: string;
  readonly seriesColor?: string;
  readonly x: number;
  readonly y: number;
  readonly value: number;
  readonly radius: number;
}

@Component({
  selector: 'kui-scatter-chart',
  imports: [
    KuiButtonDirective,
    KuiCellDirective,
    KuiRowDirective,
    KuiTableDirective,
    KuiThDirective,
    KuiThGroupDirective,
  ],
  templateUrl: './kui-scatter-chart.component.html',
  host: {
    class: 'kui-chart kui-scatter-chart',
    '[style.--kui-chart-height.px]': 'dimensions().height',
  },
  encapsulation: ViewEncapsulation.None,
})
/**
 * Scatter/bubble chart. `bubble` reads the unscaled `r` value from each point;
 * it does not introduce a separate data model. See docs/chart.md for shared contracts.
 *
 * Unlike `kui-line-chart`/`kui-bar-chart`, there is no `categories` input -- both axes are
 * independent numeric domains computed from the data's own extent, **not** forced to include `0`
 * (see `computeScatterDomain`'s JSDoc for why this is a deliberate per-type deviation from the
 * line/bar "always include 0" rule).
 *
 * Implements {@link KuiChartLegendSource} -- see `kui-line-chart`'s matching class doc.
 */
export class KuiScatterChartComponent implements KuiChartLegendSource {
  /** Series to plot. Empty or omitted renders the empty state, never a blank canvas. */
  readonly series = input.required<readonly KuiChartScatterSeries[]>();

  /** Reads `r` from each point as the bubble radius (SVG viewBox units, unscaled -- see
   * `KuiChartScatterPoint.r` JSDoc). Not a separate chart type. */
  readonly bubble = input(false, { transform: booleanAttribute });

  /** Canvas height: 200 / 280 / 360px for sm / md / lg. */
  readonly size = input<'sm' | 'md' | 'lg'>('md');

  /** Shows a loading placeholder instead of the chart. */
  readonly loading = input(false, { transform: booleanAttribute });

  /** Shows the legend. Defaults to `true` when there is more than one series. */
  readonly legend = input<boolean | undefined>(undefined);

  /** Axis visibility and grid line configuration. */
  readonly axes = input<KuiChartAxesOptions>({});

  /** Formats axis tick labels and legend/tooltip numbers. Defaults to a compact `1.2K` format. */
  readonly valueFormat = input<KuiChartValueFormat>(formatCompact);

  /** Formats the tooltip text for a point. Defaults to `"<series>: (<x>, <y>)"`. */
  readonly tooltip = input<KuiChartTooltipFormatter | undefined>(undefined);

  /** Accessible name for the chart as a whole (what it shows, not per-point detail). */
  readonly ariaLabel = input.required<string>();

  protected readonly chartId = `kui-scatter-chart-${++nextScatterChartId}`;

  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly tooltipController = new KuiChartTooltipController(
    inject(Overlay),
    this.platformId,
  );

  protected readonly hiddenSeriesIds = signal<ReadonlySet<string>>(new Set());
  protected readonly hoveredSeriesId = signal<string | null>(null);
  /** See `kui-line-chart`'s matching `hoveredMarkKey` doc -- same hover scale-up effect, same
   * single-mark-not-whole-series distinction from `hoveredSeriesId`. Keyed by index (matches the
   * template's `@for` track expression) since `kui-scatter-chart`'s marks have no other stable
   * per-point identity. */
  protected readonly hoveredMarkKey = signal<number | null>(null);
  protected readonly focusedMarkIndex = signal(0);
  protected readonly showTable = signal(false);

  protected readonly dimensions = computed(() => SIZE_DIMENSIONS[this.size()]);

  protected readonly paddingLeft = PADDING.left;
  protected readonly paddingRight = PADDING.right;
  protected readonly paddingBottom = PADDING.bottom;

  protected readonly loadingScatterPoints = computed(() => {
    const { width, height } = this.dimensions();
    const plotWidth = width - PADDING.left - PADDING.right;
    const plotHeight = height - PADDING.top - PADDING.bottom;
    return LOADING_SCATTER_RATIOS.map((p) => ({
      x: PADDING.left + p.x * plotWidth,
      y: PADDING.top + p.y * plotHeight,
    }));
  });
  protected readonly loadingGridLines = computed(() =>
    computeLoadingGridLines(PADDING.top, this.dimensions().height - PADDING.bottom),
  );

  private readonly normalizedSeries = computed(() => normalizeScatterSeries(this.series()));

  protected readonly hasData = computed(() =>
    this.normalizedSeries().some((s) => s.points.length > 0),
  );

  protected readonly legendEnabled = computed(() => this.legend() ?? this.series().length > 1);

  /** Domains are computed from every series, including hidden ones -- hiding a series through
   * the legend must not recompute the scale (see `kui-line-chart`'s matching doc). */
  private readonly xDomain = computed(() => computeScatterDomain(this.normalizedSeries(), 'x'));
  private readonly yDomain = computed(() => computeScatterDomain(this.normalizedSeries(), 'y'));
  private readonly xScale = computed(() =>
    computeNiceScale(this.xDomain().min, this.xDomain().max),
  );
  private readonly yScale = computed(() =>
    computeNiceScale(this.yDomain().min, this.yDomain().max),
  );

  private readonly plotWidth = computed(
    () => this.dimensions().width - PADDING.left - PADDING.right,
  );
  private readonly plotHeight = computed(
    () => this.dimensions().height - PADDING.top - PADDING.bottom,
  );

  private xCoord(value: number): number {
    const { min, max } = this.xScale();
    const ratio = max === min ? 0.5 : (value - min) / (max - min);
    return PADDING.left + ratio * this.plotWidth();
  }

  private yCoord(value: number): number {
    const { min, max } = this.yScale();
    const ratio = max === min ? 0.5 : (value - min) / (max - min);
    return PADDING.top + (1 - ratio) * this.plotHeight();
  }

  protected readonly visibleSeries = computed(() =>
    this.normalizedSeries().filter((s) => !this.hiddenSeriesIds().has(s.seriesId)),
  );

  /** Every series regardless of hidden state -- see `kui-line-chart`'s matching `legendSeries`
   * doc for why the legend must stay interactive for hidden series. */
  protected readonly legendSeries = computed(() => this.normalizedSeries());

  /** Public {@link KuiChartLegendSource} implementation -- see the class doc. */
  readonly legendItems: () => readonly KuiChartLegendItem[] = computed(() =>
    this.legendSeries().map((s) => ({
      id: s.seriesId,
      label: s.seriesName,
      color: s.seriesColor,
      hidden: this.isSeriesHidden(s.seriesId),
    })),
  );

  /** Public {@link KuiChartLegendSource} implementation -- see the class doc. */
  readonly hoveredLegendId: () => string | null = computed(() => this.hoveredSeriesId());

  /** One rendered mark per point of every visible series, series-major order (no category axis
   * to order by, unlike line/bar's category-major order). */
  protected readonly marks = computed<readonly KuiScatterChartMark[]>(() => {
    const result: KuiScatterChartMark[] = [];
    for (const s of this.visibleSeries()) {
      for (const point of s.points) {
        const radius = this.bubble() && point.r !== undefined ? point.r : DEFAULT_POINT_RADIUS;
        result.push({
          seriesId: s.seriesId,
          seriesName: s.seriesName,
          seriesColor: s.seriesColor,
          x: this.xCoord(point.x),
          y: this.yCoord(point.y),
          value: point.y,
          radius,
        });
      }
    }
    return result;
  });

  protected readonly markRefs = viewChildren<SVGCircleElement>('markRef');

  /** Alt-table rows in data coordinates (not the `marks` screen coordinates) -- exact `x`/`y`/`r`
   * values, same "table always shows exact values" rule as line/bar's alt-table. */
  protected readonly tableRows = computed(() =>
    this.visibleSeries().flatMap((s) =>
      s.points.map((p) => ({
        seriesName: s.seriesName,
        x: p.x,
        y: p.y,
        r: p.r,
      })),
    ),
  );

  protected readonly xTicks = computed(() => this.xScale().ticks);
  protected readonly yTicks = computed(() => this.yScale().ticks);

  protected readonly gridLines = computed(() => this.axes().gridLines ?? 'both');
  protected readonly showXAxis = computed(() => this.axes().x ?? true);
  protected readonly showYAxis = computed(() => this.axes().y ?? true);
  protected readonly showXGrid = computed(() => {
    const lines = this.gridLines();
    return lines === 'both' || lines === 'vertical';
  });
  protected readonly showYGrid = computed(() => {
    const lines = this.gridLines();
    return lines === 'both' || lines === 'horizontal';
  });

  protected xTickCoord(value: number): number {
    return this.xCoord(value);
  }

  protected yTickCoord(value: number): number {
    return this.yCoord(value);
  }

  protected hitRadius(mark: KuiScatterChartMark): number {
    return Math.max(mark.radius, MIN_HIT_RADIUS);
  }

  protected markLabel(mark: KuiScatterChartMark): string {
    return this.formatTooltipText({
      seriesName: mark.seriesName,
      x: mark.x,
      y: mark.value,
      value: mark.value,
    });
  }

  private formatTooltipText(point: KuiChartPoint): string {
    const formatter = this.tooltip();
    if (formatter) return formatter(point);
    const value = this.valueFormat()(point.value);
    return `${point.seriesName}: ${value}`;
  }

  protected onMarkEnter(
    mark: KuiScatterChartMark,
    index: number,
    event: PointerEvent,
    group: Element,
  ): void {
    const point = { x: event.clientX, y: event.clientY };
    if (isTouchPointerType(event.pointerType)) {
      // See `kui-line-chart`'s matching `onMarkEnter` doc.
      this.tooltipController.showPinned(point, this.markLabel(mark), group, () => {
        this.hoveredSeriesId.set(null);
        this.hoveredMarkKey.set(null);
      });
    } else {
      this.tooltipController.show(point, this.markLabel(mark));
    }
    this.hoveredSeriesId.set(mark.seriesId);
    this.hoveredMarkKey.set(index);
  }

  protected onMarkFocus(mark: KuiScatterChartMark, index: number, target: Element): void {
    this.focusedMarkIndex.set(index);
    // See `kui-line-chart`'s matching `onMarkFocus` doc -- a click's synthetic `focus` shouldn't
    // jump an already pointer-following tooltip to the element's center.
    if (this.hoveredMarkKey() === index) return;
    this.tooltipController.show(target, this.markLabel(mark));
  }

  /** See `kui-line-chart`'s matching `onMarksPointerMove` doc -- follows cursor while over the
   * same mark. */
  protected onMarksPointerMove(event: PointerEvent): void {
    this.tooltipController.move({ x: event.clientX, y: event.clientY });
  }

  /** See `kui-line-chart`'s matching `onMarksPointerLeave` doc. */
  protected onMarksPointerLeave(event: PointerEvent): void {
    if (isTouchPointerType(event.pointerType)) return;
    this.tooltipController.hide();
    this.hoveredSeriesId.set(null);
    this.hoveredMarkKey.set(null);
  }

  /** See `kui-line-chart`'s matching `onMarksFocusOut` doc. */
  protected onMarksFocusOut(event: FocusEvent, group: Element): void {
    const next = event.relatedTarget as Node | null;
    if (next && group.contains(next)) return;
    this.tooltipController.hide();
  }

  /** See `kui-line-chart`'s matching `onMarksKeydown` doc. */
  protected onMarksKeydown(event: KeyboardEvent): void {
    const next = computeRovingIndex(event.key, this.focusedMarkIndex(), this.marks().length);
    if (next === null) return;
    event.preventDefault();
    this.focusedMarkIndex.set(next);
    this.markRefs()[next]?.focus?.();
  }

  protected toggleSeries(seriesId: string): void {
    const next = new Set(this.hiddenSeriesIds());
    const hiding = !next.has(seriesId);
    if (hiding) next.add(seriesId);
    else next.delete(seriesId);
    this.hiddenSeriesIds.set(next);
    // See `kui-donut-chart`'s matching `toggleSlice` doc -- same "clicking a legend item doesn't
    // move the pointer away from it" cross-highlight bug, same fix.
    if (hiding && this.hoveredSeriesId() === seriesId) {
      this.hoveredSeriesId.set(null);
      this.hoveredMarkKey.set(null);
    }
  }

  protected isSeriesHidden(seriesId: string): boolean {
    return this.hiddenSeriesIds().has(seriesId);
  }

  /** Public {@link KuiChartLegendSource} implementation -- see the class doc. */
  toggleLegendItem(seriesId: string): void {
    this.toggleSeries(seriesId);
  }

  /** Public {@link KuiChartLegendSource} implementation -- see the class doc. */
  setHoveredLegendId(seriesId: string | null): void {
    this.hoveredSeriesId.set(seriesId);
  }

  protected formatValue(value: number): string {
    return this.valueFormat()(value);
  }

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.tooltipController.hide();
      this.tooltipController.destroy();
    });
  }
}

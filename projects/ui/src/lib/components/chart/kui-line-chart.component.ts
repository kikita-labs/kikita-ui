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
  KuiChartCartesianSeries,
  KuiChartLegendItem,
  KuiChartLegendSource,
  KuiChartPoint,
  KuiChartTooltipFormatter,
  KuiChartValueFormat,
} from './chart.types';
import { computeRovingIndex } from './chart-keyboard-nav.util';
import type { KuiChartNormalizedCartesianSeries } from './chart-normalize.util';
import { normalizeCartesianSeries } from './chart-normalize.util';
import {
  computeGroupedDomain,
  computeLoadingGridLines,
  computeNiceScale,
  formatCompact,
  thinTicks,
} from './chart-scale.util';
import { isTouchPointerType, KuiChartTooltipController } from './chart-tooltip.util';

let nextLineChartId = 0;

/**
 * Nominal SVG viewBox units; CSS preserves the aspect ratio without browser
 * measurement or a post-hydration resize. Tick density uses this width, so much
 * narrower rendered charts can crowd labels. See docs/chart.md for limits.
 */
const SIZE_DIMENSIONS = {
  sm: { width: 320, height: 200 },
  md: { width: 480, height: 280 },
  lg: { width: 640, height: 360 },
} as const;

/**
 * Fixed plot-area padding, not measured against actual tick-label width -- a v1 simplification
 * (plan section 12.5). `left` is sized for the default compact formatter's typical output
 * (2-4 chars, e.g. `250`/`1.2K`); a consumer-supplied `valueFormat` producing much wider labels
 * can still clip against the plot area -- no dynamic measurement guards against that yet.
 */
const PADDING = { top: 8, right: 8, bottom: 24, left: 28 };
const MIN_TICK_LABEL_WIDTH = 48;

/**
 * Decorative loading-wave positions as fractions of the nominal viewBox.
 * Preserve its aspect ratio so circular dots do not stretch into ellipses.
 * This placeholder has no recorded approved loading design; see docs/chart.md.
 */
const LOADING_WAVE_RATIOS = [
  { x: 0.036, y: 0.75 },
  { x: 0.2, y: 0.625 },
  { x: 0.364, y: 0.667 },
  { x: 0.529, y: 0.5 },
  { x: 0.693, y: 0.542 },
  { x: 0.857, y: 0.375 },
  { x: 0.964, y: 0.433 },
] as const;

interface KuiLineChartMark {
  readonly seriesId: string;
  readonly seriesName: string;
  readonly seriesColor?: string;
  readonly categoryIndex: number;
  readonly categoryLabel?: string;
  readonly x: number;
  readonly y: number;
  readonly value: number;
}

@Component({
  selector: 'kui-line-chart',
  imports: [
    KuiButtonDirective,
    KuiCellDirective,
    KuiRowDirective,
    KuiTableDirective,
    KuiThDirective,
    KuiThGroupDirective,
  ],
  templateUrl: './kui-line-chart.component.html',
  host: {
    class: 'kui-chart kui-line-chart',
    '[style.--kui-chart-height.px]': 'dimensions().height',
  },
  encapsulation: ViewEncapsulation.None,
})
/**
 * Line/area chart. `area` is a boolean flag, not a separate component or chart type -- line and
 * area differ only in whether the area under the curve is filled; every other mechanic (axes,
 * legend, tooltip, keyboard navigation, alt-table) is identical. See docs/chart.md for data contracts,
 * scale math, missing-data handling, accessibility, and design limitations.
 *
 * `null` values in a series' `data` are gaps -- the line breaks there instead of connecting
 * across, and the gap is never silently drawn as `0`. The value axis always includes `0` and is
 * never log-scaled or domain-clamped. Hiding a series through the legend does not recompute the
 * axis domain, so the remaining series' scale stays stable across toggles.
 *
 * Implements {@link KuiChartLegendSource} -- pass this component (via a template reference
 * variable) to `kui-chart-legend` to render its legend anywhere in the DOM instead of (or as well
 * as) its own built-in inline legend, or read `legendItems`/`hoveredLegendId` directly to build a
 * fully custom legend.
 */
export class KuiLineChartComponent implements KuiChartLegendSource {
  /** Series to plot. Empty or omitted renders the empty state, never a blank canvas. */
  readonly series = input.required<readonly KuiChartCartesianSeries[]>();

  /** Category labels for the x-axis, aligned index-for-index with each series' `data`. */
  readonly categories = input<readonly string[]>([]);

  /** Fills the area under each line when `true`. Not a separate chart type. */
  readonly area = input(false, { transform: booleanAttribute });

  /** Canvas height: 200 / 280 / 360px for sm / md / lg. */
  readonly size = input<'sm' | 'md' | 'lg'>('md');

  /** Shows a skeleton placeholder instead of the chart. */
  readonly loading = input(false, { transform: booleanAttribute });

  /** Shows the legend. Defaults to `true` when there is more than one series. */
  readonly legend = input<boolean | undefined>(undefined);

  /** Axis visibility and grid line configuration. */
  readonly axes = input<KuiChartAxesOptions>({});

  /** Formats axis tick labels and legend/tooltip numbers. Defaults to a compact `1.2K` format. */
  readonly valueFormat = input<KuiChartValueFormat>(formatCompact);

  /** Formats the tooltip text for a point. Defaults to `"<series>: <formatted value>"`. */
  readonly tooltip = input<KuiChartTooltipFormatter | undefined>(undefined);

  /** Accessible name for the chart as a whole (what it shows, not per-point detail). */
  readonly ariaLabel = input.required<string>();

  protected readonly chartId = `kui-line-chart-${++nextLineChartId}`;
  protected readonly loadingWavePoints = computed(() => {
    const { width, height } = SIZE_DIMENSIONS[this.size()];
    const plotWidth = width - PADDING.left - PADDING.right;
    const plotHeight = height - PADDING.top - PADDING.bottom;
    return LOADING_WAVE_RATIOS.map((p) => ({
      x: PADDING.left + p.x * plotWidth,
      y: PADDING.top + p.y * plotHeight,
    }));
  });
  protected readonly loadingWavePolylinePoints = computed(() =>
    this.loadingWavePoints()
      .map((p) => `${p.x},${p.y}`)
      .join(' '),
  );
  protected readonly loadingGridLines = computed(() => {
    const { height } = SIZE_DIMENSIONS[this.size()];
    return computeLoadingGridLines(PADDING.top, height - PADDING.bottom);
  });

  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly hiddenSeriesIds = signal<ReadonlySet<string>>(new Set());
  protected readonly hoveredSeriesId = signal<string | null>(null);
  /** The single pointer-hovered mark (not its whole series -- `hoveredSeriesId` already dims the
   * OTHER series). Drives the hover scale-up effect (`chart.css`'s `.kui-chart__mark--hovered`),
   * distinct enough from focus that keyboard nav doesn't also trigger it (the existing
   * `:focus-visible` ring is that state's own affordance). */
  protected readonly hoveredMarkKey = signal<string | null>(null);
  protected readonly focusedMarkIndex = signal(0);
  protected readonly showTable = signal(false);

  protected readonly dimensions = computed(() => SIZE_DIMENSIONS[this.size()]);

  protected readonly paddingLeft = PADDING.left;
  protected readonly paddingRight = PADDING.right;
  protected readonly paddingBottom = PADDING.bottom;

  private readonly normalizedSeries = computed((): readonly KuiChartNormalizedCartesianSeries[] =>
    normalizeCartesianSeries(this.series(), this.categories(), 'line'),
  );

  protected readonly hasData = computed(() =>
    this.normalizedSeries().some((s) => s.slots.some((slot) => slot !== null)),
  );

  protected readonly legendEnabled = computed(() => this.legend() ?? this.series().length > 1);

  /** Axis domain is computed from every series, including hidden ones -- hiding a series through
   * the legend must not recompute the scale (see class doc / plan section 10 item 1). */
  private readonly domain = computed(() => computeGroupedDomain(this.normalizedSeries()));
  private readonly scale = computed(() => computeNiceScale(this.domain().min, this.domain().max));

  private readonly plotWidth = computed(
    () => this.dimensions().width - PADDING.left - PADDING.right,
  );
  private readonly plotHeight = computed(
    () => this.dimensions().height - PADDING.top - PADDING.bottom,
  );

  private xForCategory(categoryIndex: number): number {
    const count = this.categories().length;
    if (count <= 1) return PADDING.left + this.plotWidth() / 2;
    return PADDING.left + (categoryIndex / (count - 1)) * this.plotWidth();
  }

  private yForValue(value: number): number {
    const { min, max } = this.scale();
    const ratio = max === min ? 0.5 : (value - min) / (max - min);
    return PADDING.top + (1 - ratio) * this.plotHeight();
  }

  protected readonly visibleSeries = computed(() =>
    this.normalizedSeries().filter((s) => !this.hiddenSeriesIds().has(s.seriesId)),
  );

  /** Every series regardless of hidden state -- the legend must stay interactive for hidden
   * series so the consumer can bring them back; "all hidden" is not the same state as
   * `EmptyState` (plan section 12.4). */
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

  /** One rendered mark per non-gap slot of every visible series, in category-major order (all
   * series' marks for category 0, then category 1, ...) -- matches left-to-right visual reading
   * order for multi-series charts (plan section 12.6, order decided here). */
  protected readonly marks = computed<readonly KuiLineChartMark[]>(() => {
    const series = this.visibleSeries();
    const result: KuiLineChartMark[] = [];
    for (let categoryIndex = 0; categoryIndex < this.categories().length; categoryIndex++) {
      for (const s of series) {
        const slot = s.slots[categoryIndex];
        if (slot === null || slot === undefined) continue;
        result.push({
          seriesId: s.seriesId,
          seriesName: s.seriesName,
          seriesColor: s.seriesColor,
          categoryIndex,
          categoryLabel: slot.categoryLabel,
          x: this.xForCategory(categoryIndex),
          y: this.yForValue(slot.y),
          value: slot.y,
        });
      }
    }
    return result;
  });

  protected readonly markRefs = viewChildren<SVGCircleElement>('markRef');

  protected readonly linePaths = computed(() =>
    this.visibleSeries().map((s) => ({
      seriesId: s.seriesId,
      seriesColor: s.seriesColor,
      d: this.buildLinePath(s),
      areaD: this.area() ? this.buildAreaPath(s) : null,
    })),
  );

  private buildLinePath(series: KuiChartNormalizedCartesianSeries): string {
    let d = '';
    let drawing = false;
    series.slots.forEach((slot, categoryIndex) => {
      if (slot === null) {
        drawing = false;
        return;
      }
      const x = this.xForCategory(categoryIndex);
      const y = this.yForValue(slot.y);
      d += drawing ? ` L${x},${y}` : `${d ? ' ' : ''}M${x},${y}`;
      drawing = true;
    });
    return d;
  }

  private buildAreaPath(series: KuiChartNormalizedCartesianSeries): string {
    const baselineY = this.yForValue(0);
    let d = '';
    let segment: { x: number; y: number }[] = [];
    const segments: { x: number; y: number }[][] = [];
    series.slots.forEach((slot, categoryIndex) => {
      if (slot === null) {
        if (segment.length) segments.push(segment);
        segment = [];
        return;
      }
      segment.push({ x: this.xForCategory(categoryIndex), y: this.yForValue(slot.y) });
    });
    if (segment.length) segments.push(segment);

    for (const points of segments) {
      if (points.length === 0) continue;
      d += `${d ? ' ' : ''}M${points[0].x},${baselineY}`;
      for (const p of points) d += ` L${p.x},${p.y}`;
      d += ` L${points.at(-1)!.x},${baselineY} Z`;
    }
    return d;
  }

  protected readonly xTickIndices = computed(() =>
    thinTicks(this.categories().length, this.plotWidth(), MIN_TICK_LABEL_WIDTH),
  );

  protected readonly yTicks = computed(() => this.scale().ticks);

  protected readonly gridLines = computed(() => this.axes().gridLines ?? 'both');
  protected readonly showXAxis = computed(() => this.axes().x ?? true);
  protected readonly showYAxis = computed(() => this.axes().y ?? true);

  protected xForTick(index: number): number {
    return this.xForCategory(index);
  }

  protected yForTick(value: number): number {
    return this.yForValue(value);
  }

  private readonly tooltipController = new KuiChartTooltipController(
    inject(Overlay),
    this.platformId,
  );

  protected markLabel(mark: KuiLineChartMark): string {
    return this.formatTooltipText({
      seriesName: mark.seriesName,
      categoryLabel: mark.categoryLabel,
      value: mark.value,
    });
  }

  private formatTooltipText(point: KuiChartPoint): string {
    const formatter = this.tooltip();
    if (formatter) return formatter(point);
    const value = this.valueFormat()(point.value);
    return point.categoryLabel
      ? `${point.seriesName} · ${point.categoryLabel}: ${value}`
      : `${point.seriesName}: ${value}`;
  }

  /** Mouse hover shows the tooltip at the pointer position, not the mark's own element -- see
   * `KuiChartTooltipController`'s class doc for why (a mark-as-anchor tooltip only coincidentally
   * tracks the cursor for small, point-like marks). `onMarksPointerMove` keeps it following the
   * cursor while the pointer stays within the marks group. */
  protected onMarkEnter(mark: KuiLineChartMark, event: PointerEvent, group: Element): void {
    const point = { x: event.clientX, y: event.clientY };
    if (isTouchPointerType(event.pointerType)) {
      // See `KuiChartTooltipController.showPinned`'s doc -- touch has no hover to follow, so a
      // tap pins the tooltip open instead of showing it only for the instant before `pointerleave`
      // (which fires almost immediately on release) would otherwise hide it.
      this.tooltipController.showPinned(point, this.markLabel(mark), group, () => {
        this.hoveredSeriesId.set(null);
        this.hoveredMarkKey.set(null);
      });
    } else {
      this.tooltipController.show(point, this.markLabel(mark));
    }
    this.hoveredSeriesId.set(mark.seriesId);
    this.hoveredMarkKey.set(this.markKey(mark));
  }

  /** Keyboard focus has no pointer position, so it anchors to the mark element itself (the
   * `target` a `focus` event's own element/`markRef` provides) -- the one case
   * `KuiChartTooltipController`'s class doc calls out as still using an element anchor. */
  protected onMarkFocus(mark: KuiLineChartMark, index: number, target: Element): void {
    this.focusedMarkIndex.set(index);
    // A mouse click on a mark fires `focus` too (native focusable-element behavior), which would
    // otherwise re-anchor an already pointer-following tooltip to the element's center -- a real
    // jump the user could see (found from a screenshot: hovered tooltip tracking the cursor, then
    // snapping to dead-center above the bar the instant it was clicked). Only reposition for a
    // focus that ISN'T a side effect of the pointer already hovering this exact mark (real
    // keyboard `Tab`/arrow navigation, which has no pointer position of its own to anchor to).
    if (this.hoveredMarkKey() === this.markKey(mark)) return;
    this.tooltipController.show(target, this.markLabel(mark));
  }

  /** See `KuiChartTooltipController.move`'s doc -- keeps an already-shown tooltip following the
   * cursor without touching its text, which stays whatever the last-entered mark's `onMarkEnter`
   * set until a different mark's own `pointerenter` changes it. */
  protected onMarksPointerMove(event: PointerEvent): void {
    this.tooltipController.move({ x: event.clientX, y: event.clientY });
  }

  /**
   * Hides the tooltip only when the pointer truly leaves the whole marks group, not on every
   * individual mark's `pointerleave` -- a per-mark handler would dispose and recreate the overlay
   * on every adjacent-mark hover, defeating the point of retargeting one shared overlay (plan
   * section 7 / Phase 2).
   */
  protected onMarksPointerLeave(event: PointerEvent): void {
    // A touch `pointerleave` fires right on release, almost simultaneously with `pointerenter` --
    // hiding here would defeat `showPinned`'s whole point (see its doc). Touch dismissal is an
    // outside tap/Escape instead, wired through `onMarkEnter`'s `showPinned` call.
    if (isTouchPointerType(event.pointerType)) return;
    this.tooltipController.hide();
    this.hoveredSeriesId.set(null);
    this.hoveredMarkKey.set(null);
  }

  /**
   * Hides the tooltip only when focus leaves the whole marks group (e.g. Tab out to the legend),
   * not on every individual mark's `blur` -- moving focus between adjacent marks via arrow keys
   * fires `blur` then `focus` synchronously, so a per-mark `blur` handler would dispose and
   * recreate the overlay on every step for the same reason as `onMarksPointerLeave` above.
   */
  protected onMarksFocusOut(event: FocusEvent, group: Element): void {
    const next = event.relatedTarget as Node | null;
    if (next && group.contains(next)) return;
    this.tooltipController.hide();
  }

  /** Roving-tabindex keyboard navigation across marks: arrows move by one, Home/End jump to the
   * first/last mark. Only the focused mark is a tab stop; entering the group with Tab resumes at
   * the last focused mark. */
  protected onMarksKeydown(event: KeyboardEvent): void {
    const next = computeRovingIndex(event.key, this.focusedMarkIndex(), this.marks().length);
    if (next === null) return;
    event.preventDefault();
    this.focusedMarkIndex.set(next);
    // jsdom (unit tests) does not implement SVGElement.focus(); real browsers do.
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

  /** Stable per-mark identity for `hoveredMarkKey` -- matches the `@for` track expression in the
   * template, so the hovered key always corresponds to exactly one rendered mark. */
  protected markKey(mark: KuiLineChartMark): string {
    return `${mark.seriesId}:${mark.categoryIndex}`;
  }

  protected isSeriesHidden(seriesId: string): boolean {
    return this.hiddenSeriesIds().has(seriesId);
  }

  /** Public {@link KuiChartLegendSource} implementation -- see the class doc. Same toggle
   * `toggleSeries` (the chart's own inline legend) calls, so both stay in sync automatically. */
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

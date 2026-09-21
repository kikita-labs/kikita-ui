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
import { KuiSkeletonDirective } from '../skeleton';
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
  computeNiceScale,
  computeStackedDomain,
  formatCompact,
  thinTicks,
} from './chart-scale.util';
import { isTouchPointerType, KuiChartTooltipController } from './chart-tooltip.util';

let nextBarChartId = 0;

/** See the matching constant's JSDoc in `kui-line-chart.component.ts` -- same rationale. */
const SIZE_DIMENSIONS = {
  sm: { width: 320, height: 200 },
  md: { width: 480, height: 280 },
  lg: { width: 640, height: 360 },
} as const;

/** See the matching constant's JSDoc in `kui-line-chart.component.ts` -- same rationale. `left`
 * differs by orientation: vertical shows numeric value ticks there (narrow), horizontal shows
 * category text labels there instead (can be much wider, e.g. "Enterprise") -- using the
 * vertical-sized padding for horizontal clipped real category labels against the plot area
 * (found by browser-checking this component before calling it done). */
const PADDING = { top: 8, right: 8, bottom: 24, leftVertical: 28, leftHorizontal: 64 };
const MIN_TICK_LABEL_WIDTH = 48;

/** Fraction of each category band reserved as a gap between bands. An arbitrary but typical
 * bar-chart spacing choice -- not measured or configurable in v1. */
const BAND_GAP_FRACTION = 0.3;

/** Decorative bar heights in percent, retained from the original loading design. */
const LOADING_BAR_HEIGHTS = [45, 70, 55, 85, 60, 90, 50, 75] as const;

/** Grid-line top offsets (percent) behind the loading bar silhouette, so the loading state shows
 * the same grid chrome the real chart will render -- see `computeLoadingGridLines`'s doc.
 * Percent-of-box, not `computeLoadingGridLines`' viewBox-unit output, since this loading state is
 * plain HTML/CSS (flex bars), not SVG, unlike `kui-line-chart`/`kui-scatter-chart`. */
const LOADING_GRID_LINE_OFFSETS = [0, 25, 50, 75] as const;

interface KuiBarChartBar {
  readonly seriesId: string;
  readonly seriesName: string;
  readonly seriesColor?: string;
  readonly categoryIndex: number;
  readonly categoryLabel?: string;
  readonly value: number;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  /** Whether this bar's `rx` (the far-from-axis end) should be rounded -- always `true` when not
   * stacked (every bar's only "free" end is its value end); when stacked, only the outermost
   * segment in its sign's stack (the last positive or last negative series for that category) --
   * see `bars`' doc for why every OTHER stacked segment renders square. */
  readonly roundsFarEnd: boolean;
  /** Square axis-side patch geometry, present only when `roundsFarEnd` -- see the template's doc
   * on `.kui-chart__bar-axis-patch`. */
  readonly patchX?: number;
  readonly patchY?: number;
  readonly patchWidth?: number;
  readonly patchHeight?: number;
}

@Component({
  selector: 'kui-bar-chart',
  imports: [
    KuiButtonDirective,
    KuiCellDirective,
    KuiRowDirective,
    KuiSkeletonDirective,
    KuiTableDirective,
    KuiThDirective,
    KuiThGroupDirective,
  ],
  templateUrl: './kui-bar-chart.component.html',
  host: {
    class: 'kui-chart kui-bar-chart',
    '[style.--kui-chart-height.px]': 'dimensions().height',
  },
  encapsulation: ViewEncapsulation.None,
})
/**
 * Vertical or horizontal bar chart, grouped (default) or stacked. See docs/chart.md for the shared contracts and design limitations.
 *
 * `axes.x`/`axes.y` stay semantic (x = categories, y = values) regardless of `orientation` --
 * only the on-screen placement of the axes changes when `orientation="horizontal"`. Stacked mode
 * only applies with more than one series. Hiding a series through the legend recomputes the
 * value-axis domain when `stacked` (the remaining stack collapses to its own height) but not when
 * grouped (matching `kui-line-chart`'s stable-axis behavior) -- see
 * `chart-scale.util.ts`'s `computeStackedDomain` JSDoc for why stacked is the deliberate
 * exception.
 *
 * Implements {@link KuiChartLegendSource} -- see `kui-line-chart`'s matching class doc.
 */
export class KuiBarChartComponent implements KuiChartLegendSource {
  /** Series to plot. Empty or omitted renders the empty state, never a blank canvas. */
  readonly series = input.required<readonly KuiChartCartesianSeries[]>();

  /** Category labels, aligned index-for-index with each series' `data`. */
  readonly categories = input<readonly string[]>([]);

  /** Bar direction. `orientation="horizontal"` only flips on-screen placement -- `axes.x`/`axes.y`
   * stay semantic (x = categories, y = values). */
  readonly orientation = input<'vertical' | 'horizontal'>('vertical');

  /** Stacks series within each category instead of placing them side by side. Only meaningful
   * with more than one series. */
  readonly stacked = input(false, { transform: booleanAttribute });

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

  /** Formats the tooltip text for a bar. Defaults to `"<series> · <category>: <value>"`. */
  readonly tooltip = input<KuiChartTooltipFormatter | undefined>(undefined);

  /** Accessible name for the chart as a whole (what it shows, not per-bar detail). */
  readonly ariaLabel = input.required<string>();

  protected readonly chartId = `kui-bar-chart-${++nextBarChartId}`;
  protected readonly loadingBarHeights = LOADING_BAR_HEIGHTS;
  protected readonly loadingGridLineOffsets = LOADING_GRID_LINE_OFFSETS;

  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly tooltipController = new KuiChartTooltipController(
    inject(Overlay),
    this.platformId,
  );

  protected readonly hiddenSeriesIds = signal<ReadonlySet<string>>(new Set());
  protected readonly hoveredSeriesId = signal<string | null>(null);
  /** See `kui-line-chart`'s matching `hoveredMarkKey` doc -- same single-bar (not whole-series)
   * hover highlight, distinct from `hoveredSeriesId`'s cross-highlight dimming. */
  protected readonly hoveredBarKey = signal<string | null>(null);
  protected readonly focusedMarkIndex = signal(0);
  protected readonly showTable = signal(false);

  protected readonly dimensions = computed(() => SIZE_DIMENSIONS[this.size()]);

  protected readonly isVertical = computed(() => this.orientation() === 'vertical');

  protected readonly paddingLeft = computed(() =>
    this.isVertical() ? PADDING.leftVertical : PADDING.leftHorizontal,
  );
  protected readonly paddingRight = PADDING.right;
  protected readonly paddingBottom = PADDING.bottom;

  private readonly normalizedSeries = computed((): readonly KuiChartNormalizedCartesianSeries[] =>
    normalizeCartesianSeries(this.series(), this.categories(), 'bar'),
  );

  protected readonly hasData = computed(() =>
    this.normalizedSeries().some((s) => s.slots.some((slot) => slot !== null)),
  );

  protected readonly legendEnabled = computed(() => this.legend() ?? this.series().length > 1);

  /** Stacking only applies with more than one series -- a single series stacked on itself is a
   * no-op that should just render as a normal (grouped-of-one) bar, not a special case. */
  protected readonly isStacked = computed(
    () => this.stacked() && this.normalizedSeries().length > 1,
  );

  private readonly domain = computed(() => {
    const series = this.normalizedSeries();
    return this.isStacked()
      ? computeStackedDomain(series, this.categories().length, this.hiddenSeriesIds())
      : computeGroupedDomain(series);
  });
  private readonly scale = computed(() => computeNiceScale(this.domain().min, this.domain().max));

  private readonly plotWidth = computed(
    () => this.dimensions().width - this.paddingLeft() - PADDING.right,
  );
  private readonly plotHeight = computed(
    () => this.dimensions().height - PADDING.top - PADDING.bottom,
  );

  /** Position along the value screen axis (Y when vertical, X when horizontal). Vertical inverts
   * (larger value = smaller Y, matching SVG's top-down coordinate space); horizontal does not. */
  private valueCoord(value: number): number {
    const { min, max } = this.scale();
    const ratio = max === min ? 0.5 : (value - min) / (max - min);
    return this.isVertical()
      ? PADDING.top + (1 - ratio) * this.plotHeight()
      : this.paddingLeft() + ratio * this.plotWidth();
  }

  /** Start of a category band along the category screen axis (X when vertical, Y when
   * horizontal). */
  private categoryBandStart(index: number): number {
    const count = this.categories().length || 1;
    return this.isVertical()
      ? this.paddingLeft() + (index / count) * this.plotWidth()
      : PADDING.top + (index / count) * this.plotHeight();
  }

  private readonly categoryAxisLength = computed(() =>
    this.isVertical() ? this.plotWidth() : this.plotHeight(),
  );

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

  /** One rendered bar per non-gap slot of every visible series, in category-major order (matches
   * `kui-line-chart`'s `marks` order decision).
   *
   * `roundsFarEnd`/the axis-side patch (see the template's doc) only round the end of a bar
   * that's actually a free edge, not a seam. Not stacked: every bar's near end sits on the axis
   * (0) and its far end is the real value -- always rounds. Stacked: only the LAST segment in its
   * sign's stack (the outermost positive segment, or the outermost negative one) has a free far
   * edge; every earlier segment's "far" end is actually the next segment's near end, a seam
   * between two colors that should stay square, or rounding it cuts a visible notch into the
   * stack (found from a user screenshot of a grouped-and-stacked bar chart). */
  protected readonly bars = computed<readonly KuiBarChartBar[]>(() => {
    const series = this.visibleSeries();
    const categoryCount = this.categories().length;
    const bandSize = categoryCount > 0 ? this.categoryAxisLength() / categoryCount : 0;
    const usableBand = bandSize * (1 - BAND_GAP_FRACTION);
    const bandOffset = (bandSize - usableBand) / 2;
    const stacked = this.isStacked();
    const isVertical = this.isVertical();
    const barThickness = stacked ? usableBand : usableBand / Math.max(series.length, 1);
    const result: KuiBarChartBar[] = [];

    for (let categoryIndex = 0; categoryIndex < categoryCount; categoryIndex++) {
      const bandStart = this.categoryBandStart(categoryIndex);
      let positiveCumulative = 0;
      let negativeCumulative = 0;

      let lastPositiveSeriesIndex = -1;
      let lastNegativeSeriesIndex = -1;
      if (stacked) {
        series.forEach((s, seriesIndex) => {
          const slot = s.slots[categoryIndex];
          if (slot === null || slot === undefined) return;
          if (slot.y >= 0) lastPositiveSeriesIndex = seriesIndex;
          else lastNegativeSeriesIndex = seriesIndex;
        });
      }

      series.forEach((s, seriesIndex) => {
        const slot = s.slots[categoryIndex];
        if (slot === null || slot === undefined) return;
        const value = slot.y;

        let segmentStart: number;
        let segmentEnd: number;
        let thicknessOffset: number;
        if (stacked) {
          if (value >= 0) {
            segmentStart = positiveCumulative;
            segmentEnd = positiveCumulative + value;
            positiveCumulative = segmentEnd;
          } else {
            segmentEnd = negativeCumulative;
            segmentStart = negativeCumulative + value;
            negativeCumulative = segmentStart;
          }
          thicknessOffset = bandOffset;
        } else {
          segmentStart = 0;
          segmentEnd = value;
          thicknessOffset = bandOffset + seriesIndex * barThickness;
        }

        const roundsFarEnd = stacked
          ? value >= 0
            ? seriesIndex === lastPositiveSeriesIndex
            : seriesIndex === lastNegativeSeriesIndex
          : true;

        const coordStart = this.valueCoord(segmentStart);
        const coordEnd = this.valueCoord(segmentEnd);
        const x = isVertical ? bandStart + thicknessOffset : Math.min(coordStart, coordEnd);
        const y = isVertical ? Math.min(coordStart, coordEnd) : bandStart + thicknessOffset;
        const width = isVertical ? barThickness : Math.abs(coordEnd - coordStart);
        const height = isVertical ? Math.abs(coordEnd - coordStart) : barThickness;

        // Axis-side half of the bar, along its length axis -- see the template's doc on why half
        // (not the real radius) is a safe, CSS-var-agnostic patch size.
        let patch: Pick<KuiBarChartBar, 'patchX' | 'patchY' | 'patchWidth' | 'patchHeight'> = {};
        if (roundsFarEnd) {
          patch = isVertical
            ? value >= 0
              ? { patchX: x, patchY: y + height / 2, patchWidth: width, patchHeight: height / 2 }
              : { patchX: x, patchY: y, patchWidth: width, patchHeight: height / 2 }
            : value >= 0
              ? { patchX: x, patchY: y, patchWidth: width / 2, patchHeight: height }
              : { patchX: x + width / 2, patchY: y, patchWidth: width / 2, patchHeight: height };
        }

        result.push({
          seriesId: s.seriesId,
          seriesName: s.seriesName,
          seriesColor: s.seriesColor,
          categoryIndex,
          categoryLabel: slot.categoryLabel,
          value,
          x,
          y,
          width,
          height,
          roundsFarEnd,
          ...patch,
        });
      });
    }
    return result;
  });

  protected readonly barRefs = viewChildren<SVGRectElement>('barRef');

  /** Which category indices get a rendered tick label -- orientation-agnostic since
   * `categoryAxisLength` already picks the right screen dimension. */
  protected readonly categoryTickIndices = computed(() =>
    thinTicks(this.categories().length, this.categoryAxisLength(), MIN_TICK_LABEL_WIDTH),
  );

  protected readonly valueTicks = computed(() => this.scale().ticks);

  /** `axes.x`/`axes.y` stay semantic; only the drawn screen orientation of their grid lines
   * flips with `orientation` (plan section 12.1). */
  protected readonly showCategoryAxis = computed(() => this.axes().x ?? true);
  protected readonly showValueAxis = computed(() => this.axes().y ?? true);

  private readonly gridLines = computed(() => this.axes().gridLines ?? 'both');
  protected readonly showValueGrid = computed(() => {
    const lines = this.gridLines();
    const valueGridIsHorizontal = this.isVertical();
    return lines === 'both' || lines === (valueGridIsHorizontal ? 'horizontal' : 'vertical');
  });
  protected readonly showCategoryGrid = computed(() => {
    const lines = this.gridLines();
    const categoryGridIsHorizontal = !this.isVertical();
    return lines === 'both' || lines === (categoryGridIsHorizontal ? 'horizontal' : 'vertical');
  });

  protected categoryTickCoord(index: number): number {
    const count = this.categories().length || 1;
    const bandSize = this.categoryAxisLength() / count;
    return this.categoryBandStart(index) + bandSize / 2;
  }

  protected valueTickCoord(value: number): number {
    return this.valueCoord(value);
  }

  protected markLabel(bar: KuiBarChartBar): string {
    return this.formatTooltipText({
      seriesName: bar.seriesName,
      categoryLabel: bar.categoryLabel,
      value: bar.value,
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

  protected onBarEnter(bar: KuiBarChartBar, event: PointerEvent, group: Element): void {
    const point = { x: event.clientX, y: event.clientY };
    if (isTouchPointerType(event.pointerType)) {
      // See `kui-line-chart`'s matching `onMarkEnter` doc.
      this.tooltipController.showPinned(point, this.markLabel(bar), group, () => {
        this.hoveredSeriesId.set(null);
        this.hoveredBarKey.set(null);
      });
    } else {
      this.tooltipController.show(point, this.markLabel(bar));
    }
    this.hoveredSeriesId.set(bar.seriesId);
    this.hoveredBarKey.set(this.barKey(bar));
  }

  protected onBarFocus(bar: KuiBarChartBar, index: number, target: Element): void {
    this.focusedMarkIndex.set(index);
    // See `kui-line-chart`'s matching `onMarkFocus` doc -- a click's synthetic `focus` shouldn't
    // jump an already pointer-following tooltip to the element's center.
    if (this.hoveredBarKey() === this.barKey(bar)) return;
    this.tooltipController.show(target, this.markLabel(bar));
  }

  /** See `kui-line-chart`'s matching `onMarksPointerMove` doc -- follows cursor while over the
   * same bar. */
  protected onBarsPointerMove(event: PointerEvent): void {
    this.tooltipController.move({ x: event.clientX, y: event.clientY });
  }

  /** See `kui-line-chart`'s matching `onMarksPointerLeave` doc -- same rationale (group-level,
   * not per-bar, to keep the shared overlay retargeted instead of recreated). */
  protected onBarsPointerLeave(event: PointerEvent): void {
    if (isTouchPointerType(event.pointerType)) return;
    this.tooltipController.hide();
    this.hoveredSeriesId.set(null);
    this.hoveredBarKey.set(null);
  }

  /** See `kui-line-chart`'s matching `onMarksFocusOut` doc. */
  protected onBarsFocusOut(event: FocusEvent, group: Element): void {
    const next = event.relatedTarget as Node | null;
    if (next && group.contains(next)) return;
    this.tooltipController.hide();
  }

  /** See `kui-line-chart`'s matching `onMarksKeydown` doc. */
  protected onBarsKeydown(event: KeyboardEvent): void {
    const next = computeRovingIndex(event.key, this.focusedMarkIndex(), this.bars().length);
    if (next === null) return;
    event.preventDefault();
    this.focusedMarkIndex.set(next);
    this.barRefs()[next]?.focus?.();
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
      this.hoveredBarKey.set(null);
    }
  }

  /** Stable per-bar identity for `hoveredBarKey` -- matches the template's `@for` track
   * expression, so the hovered key always corresponds to exactly one rendered bar. */
  protected barKey(bar: KuiBarChartBar): string {
    return `${bar.seriesId}:${bar.categoryIndex}`;
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

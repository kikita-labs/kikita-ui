import {
  booleanAttribute,
  Component,
  computed,
  inject,
  input,
  viewChildren,
  ViewEncapsulation,
} from '@angular/core';

import type { KuiChartMessages } from '../../../i18n/kui-messages.interface';
import { KuiDefaults } from '../../../providers/kui-defaults.service';
import { KuiButton } from '../../button';
import { KuiCell, KuiRow, KuiTable, KuiTh, KuiThGroup } from '../../table';
import type {
  KuiChartAxesOptions,
  KuiChartCartesianSeries,
  KuiChartLegendEntry,
  KuiChartLegendSource,
  KuiChartTooltipFormatter,
  KuiChartValueFormat,
} from '../chart.types';
import type { KuiChartNormalizedCartesianSeries } from '../core/chart-normalize.util';
import { normalizeCartesianSeries } from '../core/chart-normalize.util';
import {
  computeGroupedDomain,
  computeLoadingGridLines,
  computeNiceScale,
  thinTicks,
} from '../core/chart-scale.util';
import { KuiChartSession } from '../core/chart-session';

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
 * Fixed plot-area padding for typical compact tick labels. Wider custom labels
 * can clip because the chart does not measure text dynamically.
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
  imports: [KuiButton, KuiCell, KuiRow, KuiTable, KuiTh, KuiThGroup],
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
export class KuiLineChart implements KuiChartLegendSource {
  /** Series to plot. Empty or omitted renders the empty state, never a blank canvas. */
  readonly series = input.required<readonly KuiChartCartesianSeries[]>();

  /** Category labels for the x-axis, aligned index-for-index with each series' `data`. */
  readonly categories = input<readonly string[]>([]);

  /** Fills the area under each line when `true`. Not a separate chart type. */
  readonly area = input(false, { transform: booleanAttribute });

  /** Canvas height: 200 / 280 / 360px for sm / md / lg. Defaults to `defaults.lineChart.size`, then `'md'`. */
  readonly size = input<'sm' | 'md' | 'lg' | undefined>();

  /** Shows a skeleton placeholder instead of the chart. */
  readonly loading = input(false, { transform: booleanAttribute });

  /** Shows the legend. Defaults to `defaults.lineChart.legend`, then `true` when there is more than one series. */
  readonly legend = input<boolean | undefined>(undefined);

  /** Axis visibility and grid line configuration. */
  readonly axes = input<KuiChartAxesOptions>({});

  /** Formats axis tick labels and legend/tooltip numbers. Defaults to the locale's compact notation (`1.2K` in English). */
  readonly valueFormat = input<KuiChartValueFormat | undefined>(undefined);

  /** Formats the tooltip text for a point. Defaults to `"<series>: <formatted value>"`. */
  readonly tooltip = input<KuiChartTooltipFormatter | undefined>(undefined);

  /** Accessible name for the chart as a whole (what it shows, not per-point detail). */
  readonly ariaLabel = input<string | undefined>(undefined);

  /** Per-instance text overrides; they win over the scoped and root messages. */
  readonly messages = input<Partial<KuiChartMessages> | undefined>(undefined);

  /** State and handlers the four charts share; this chart supplies its marks and their text. */
  private readonly session = new KuiChartSession({
    idPrefix: 'kui-line-chart',
    defaultLabel: (messages) => messages.lineLabel,
    ariaLabel: this.ariaLabel,
    messages: this.messages,
    valueFormat: this.valueFormat,
    tooltip: this.tooltip,
    markCount: () => this.marks().length,
    markRefs: () => this.markRefs(),
  });

  protected readonly t = this.session.t;
  protected readonly effectiveAriaLabel = this.session.effectiveAriaLabel;
  protected readonly chartId = this.session.chartId;
  protected readonly hiddenSeriesIds = this.session.hiddenIds;
  protected readonly hoveredSeriesId = this.session.hoveredSeriesId;
  protected readonly hoveredMarkKey = this.session.hoveredMarkKey;
  protected readonly focusedMarkIndex = this.session.focusedMarkIndex;
  protected readonly showTable = this.session.showTable;
  protected readonly formatValue = this.session.formatValue;
  protected readonly onMarksPointerMove = this.session.onPointerMove;
  protected readonly onMarksPointerLeave = this.session.onPointerLeave;
  protected readonly onMarksFocusOut = this.session.onFocusOut;
  protected readonly onMarksKeydown = this.session.onKeydown;
  protected readonly toggleSeries = this.session.toggle;
  protected readonly isSeriesHidden = this.session.isHidden;
  protected readonly loadingWavePoints = computed(() => {
    const { width, height } = SIZE_DIMENSIONS[this.effectiveSize()];
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
    const { height } = SIZE_DIMENSIONS[this.effectiveSize()];
    return computeLoadingGridLines(PADDING.top, height - PADDING.bottom);
  });

  private readonly lineChartDefaults = inject(KuiDefaults).get('lineChart');

  private readonly effectiveSize = computed(
    () => this.size() ?? this.lineChartDefaults()?.size ?? 'md',
  );

  protected readonly dimensions = computed(() => SIZE_DIMENSIONS[this.effectiveSize()]);

  protected readonly paddingLeft = PADDING.left;
  protected readonly paddingRight = PADDING.right;
  protected readonly paddingBottom = PADDING.bottom;

  private readonly normalizedSeries = computed((): readonly KuiChartNormalizedCartesianSeries[] =>
    normalizeCartesianSeries(this.series(), this.categories(), 'line'),
  );

  protected readonly hasData = computed(() =>
    this.normalizedSeries().some((s) => s.slots.some((slot) => slot !== null)),
  );

  protected readonly legendEnabled = computed(
    () => this.legend() ?? this.lineChartDefaults()?.legend ?? this.series().length > 1,
  );

  /** Axis domain includes hidden series so legend toggles do not move the scale. */
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

  /** Includes hidden series so the legend can restore them; all-hidden is not empty data. */
  protected readonly legendSeries = computed(() => this.normalizedSeries());

  /** Public {@link KuiChartLegendSource} implementation -- see the class doc. */
  readonly legendItems: () => readonly KuiChartLegendEntry[] = computed(() =>
    this.legendSeries().map((s) => ({
      id: s.seriesId,
      label: s.seriesName,
      color: s.seriesColor,
      hidden: this.isSeriesHidden(s.seriesId),
    })),
  );

  /** Public {@link KuiChartLegendSource} implementation -- see the class doc. */
  readonly hoveredLegendId: () => string | null = computed(() => this.hoveredSeriesId());

  /** Non-gap visible marks in category-major order for keyboard navigation. */
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

  protected markLabel(mark: KuiLineChartMark): string {
    return this.session.pointText({
      seriesName: mark.seriesName,
      categoryLabel: mark.categoryLabel,
      value: mark.value,
    });
  }

  protected onMarkEnter(mark: KuiLineChartMark, event: PointerEvent, group: Element): void {
    this.session.enter(mark.seriesId, this.markKey(mark), this.markLabel(mark), event, group);
  }

  protected onMarkFocus(mark: KuiLineChartMark, index: number, target: Element): void {
    this.session.focus(index, this.markKey(mark), this.markLabel(mark), target);
  }

  /** Stable per-mark identity for `hoveredMarkKey` -- matches the template's `@for` track
   * expression, so the hovered key always corresponds to exactly one rendered mark. */
  protected markKey(mark: KuiLineChartMark): string {
    return `${mark.seriesId}:${mark.categoryIndex}`;
  }

  /** Public {@link KuiChartLegendSource} implementation -- see the class doc. */
  toggleLegendItem(seriesId: string): void {
    this.toggleSeries(seriesId);
  }

  /** Public {@link KuiChartLegendSource} implementation -- see the class doc. */
  setHoveredLegendId(seriesId: string | null): void {
    this.hoveredSeriesId.set(seriesId);
  }
}

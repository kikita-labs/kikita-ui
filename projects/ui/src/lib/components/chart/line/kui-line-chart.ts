import {
  booleanAttribute,
  Component,
  computed,
  effect,
  inject,
  input,
  untracked,
  ViewEncapsulation,
} from '@angular/core';

import type { KuiChartMessages } from '../../../i18n/kui-messages.interface';
import { KuiDefaults } from '../../../providers/kui-defaults';
import { KuiButton } from '../../button';
import { KuiCell, KuiRow, KuiTable, KuiTh, KuiThGroup } from '../../table';
import type {
  KuiChartAxesOptions,
  KuiChartCartesianSeries,
  KuiChartLegendEntry,
  KuiChartLegendSource,
  KuiChartMarkerShape,
  KuiChartTooltipFormatter,
  KuiChartValueFormat,
} from '../chart.types';
import type { KuiChartNavMark } from '../core/chart-keyboard-nav.util';
import { KuiChartLayout } from '../core/chart-layout';
import type { KuiChartTickAnchor } from '../core/chart-layout.util';
import { computeInsets, selectTickIndices, truncateToWidth } from '../core/chart-layout.util';
import type { KuiChartPlotRect } from '../core/chart-nearest.util';
import { nearestPointIndex } from '../core/chart-nearest.util';
import type { KuiChartNormalizedCartesianSeries } from '../core/chart-normalize.util';
import { normalizeCartesianSeries } from '../core/chart-normalize.util';
import { patternId, patternPaint } from '../core/chart-pattern.util';
import {
  keepFocusOnPress,
  KUI_CHART_MARK_LIMIT,
  KUI_CHART_PLOT_HIT_REACH,
  toPlotPointer,
} from '../core/chart-pointer.util';
import {
  computeGroupedDomain,
  computeLoadingGridLines,
  computeNiceScale,
} from '../core/chart-scale.util';
import { KuiChartSession } from '../core/chart-session';
import {
  KUI_CHART_LINE_DASHES,
  KUI_CHART_MARKER_SHAPES,
  markerPath,
  markerShapeForSeries,
} from '../core/chart-symbols.util';
import type { KuiChartAxisTick } from '../core/kui-chart-axis';
import { KuiChartAxis } from '../core/kui-chart-axis';
import { KuiChartPatterns } from '../core/kui-chart-patterns';
import { KuiChartSwatch } from '../core/kui-chart-swatch';

/**
 * Height in pixels and nominal width in viewBox units for each size. The height is real: the chart
 * measures its container and draws at one unit per CSS pixel, so text and marks keep their size. The
 * nominal width is what the server and the first client render use before the container is measured.
 */
const SIZE_DIMENSIONS = {
  sm: { width: 320, height: 200 },
  md: { width: 480, height: 280 },
  lg: { width: 640, height: 360 },
} as const;

/** Longest axis label drawn in full, in pixels; a longer one is cut with an ellipsis. */
const MAX_TICK_LABEL_WIDTH = 120;

/** Margins of the loading skeleton, which is a decorative sketch drawn in the nominal box. */
const LOADING_PADDING = { top: 8, right: 8, bottom: 24, left: 28 };

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

/** Pixels around the drawn marker in which the pointer still counts as being on the point. */
const MARKER_HIT_MARGIN = 3;

interface KuiLineChartMark {
  readonly key: string;
  readonly seriesId: string;
  readonly seriesName: string;
  readonly seriesColor: string;
  /** Index among the visible series, for keyboard navigation. */
  readonly seriesIndex: number;
  readonly shape: KuiChartMarkerShape;
  readonly categoryIndex: number;
  readonly categoryLabel?: string;
  readonly x: number;
  readonly y: number;
  readonly value: number;
}

@Component({
  selector: 'kui-line-chart',
  imports: [
    KuiButton,
    KuiCell,
    KuiChartAxis,
    KuiChartPatterns,
    KuiChartSwatch,
    KuiRow,
    KuiTable,
    KuiTh,
    KuiThGroup,
  ],
  templateUrl: './kui-line-chart.html',
  host: {
    class: 'kui-chart kui-line-chart',
    '[style.--kui-chart-height.px]': 'height()',
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

  /**
   * Fills series with hatch patterns instead of plain colour, so series differ by texture as well as
   * hue. Turned on automatically in forced colours.
   */
  readonly patterns = input(false, { transform: booleanAttribute });

  /** Canvas height: 200 / 280 / 360px for sm / md / lg. Defaults to `defaults.lineChart.size`, then `'md'`. */
  readonly size = input<'sm' | 'md' | 'lg' | undefined>();

  /** Shows a skeleton placeholder instead of the chart. */
  readonly loading = input(false, { transform: booleanAttribute });

  /** Shows the legend. Defaults to `defaults.lineChart.legend`, then `true` when there is more than one series. */
  readonly legend = input<boolean | undefined>(undefined);

  /** Axis visibility, titles and grid line configuration. */
  readonly axes = input<KuiChartAxesOptions>({});

  /** Formats axis tick labels and legend/tooltip numbers. Defaults to the locale's compact notation (`1.2K` in English). */
  readonly valueFormat = input<KuiChartValueFormat | undefined>(undefined);

  /** Formats the tooltip text for a point. Defaults to `"<series> · <category>: <formatted value>"`. */
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
    marks: () => this.navMarks(),
    navigation: () => 'columns',
  });

  private readonly lineChartDefaults = inject(KuiDefaults).get('lineChart');

  private readonly effectiveSize = computed(
    () => this.size() ?? this.lineChartDefaults()?.size ?? 'md',
  );

  /** The width of the container in pixels, measured after the first render. */
  protected readonly layout = new KuiChartLayout({
    nominalWidth: () => SIZE_DIMENSIONS[this.effectiveSize()].width,
  });

  protected readonly t = this.session.t;
  protected readonly effectiveAriaLabel = this.session.effectiveAriaLabel;
  protected readonly chartId = this.session.chartId;
  protected readonly hiddenSeriesIds = this.session.hiddenIds;
  protected readonly hoveredSeriesId = this.session.hoveredSeriesId;
  protected readonly hoveredMarkKey = this.session.hoveredMarkKey;
  protected readonly rovingKey = this.session.rovingKey;
  protected readonly showTable = this.session.showTable;
  protected readonly formatValue = this.session.formatValue;
  protected readonly onMarksPointerLeave = this.session.onPointerLeave;
  protected readonly onMarksFocusOut = this.session.onFocusOut;
  protected readonly onMarksKeydown = this.session.onKeydown;
  protected readonly toggleSeries = this.session.toggle;
  protected readonly isSeriesHidden = this.session.isHidden;

  protected readonly width = this.layout.width;
  protected readonly height = computed(() => SIZE_DIMENSIONS[this.effectiveSize()].height);
  protected readonly fontSize = computed(() => this.layout.font().size);

  /** The skeleton is a sketch in the nominal box and keeps scaling with its container. */
  protected readonly nominal = computed(() => SIZE_DIMENSIONS[this.effectiveSize()]);
  protected readonly loadingPadding = LOADING_PADDING;
  protected readonly loadingWavePoints = computed(() => {
    const { width, height } = this.nominal();
    const plotWidth = width - LOADING_PADDING.left - LOADING_PADDING.right;
    const plotHeight = height - LOADING_PADDING.top - LOADING_PADDING.bottom;
    return LOADING_WAVE_RATIOS.map((p) => ({
      x: LOADING_PADDING.left + p.x * plotWidth,
      y: LOADING_PADDING.top + p.y * plotHeight,
    }));
  });
  protected readonly loadingWavePolylinePoints = computed(() =>
    this.loadingWavePoints()
      .map((p) => `${p.x},${p.y}`)
      .join(' '),
  );
  protected readonly loadingGridLines = computed(() =>
    computeLoadingGridLines(LOADING_PADDING.top, this.nominal().height - LOADING_PADDING.bottom),
  );

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

  protected readonly gridLines = computed(() => this.axes().gridLines ?? 'both');
  protected readonly showXAxis = computed(() => this.axes().x ?? true);
  protected readonly showYAxis = computed(() => this.axes().y ?? true);
  protected readonly showXGrid = computed(
    () => this.showXAxis() && (this.gridLines() === 'both' || this.gridLines() === 'vertical'),
  );
  protected readonly showYGrid = computed(
    () => this.showYAxis() && (this.gridLines() === 'both' || this.gridLines() === 'horizontal'),
  );

  private readonly yLabels = computed(() =>
    this.scale().ticks.map((tick) => this.formatValue(tick)),
  );

  /** Space around the plot, fitted to the widest value label and to the titles that are drawn. */
  private readonly insets = computed(() => {
    const radius = this.layout.markRadius();

    return computeInsets({
      fontSize: this.fontSize(),
      leftLabelWidth: this.showYAxis()
        ? Math.max(0, ...this.yLabels().map((label) => this.layout.textWidth(label)))
        : 0,
      bottomLabels: this.showXAxis(),
      leftTitle: this.showYAxis() && !!this.axes().yTitle,
      bottomTitle: this.showXAxis() && !!this.axes().xTitle,
      top: radius,
      right: radius,
    });
  });

  /** The plot area in pixels. */
  protected readonly plot = computed<KuiChartPlotRect>(() => {
    const insets = this.insets();

    return {
      x: insets.left,
      y: insets.top,
      width: Math.max(1, this.width() - insets.left - insets.right),
      height: Math.max(1, this.height() - insets.top - insets.bottom),
    };
  });

  private xForCategory(categoryIndex: number): number {
    const count = this.categories().length;
    const { x, width } = this.plot();
    if (count <= 1) return x + width / 2;
    return x + (categoryIndex / (count - 1)) * width;
  }

  private yForValue(value: number): number {
    const { min, max } = this.scale();
    const { y, height } = this.plot();
    const ratio = max === min ? 0.5 : (value - min) / (max - min);
    return y + (1 - ratio) * height;
  }

  protected readonly visibleSeries = computed(() =>
    this.normalizedSeries().filter((s) => !this.hiddenSeriesIds().has(s.seriesId)),
  );

  /** More than one series: the marks differ in shape as well as in colour. */
  private readonly distinctShapes = computed(() => this.normalizedSeries().length > 1);

  /** Every series, hidden or not, so the legend can bring a hidden one back; all-hidden is not empty data. */
  protected readonly legendSeries = computed(() =>
    this.normalizedSeries().map((s, index) => ({
      ...s,
      shape: markerShapeForSeries(index, this.distinctShapes()),
    })),
  );

  /** Public {@link KuiChartLegendSource} implementation -- see the class doc. */
  readonly legendItems: () => readonly KuiChartLegendEntry[] = computed(() =>
    this.legendSeries().map((s, index) => ({
      id: s.seriesId,
      label: s.seriesName,
      color: s.seriesColor,
      hidden: this.isSeriesHidden(s.seriesId),
      shape: this.distinctShapes() ? s.shape : undefined,
      pattern: this.patterns() && this.area() ? index : undefined,
    })),
  );

  /** Public {@link KuiChartLegendSource} implementation -- see the class doc. */
  readonly hoveredLegendId: () => string | null = computed(() => this.hoveredSeriesId());

  /** Non-gap visible marks in category-major order. */
  protected readonly marks = computed<readonly KuiLineChartMark[]>(() => {
    const distinct = this.distinctShapes();
    const all = this.normalizedSeries();
    const result: KuiLineChartMark[] = [];
    const visible = all.filter((s) => !this.hiddenSeriesIds().has(s.seriesId));

    for (let categoryIndex = 0; categoryIndex < this.categories().length; categoryIndex++) {
      visible.forEach((s, seriesIndex) => {
        const slot = s.slots[categoryIndex];
        if (slot === null || slot === undefined) return;
        result.push({
          key: `${s.seriesId}:${categoryIndex}`,
          seriesId: s.seriesId,
          seriesName: s.seriesName,
          seriesColor: s.seriesColor,
          seriesIndex,
          shape: markerShapeForSeries(all.indexOf(s), distinct),
          categoryIndex,
          categoryLabel: slot.categoryLabel,
          x: this.xForCategory(categoryIndex),
          y: this.yForValue(slot.y),
          value: slot.y,
        });
      });
    }
    return result;
  });

  /** The marks as keyboard navigation sees them. */
  private readonly navMarks = computed<readonly KuiChartNavMark[]>(() =>
    this.marks().map((mark) => ({
      key: mark.key,
      series: mark.seriesIndex,
      category: mark.categoryIndex,
      x: mark.x,
      y: mark.y,
    })),
  );

  /**
   * The marks drawn as DOM. A dense chart draws only the mark that holds the tab stop: the line shows
   * the data, the pointer and keyboard resolve marks from the data, and the table lists every value.
   */
  protected readonly renderedMarks = computed(() => {
    const all = this.marks();
    if (all.length <= KUI_CHART_MARK_LIMIT) return all;

    const key = this.rovingKey();
    return all.filter((mark) => mark.key === key);
  });

  /** Outline of every marker shape at the current mark radius. */
  protected readonly markerPaths = computed(() => {
    const radius = this.layout.markRadius();
    return Object.fromEntries(
      KUI_CHART_MARKER_SHAPES.map((shape) => [shape, markerPath(shape, radius)]),
    ) as Record<KuiChartMarkerShape, string>;
  });

  protected readonly hitReach = KUI_CHART_PLOT_HIT_REACH;

  protected readonly linePaths = computed(() =>
    this.visibleSeries().map((s) => ({
      seriesId: s.seriesId,
      seriesIndex: this.normalizedSeries().indexOf(s),
      seriesColor: s.seriesColor,
      d: this.buildLinePath(s),
      areaD: this.area() ? this.buildAreaPath(s) : null,
      areaFill: this.patterns()
        ? patternPaint(this.chartId, this.normalizedSeries().indexOf(s))
        : `url(#${this.chartId}-area-${this.normalizedSeries().indexOf(s)})`,
      pattern: patternPaint(this.chartId, this.normalizedSeries().indexOf(s)),
      dash: KUI_CHART_LINE_DASHES[
        this.normalizedSeries().indexOf(s) % KUI_CHART_LINE_DASHES.length
      ],
    })),
  );

  /** The pattern index of a series for its legend swatch: set when `patterns` fills the areas. */
  protected legendPattern(seriesId: string): number | undefined {
    if (!this.patterns() || !this.area()) return undefined;
    const index = this.normalizedSeries().findIndex((s) => s.seriesId === seriesId);

    return index === -1 ? undefined : index;
  }

  /** The hatch patterns of every series, defined once for the area fill and for forced colours. */
  protected readonly patternDefs = computed(() =>
    this.normalizedSeries().map((s, index) => ({
      id: patternId(this.chartId, index),
      index,
      color: s.seriesColor,
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

  /** The category labels, each cut to the width one label may take. */
  private readonly categoryLabels = computed(() =>
    this.categories().map((label) =>
      truncateToWidth(label, MAX_TICK_LABEL_WIDTH, (text) => this.layout.textWidth(text)),
    ),
  );

  /** The category labels that fit without touching, measured. */
  protected readonly xTicks = computed<readonly KuiChartAxisTick[]>(() => {
    const labels = this.categoryLabels();
    const boxes = labels.map((label, index) => ({
      position: this.xForCategory(index),
      width: this.layout.textWidth(label),
    }));
    const selected = selectTickIndices(boxes);
    const categories = this.categories();

    return selected.map((index, rank) => {
      const anchor: KuiChartTickAnchor =
        selected.length === 1
          ? 'middle'
          : rank === 0
            ? 'start'
            : rank === selected.length - 1
              ? 'end'
              : 'middle';

      return {
        position: boxes[index].position,
        label: labels[index],
        full: categories[index],
        anchor,
      };
    });
  });

  protected readonly yTicks = computed<readonly KuiChartAxisTick[]>(() =>
    this.scale().ticks.map((tick, index) => ({
      position: this.yForValue(tick),
      label: this.yLabels()[index],
      full: this.yLabels()[index],
      anchor: 'end' as const,
    })),
  );

  constructor() {
    // When the marks change (a series was hidden, the data changed), a mark that had focus may be
    // gone; the session puts focus back on the mark that now holds the tab stop.
    effect(() => {
      this.marks();
      untracked(() => this.session.restoreFocus());
    });
  }

  protected markLabel(mark: KuiLineChartMark): string {
    return this.session.pointText({
      seriesName: mark.seriesName,
      categoryLabel: mark.categoryLabel,
      value: mark.value,
    });
  }

  /** The mark under a point of the plot: the point is hovered when the pointer is on its marker. */
  private markAt(x: number, y: number): KuiLineChartMark | null {
    const marks = this.marks();
    const index = nearestPointIndex(marks, x, y, this.layout.markRadius() + MARKER_HIT_MARGIN);

    return index < 0 ? null : marks[index];
  }

  private hit(event: PointerEvent, svg: Element) {
    const point = toPlotPointer(svg as SVGSVGElement, event);
    const mark = this.markAt(point.x, point.y);

    return mark ? { seriesId: mark.seriesId, key: mark.key, text: this.markLabel(mark) } : null;
  }

  protected onPlotPointerMove(event: PointerEvent, svg: Element, group: Element): void {
    if (event.pointerType === 'touch' || event.pointerType === 'pen') return;
    this.session.hover(this.hit(event, svg), event, group);
  }

  protected onPlotPointerDown(event: PointerEvent, svg: Element, group: Element): void {
    const hit = this.hit(event, svg);
    if (!hit) return;

    if (event.pointerType === 'touch' || event.pointerType === 'pen') {
      this.session.hover(hit, event, group);
      return;
    }

    // A press puts the keyboard where the pointer is, without moving the tooltip off the cursor.
    this.session.moveRoving(hit.key);
    this.session.focusMark(hit.key);
    keepFocusOnPress(event);
  }

  protected onMarkFocus(mark: KuiLineChartMark, target: Element): void {
    this.session.focus(mark.key, mark.seriesId, this.markLabel(mark), target);
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

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
  KuiChartLegendEntry,
  KuiChartLegendSource,
  KuiChartMarkerShape,
  KuiChartScatterSeries,
  KuiChartTooltipFormatter,
  KuiChartValueFormat,
} from '../chart.types';
import type { KuiChartNavMark } from '../core/chart-keyboard-nav.util';
import { KuiChartLayout } from '../core/chart-layout';
import type { KuiChartTickAnchor } from '../core/chart-layout.util';
import { computeInsets, selectTickIndices } from '../core/chart-layout.util';
import type { KuiChartPlotRect } from '../core/chart-nearest.util';
import { normalizeScatterSeries } from '../core/chart-normalize.util';
import {
  keepFocusOnPress,
  KUI_CHART_PLOT_HIT_REACH,
  toPlotPointer,
} from '../core/chart-pointer.util';
import {
  computeLoadingGridLines,
  computeNiceScale,
  computeScatterDomain,
} from '../core/chart-scale.util';
import { KuiChartSession } from '../core/chart-session';
import {
  KUI_CHART_MARKER_SHAPES,
  markerPath,
  markerShapeForSeries,
} from '../core/chart-symbols.util';
import type { KuiChartAxisTick } from '../core/kui-chart-axis';
import { KuiChartAxis } from '../core/kui-chart-axis';
import { KuiChartSwatch } from '../core/kui-chart-swatch';

/** See the matching constant's JSDoc in `kui-line-chart.ts` -- same rationale. */
const SIZE_DIMENSIONS = {
  sm: { width: 320, height: 200 },
  md: { width: 480, height: 280 },
  lg: { width: 640, height: 360 },
} as const;

/** Margins of the loading skeleton, which is a decorative sketch drawn in the nominal box. */
const LOADING_PADDING = { top: 8, right: 8, bottom: 24, left: 32 };

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

/** Smallest radius of the circle that takes focus and the pointer, in pixels: a 24px target. */
const MIN_HIT_RADIUS = 12;

interface KuiScatterChartMark {
  readonly key: string;
  readonly seriesId: string;
  readonly seriesName: string;
  readonly seriesColor: string;
  /** Index among the visible series, for keyboard navigation. */
  readonly seriesIndex: number;
  readonly shape: KuiChartMarkerShape;
  /** Position in the chart, in pixels. */
  readonly x: number;
  readonly y: number;
  /** The y of the data point, in data units. */
  readonly value: number;
  /** The x of the data point, in data units. */
  readonly dataX: number;
  /** The `r` of the data point when the chart is a bubble chart. */
  readonly dataR?: number;
  /** Radius of the drawn mark, in pixels. */
  readonly radius: number;
  /** Rank of the point inside its series when ordered by x. */
  readonly order: number;
}

@Component({
  selector: 'kui-scatter-chart',
  imports: [KuiButton, KuiCell, KuiChartAxis, KuiChartSwatch, KuiRow, KuiTable, KuiTh, KuiThGroup],
  templateUrl: './kui-scatter-chart.html',
  host: {
    class: 'kui-chart kui-scatter-chart',
    '[style.--kui-chart-height.px]': 'height()',
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
export class KuiScatterChart implements KuiChartLegendSource {
  /** Series to plot. Empty or omitted renders the empty state, never a blank canvas. */
  readonly series = input.required<readonly KuiChartScatterSeries[]>();

  /** Reads `r` from each point as the bubble radius in CSS pixels (unscaled -- see
   * `KuiChartScatterPoint.r` JSDoc). Not a separate chart type. */
  readonly bubble = input(false, { transform: booleanAttribute });

  /** Canvas height: 200 / 280 / 360px for sm / md / lg. Defaults to `defaults.scatterChart.size`, then `'md'`. */
  readonly size = input<'sm' | 'md' | 'lg' | undefined>();

  /** Shows a loading placeholder instead of the chart. */
  readonly loading = input(false, { transform: booleanAttribute });

  /** Shows the legend. Defaults to `defaults.scatterChart.legend`, then `true` when there is more than one series. */
  readonly legend = input<boolean | undefined>(undefined);

  /** Axis visibility, titles and grid line configuration. */
  readonly axes = input<KuiChartAxesOptions>({});

  /** Formats axis tick labels and legend/tooltip numbers. Defaults to the locale's compact notation (`1.2K` in English). */
  readonly valueFormat = input<KuiChartValueFormat | undefined>(undefined);

  /** Formats the tooltip text for a point. Defaults to `"<series>: (<x>, <y>)"`. */
  readonly tooltip = input<KuiChartTooltipFormatter | undefined>(undefined);

  /** Accessible name for the chart as a whole (what it shows, not per-point detail). */
  readonly ariaLabel = input<string | undefined>(undefined);

  /** Per-instance text overrides; they win over the scoped and root messages. */
  readonly messages = input<Partial<KuiChartMessages> | undefined>(undefined);

  /** State and handlers the four charts share; this chart supplies its marks and their text. */
  private readonly session = new KuiChartSession({
    idPrefix: 'kui-scatter-chart',
    defaultLabel: (messages) => messages.scatterLabel,
    ariaLabel: this.ariaLabel,
    messages: this.messages,
    valueFormat: this.valueFormat,
    tooltip: this.tooltip,
    marks: () => this.navMarks(),
    navigation: () => 'sequence',
  });

  private readonly scatterChartDefaults = inject(KuiDefaults).get('scatterChart');

  private readonly effectiveSize = computed(
    () => this.size() ?? this.scatterChartDefaults()?.size ?? 'md',
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
  protected readonly loadingScatterPoints = computed(() => {
    const { width, height } = this.nominal();
    const plotWidth = width - LOADING_PADDING.left - LOADING_PADDING.right;
    const plotHeight = height - LOADING_PADDING.top - LOADING_PADDING.bottom;
    return LOADING_SCATTER_RATIOS.map((p) => ({
      x: LOADING_PADDING.left + p.x * plotWidth,
      y: LOADING_PADDING.top + p.y * plotHeight,
    }));
  });
  protected readonly loadingGridLines = computed(() =>
    computeLoadingGridLines(LOADING_PADDING.top, this.nominal().height - LOADING_PADDING.bottom),
  );

  private readonly normalizedSeries = computed(() => normalizeScatterSeries(this.series()));

  protected readonly hasData = computed(() =>
    this.normalizedSeries().some((s) => s.points.length > 0),
  );

  protected readonly legendEnabled = computed(
    () => this.legend() ?? this.scatterChartDefaults()?.legend ?? this.series().length > 1,
  );

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

  protected readonly gridLines = computed(() => this.axes().gridLines ?? 'both');
  protected readonly showXAxis = computed(() => this.axes().x ?? true);
  protected readonly showYAxis = computed(() => this.axes().y ?? true);
  protected readonly showXGrid = computed(
    () => this.showXAxis() && (this.gridLines() === 'both' || this.gridLines() === 'vertical'),
  );
  protected readonly showYGrid = computed(
    () => this.showYAxis() && (this.gridLines() === 'both' || this.gridLines() === 'horizontal'),
  );

  private readonly xLabels = computed(() =>
    this.xScale().ticks.map((tick) => this.formatValue(tick)),
  );
  private readonly yLabels = computed(() =>
    this.yScale().ticks.map((tick) => this.formatValue(tick)),
  );

  /** The biggest radius a mark can have, so the plot leaves room for marks on its edges. */
  private readonly edgeRadius = computed(() => {
    const radius = this.layout.markRadius();
    if (!this.bubble()) return radius;

    let largest = radius;
    for (const s of this.normalizedSeries()) {
      for (const point of s.points) if (point.r !== undefined) largest = Math.max(largest, point.r);
    }

    return largest;
  });

  /** Space around the plot, fitted to the widest value label and to the titles that are drawn. */
  private readonly insets = computed(() => {
    const edge = this.edgeRadius();

    return computeInsets({
      fontSize: this.fontSize(),
      leftLabelWidth: this.showYAxis()
        ? Math.max(0, ...this.yLabels().map((label) => this.layout.textWidth(label)))
        : 0,
      bottomLabels: this.showXAxis(),
      leftTitle: this.showYAxis() && !!this.axes().yTitle,
      bottomTitle: this.showXAxis() && !!this.axes().xTitle,
      top: edge,
      right: edge,
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

  private xCoord(value: number): number {
    const { min, max } = this.xScale();
    const { x, width } = this.plot();
    const ratio = max === min ? 0.5 : (value - min) / (max - min);
    return x + ratio * width;
  }

  private yCoord(value: number): number {
    const { min, max } = this.yScale();
    const { y, height } = this.plot();
    const ratio = max === min ? 0.5 : (value - min) / (max - min);
    return y + (1 - ratio) * height;
  }

  protected readonly visibleSeries = computed(() =>
    this.normalizedSeries().filter((s) => !this.hiddenSeriesIds().has(s.seriesId)),
  );

  /** More than one series: the marks differ in shape as well as in colour. */
  private readonly distinctShapes = computed(() => this.normalizedSeries().length > 1);

  /** Every series, hidden or not, so the legend can bring a hidden one back. */
  protected readonly legendSeries = computed(() =>
    this.normalizedSeries().map((s, index) => ({
      ...s,
      shape: markerShapeForSeries(index, this.distinctShapes()),
    })),
  );

  /** Public {@link KuiChartLegendSource} implementation -- see the class doc. */
  readonly legendItems: () => readonly KuiChartLegendEntry[] = computed(() =>
    this.legendSeries().map((s) => ({
      id: s.seriesId,
      label: s.seriesName,
      color: s.seriesColor,
      hidden: this.isSeriesHidden(s.seriesId),
      shape: this.distinctShapes() ? s.shape : undefined,
    })),
  );

  /** Public {@link KuiChartLegendSource} implementation -- see the class doc. */
  readonly hoveredLegendId: () => string | null = computed(() => this.hoveredSeriesId());

  /**
   * One mark per point of every visible series. Series run in order and the points of a series by
   * their x, which is also the order the arrow keys follow.
   */
  protected readonly marks = computed<readonly KuiScatterChartMark[]>(() => {
    const result: KuiScatterChartMark[] = [];
    const all = this.normalizedSeries();
    const distinct = this.distinctShapes();
    const baseRadius = this.layout.markRadius();

    this.visibleSeries().forEach((s, seriesIndex) => {
      const shape = markerShapeForSeries(all.indexOf(s), distinct);
      const indexed = s.points.map((point, index) => ({ point, index }));
      indexed.sort((a, b) => a.point.x - b.point.x || a.point.y - b.point.y || a.index - b.index);

      indexed.forEach(({ point, index }, order) => {
        result.push({
          key: `${s.seriesId}:${index}`,
          seriesId: s.seriesId,
          seriesName: s.seriesName,
          seriesColor: s.seriesColor,
          seriesIndex,
          shape,
          x: this.xCoord(point.x),
          y: this.yCoord(point.y),
          value: point.y,
          dataX: point.x,
          dataR: this.bubble() ? point.r : undefined,
          radius: this.bubble() && point.r !== undefined ? point.r : baseRadius,
          order,
        });
      });
    });

    return result;
  });

  private readonly navMarks = computed<readonly KuiChartNavMark[]>(() =>
    this.marks().map((mark) => ({
      key: mark.key,
      series: mark.seriesIndex,
      category: mark.order,
      x: mark.x,
      y: mark.y,
    })),
  );

  /** Outline of every marker shape at the default mark radius, for plain scatter points. */
  protected readonly markerPaths = computed(() => {
    const radius = this.layout.markRadius();
    return Object.fromEntries(
      KUI_CHART_MARKER_SHAPES.map((shape) => [shape, markerPath(shape, radius)]),
    ) as Record<KuiChartMarkerShape, string>;
  });

  /** The outline of one mark; a bubble scales its shape to its own radius. */
  protected outline(mark: KuiScatterChartMark): string {
    return mark.radius === this.layout.markRadius()
      ? this.markerPaths()[mark.shape]
      : markerPath(mark.shape, mark.radius);
  }

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

  protected readonly xTicks = computed<readonly KuiChartAxisTick[]>(() => {
    const ticks = this.xScale().ticks;
    const labels = this.xLabels();
    const boxes = ticks.map((tick, index) => ({
      position: this.xCoord(tick),
      width: this.layout.textWidth(labels[index]),
    }));
    const selected = selectTickIndices(boxes);

    return selected.map((index, rank) => {
      const anchor: KuiChartTickAnchor =
        selected.length === 1
          ? 'middle'
          : rank === 0
            ? 'start'
            : rank === selected.length - 1
              ? 'end'
              : 'middle';

      return { position: boxes[index].position, label: labels[index], full: labels[index], anchor };
    });
  });

  protected readonly yTicks = computed<readonly KuiChartAxisTick[]>(() =>
    this.yScale().ticks.map((tick, index) => ({
      position: this.yCoord(tick),
      label: this.yLabels()[index],
      full: this.yLabels()[index],
      anchor: 'end' as const,
    })),
  );

  constructor() {
    effect(() => {
      this.marks();
      untracked(() => this.session.restoreFocus());
    });
  }

  /** Radius of the circle that takes focus: at least a 24px target. */
  protected hitRadius(mark: KuiScatterChartMark): number {
    return Math.max(mark.radius, MIN_HIT_RADIUS);
  }

  protected markLabel(mark: KuiScatterChartMark): string {
    return this.session.pointText({
      seriesName: mark.seriesName,
      x: mark.dataX,
      y: mark.value,
      value: mark.value,
      r: mark.dataR,
    });
  }

  protected readonly hitReach = KUI_CHART_PLOT_HIT_REACH;

  /** The mark under a point of the plot: the pointer must be on the mark's hit circle. */
  private markAt(x: number, y: number): KuiScatterChartMark | null {
    let best: KuiScatterChartMark | null = null;
    let bestDistance = Number.POSITIVE_INFINITY;

    for (const mark of this.marks()) {
      const distance = Math.hypot(mark.x - x, mark.y - y);

      if (distance <= this.hitRadius(mark) && distance <= bestDistance) {
        best = mark;
        bestDistance = distance;
      }
    }

    return best;
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

  protected onMarkFocus(mark: KuiScatterChartMark, target: Element): void {
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

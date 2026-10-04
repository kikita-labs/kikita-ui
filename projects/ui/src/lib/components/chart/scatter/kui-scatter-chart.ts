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
import { KuiDefaults } from '../../../providers/kui-defaults';
import { KuiButton } from '../../button';
import { KuiCell, KuiRow, KuiTable, KuiTh, KuiThGroup } from '../../table';
import type {
  KuiChartAxesOptions,
  KuiChartLegendEntry,
  KuiChartLegendSource,
  KuiChartScatterSeries,
  KuiChartTooltipFormatter,
  KuiChartValueFormat,
} from '../chart.types';
import { normalizeScatterSeries } from '../core/chart-normalize.util';
import {
  computeLoadingGridLines,
  computeNiceScale,
  computeScatterDomain,
} from '../core/chart-scale.util';
import { KuiChartSession } from '../core/chart-session';

/** See the matching constant's JSDoc in `kui-line-chart.ts` -- same rationale. */
const SIZE_DIMENSIONS = {
  sm: { width: 320, height: 200 },
  md: { width: 480, height: 280 },
  lg: { width: 640, height: 360 },
} as const;

/** See the matching constant's JSDoc in `kui-line-chart.ts` -- same rationale. Both
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
  imports: [KuiButton, KuiCell, KuiRow, KuiTable, KuiTh, KuiThGroup],
  templateUrl: './kui-scatter-chart.html',
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
export class KuiScatterChart implements KuiChartLegendSource {
  /** Series to plot. Empty or omitted renders the empty state, never a blank canvas. */
  readonly series = input.required<readonly KuiChartScatterSeries[]>();

  /** Reads `r` from each point as the bubble radius (SVG viewBox units, unscaled -- see
   * `KuiChartScatterPoint.r` JSDoc). Not a separate chart type. */
  readonly bubble = input(false, { transform: booleanAttribute });

  /** Canvas height: 200 / 280 / 360px for sm / md / lg. Defaults to `defaults.scatterChart.size`, then `'md'`. */
  readonly size = input<'sm' | 'md' | 'lg' | undefined>();

  /** Shows a loading placeholder instead of the chart. */
  readonly loading = input(false, { transform: booleanAttribute });

  /** Shows the legend. Defaults to `defaults.scatterChart.legend`, then `true` when there is more than one series. */
  readonly legend = input<boolean | undefined>(undefined);

  /** Axis visibility and grid line configuration. */
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

  private readonly scatterChartDefaults = inject(KuiDefaults).get('scatterChart');

  private readonly effectiveSize = computed(
    () => this.size() ?? this.scatterChartDefaults()?.size ?? 'md',
  );

  protected readonly dimensions = computed(() => SIZE_DIMENSIONS[this.effectiveSize()]);

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
    return this.session.pointText({
      seriesName: mark.seriesName,
      x: mark.x,
      y: mark.value,
      value: mark.value,
    });
  }

  protected onMarkEnter(
    mark: KuiScatterChartMark,
    index: number,
    event: PointerEvent,
    group: Element,
  ): void {
    this.session.enter(mark.seriesId, index, this.markLabel(mark), event, group);
  }

  protected onMarkFocus(mark: KuiScatterChartMark, index: number, target: Element): void {
    this.session.focus(index, index, this.markLabel(mark), target);
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

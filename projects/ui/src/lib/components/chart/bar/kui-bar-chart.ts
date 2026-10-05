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
import { KuiSkeleton } from '../../skeleton';
import { KuiCell, KuiRow, KuiTable, KuiTh, KuiThGroup } from '../../table';
import type {
  KuiChartAxesOptions,
  KuiChartCartesianSeries,
  KuiChartLegendEntry,
  KuiChartLegendSource,
  KuiChartTooltipFormatter,
  KuiChartValueFormat,
} from '../chart.types';
import type { KuiChartBarEnd } from '../core/chart-bar-path.util';
import { barPath } from '../core/chart-bar-path.util';
import type { KuiChartNavigationModel, KuiChartNavMark } from '../core/chart-keyboard-nav.util';
import { KuiChartLayout } from '../core/chart-layout';
import type { KuiChartTickAnchor } from '../core/chart-layout.util';
import { computeInsets, selectTickIndices, truncateToWidth } from '../core/chart-layout.util';
import type { KuiChartPlotRect } from '../core/chart-nearest.util';
import { distanceToRect } from '../core/chart-nearest.util';
import type { KuiChartNormalizedCartesianSeries } from '../core/chart-normalize.util';
import { normalizeCartesianSeries } from '../core/chart-normalize.util';
import { patternId, patternPaint } from '../core/chart-pattern.util';
import { keepFocusOnPress, toPlotPointer } from '../core/chart-pointer.util';
import {
  computeGroupedDomain,
  computeNiceScale,
  computeStackedDomain,
} from '../core/chart-scale.util';
import { KuiChartSession } from '../core/chart-session';
import type { KuiChartAxisTick } from '../core/kui-chart-axis';
import { KuiChartAxis } from '../core/kui-chart-axis';
import { KuiChartPatterns } from '../core/kui-chart-patterns';
import { KuiChartSwatch } from '../core/kui-chart-swatch';

/** See the matching constant's JSDoc in `kui-line-chart.ts` -- same rationale. */
const SIZE_DIMENSIONS = {
  sm: { width: 320, height: 200 },
  md: { width: 480, height: 280 },
  lg: { width: 640, height: 360 },
} as const;

/** Longest axis label drawn in full, in pixels; a longer one is cut with an ellipsis. */
const MAX_TICK_LABEL_WIDTH = 120;

/** The category labels of a horizontal chart take at most this share of its width. */
const MAX_CATEGORY_LABEL_SHARE = 0.35;

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
  readonly key: string;
  readonly seriesId: string;
  readonly seriesName: string;
  readonly seriesColor?: string;
  /** Index among the visible series, for keyboard navigation. */
  readonly seriesIndex: number;
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
  /** Outline of the bar: its end away from the axis is rounded. */
  readonly d: string;
}

@Component({
  selector: 'kui-bar-chart',
  imports: [
    KuiButton,
    KuiCell,
    KuiChartAxis,
    KuiChartPatterns,
    KuiChartSwatch,
    KuiRow,
    KuiSkeleton,
    KuiTable,
    KuiTh,
    KuiThGroup,
  ],
  templateUrl: './kui-bar-chart.html',
  host: {
    class: 'kui-chart kui-bar-chart',
    '[style.--kui-chart-height.px]': 'height()',
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
export class KuiBarChart implements KuiChartLegendSource {
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

  /**
   * Fills series with hatch patterns instead of plain colour, so series differ by texture as well as
   * hue. Turned on automatically in forced colours.
   */
  readonly patterns = input(false, { transform: booleanAttribute });

  /** Canvas height: 200 / 280 / 360px for sm / md / lg. Defaults to `defaults.barChart.size`, then `'md'`. */
  readonly size = input<'sm' | 'md' | 'lg' | undefined>();

  /** Shows a loading placeholder instead of the chart. */
  readonly loading = input(false, { transform: booleanAttribute });

  /** Shows the legend. Defaults to `defaults.barChart.legend`, then `true` when there is more than one series. */
  readonly legend = input<boolean | undefined>(undefined);

  /** Axis visibility, titles and grid line configuration. */
  readonly axes = input<KuiChartAxesOptions>({});

  /** Formats axis tick labels and legend/tooltip numbers. Defaults to the locale's compact notation (`1.2K` in English). */
  readonly valueFormat = input<KuiChartValueFormat | undefined>(undefined);

  /** Formats the tooltip text for a bar. Defaults to `"<series> · <category>: <value>"`. */
  readonly tooltip = input<KuiChartTooltipFormatter | undefined>(undefined);

  /** Accessible name for the chart as a whole (what it shows, not per-bar detail). */
  readonly ariaLabel = input<string | undefined>(undefined);

  /** Per-instance text overrides; they win over the scoped and root messages. */
  readonly messages = input<Partial<KuiChartMessages> | undefined>(undefined);

  /** State and handlers the four charts share; this chart supplies its marks and their text. */
  private readonly session = new KuiChartSession({
    idPrefix: 'kui-bar-chart',
    defaultLabel: (messages) => messages.barLabel,
    ariaLabel: this.ariaLabel,
    messages: this.messages,
    valueFormat: this.valueFormat,
    tooltip: this.tooltip,
    marks: () => this.navMarks(),
    navigation: () => this.navigation(),
  });

  private readonly barChartDefaults = inject(KuiDefaults).get('barChart');

  private readonly effectiveSize = computed(
    () => this.size() ?? this.barChartDefaults()?.size ?? 'md',
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
  protected readonly hoveredBarKey = this.session.hoveredMarkKey;
  protected readonly rovingKey = this.session.rovingKey;
  protected readonly showTable = this.session.showTable;
  protected readonly formatValue = this.session.formatValue;
  protected readonly onBarsPointerLeave = this.session.onPointerLeave;
  protected readonly onBarsFocusOut = this.session.onFocusOut;
  protected readonly onBarsKeydown = this.session.onKeydown;
  protected readonly toggleSeries = this.session.toggle;
  protected readonly isSeriesHidden = this.session.isHidden;
  protected readonly loadingBarHeights = LOADING_BAR_HEIGHTS;
  protected readonly loadingGridLineOffsets = LOADING_GRID_LINE_OFFSETS;

  protected readonly width = this.layout.width;
  protected readonly height = computed(() => SIZE_DIMENSIONS[this.effectiveSize()].height);
  protected readonly fontSize = computed(() => this.layout.font().size);

  protected readonly isVertical = computed(() => this.orientation() === 'vertical');

  private readonly normalizedSeries = computed((): readonly KuiChartNormalizedCartesianSeries[] =>
    normalizeCartesianSeries(this.series(), this.categories(), 'bar'),
  );

  protected readonly hasData = computed(() =>
    this.normalizedSeries().some((s) => s.slots.some((slot) => slot !== null)),
  );

  protected readonly legendEnabled = computed(
    () => this.legend() ?? this.barChartDefaults()?.legend ?? this.series().length > 1,
  );

  /** Stacking only applies with more than one series -- a single series stacked on itself is a
   * no-op that should just render as a normal (grouped-of-one) bar, not a special case. */
  protected readonly isStacked = computed(
    () => this.stacked() && this.normalizedSeries().length > 1,
  );

  /** Grouped bars read in one list; stacked bars are a grid of categories and segments. */
  private readonly navigation = computed<KuiChartNavigationModel>(() => {
    if (!this.isStacked()) return 'sequence';
    return this.isVertical() ? 'columns' : 'rows';
  });

  private readonly domain = computed(() => {
    const series = this.normalizedSeries();
    return this.isStacked()
      ? computeStackedDomain(series, this.categories().length, this.hiddenSeriesIds())
      : computeGroupedDomain(series);
  });
  private readonly scale = computed(() => computeNiceScale(this.domain().min, this.domain().max));

  /** `axes.x`/`axes.y` stay semantic while orientation changes their screen placement. */
  protected readonly showCategoryAxis = computed(() => this.axes().x ?? true);
  protected readonly showValueAxis = computed(() => this.axes().y ?? true);

  private readonly gridLines = computed(() => this.axes().gridLines ?? 'both');
  protected readonly showValueGrid = computed(() => {
    const lines = this.gridLines();
    const valueGridIsHorizontal = this.isVertical();
    return (
      this.showValueAxis() &&
      (lines === 'both' || lines === (valueGridIsHorizontal ? 'horizontal' : 'vertical'))
    );
  });
  protected readonly showCategoryGrid = computed(() => {
    const lines = this.gridLines();
    const categoryGridIsHorizontal = !this.isVertical();
    return (
      this.showCategoryAxis() &&
      (lines === 'both' || lines === (categoryGridIsHorizontal ? 'horizontal' : 'vertical'))
    );
  });

  private readonly valueLabels = computed(() =>
    this.scale().ticks.map((tick) => this.formatValue(tick)),
  );

  /** Longest a category label may be: a fixed length, and a share of the width on a horizontal chart. */
  private readonly categoryLabelLimit = computed(() =>
    this.isVertical()
      ? MAX_TICK_LABEL_WIDTH
      : Math.min(MAX_TICK_LABEL_WIDTH, this.width() * MAX_CATEGORY_LABEL_SHARE),
  );

  /** The category labels, each cut to the width one label may take. */
  private readonly categoryLabels = computed(() =>
    this.categories().map((label) =>
      truncateToWidth(label, this.categoryLabelLimit(), (text) => this.layout.textWidth(text)),
    ),
  );

  /** Space around the plot, fitted to the widest label on the left and to the titles that are drawn. */
  private readonly insets = computed(() => {
    const vertical = this.isVertical();
    const leftLabels = vertical ? this.valueLabels() : this.categoryLabels();
    const showLeft = vertical ? this.showValueAxis() : this.showCategoryAxis();
    const showBottom = vertical ? this.showCategoryAxis() : this.showValueAxis();
    const xTitle = this.axes().xTitle;
    const yTitle = this.axes().yTitle;

    return computeInsets({
      fontSize: this.fontSize(),
      leftLabelWidth: showLeft
        ? Math.max(0, ...leftLabels.map((label) => this.layout.textWidth(label)))
        : 0,
      bottomLabels: showBottom,
      leftTitle: showLeft && !!(vertical ? yTitle : xTitle),
      bottomTitle: showBottom && !!(vertical ? xTitle : yTitle),
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

  /** Position along the value screen axis (Y when vertical, X when horizontal). Vertical inverts
   * (larger value = smaller Y, matching SVG's top-down coordinate space); horizontal does not. */
  private valueCoord(value: number): number {
    const { min, max } = this.scale();
    const { x, y, width, height } = this.plot();
    const ratio = max === min ? 0.5 : (value - min) / (max - min);
    return this.isVertical() ? y + (1 - ratio) * height : x + ratio * width;
  }

  /** Start of a category band along the category screen axis (X when vertical, Y when
   * horizontal). */
  private categoryBandStart(index: number): number {
    const count = this.categories().length || 1;
    const { x, y, width, height } = this.plot();
    return this.isVertical() ? x + (index / count) * width : y + (index / count) * height;
  }

  private readonly categoryAxisLength = computed(() =>
    this.isVertical() ? this.plot().width : this.plot().height,
  );

  protected readonly visibleSeries = computed(() =>
    this.normalizedSeries().filter((s) => !this.hiddenSeriesIds().has(s.seriesId)),
  );

  /** Every series regardless of hidden state -- see `kui-line-chart`'s matching `legendSeries`
   * doc for why the legend must stay interactive for hidden series. */
  protected readonly legendSeries = computed(() => this.normalizedSeries());

  /** Public {@link KuiChartLegendSource} implementation -- see the class doc. */
  readonly legendItems: () => readonly KuiChartLegendEntry[] = computed(() =>
    this.legendSeries().map((s, index) => ({
      id: s.seriesId,
      label: s.seriesName,
      color: s.seriesColor,
      hidden: this.isSeriesHidden(s.seriesId),
      pattern: this.patterns() ? index : undefined,
    })),
  );

  /** The hatch patterns of every series, defined once for `patterns` and for forced colours. */
  protected readonly patternDefs = computed(() =>
    this.normalizedSeries().map((s, index) => ({
      id: patternId(this.chartId, index),
      index,
      color: s.seriesColor,
    })),
  );

  private readonly patternIndexBySeries = computed(
    () => new Map(this.normalizedSeries().map((s, index) => [s.seriesId, index])),
  );

  /** The fill of a bar: its series colour, or its hatch pattern when `patterns` is on. */
  protected fillOf(seriesId: string, color: string | undefined): string | undefined {
    return this.patterns() ? this.patternOf(seriesId) : color;
  }

  /** The hatch paint of a series, read by the forced-colours styles. */
  protected patternOf(seriesId: string): string {
    return patternPaint(this.chartId, this.patternIndexBySeries().get(seriesId) ?? 0);
  }

  /** The pattern index of a series for its legend swatch, or `undefined` without `patterns`. */
  protected legendPattern(seriesId: string): number | undefined {
    return this.patterns() ? this.patternIndexBySeries().get(seriesId) : undefined;
  }

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

        const end: KuiChartBarEnd | null = !roundsFarEnd
          ? null
          : isVertical
            ? value >= 0
              ? 'top'
              : 'bottom'
            : value >= 0
              ? 'right'
              : 'left';
        const d = barPath(x, y, width, height, this.layout.barRadius(), end);

        result.push({
          key: `${s.seriesId}:${categoryIndex}`,
          seriesId: s.seriesId,
          seriesName: s.seriesName,
          seriesColor: s.seriesColor,
          seriesIndex,
          categoryIndex,
          categoryLabel: slot.categoryLabel,
          value,
          x,
          y,
          width,
          height,
          d,
        });
      });
    }
    return result;
  });

  private readonly navMarks = computed<readonly KuiChartNavMark[]>(() =>
    this.bars().map((bar) => ({
      key: bar.key,
      series: bar.seriesIndex,
      category: bar.categoryIndex,
      x: bar.x + bar.width / 2,
      y: bar.y + bar.height / 2,
    })),
  );

  /** The category labels that fit without touching, measured; labels sit at the middle of their band. */
  private readonly categoryTicks = computed<readonly KuiChartAxisTick[]>(() => {
    const labels = this.categoryLabels();
    const categories = this.categories();
    const count = categories.length || 1;
    const bandSize = this.categoryAxisLength() / count;
    const vertical = this.isVertical();
    const lineHeight = Math.ceil(this.fontSize() * 1.25);
    const boxes = labels.map((label, index) => ({
      position: this.categoryBandStart(index) + bandSize / 2,
      width: vertical ? this.layout.textWidth(label) : lineHeight,
    }));
    const selected = selectTickIndices(boxes, 8, false);

    // Band centres sit inside the plot, so no label needs an inward anchor.
    return selected.map((index) => ({
      position: boxes[index].position,
      label: labels[index],
      full: categories[index],
      anchor: 'middle' as KuiChartTickAnchor,
    }));
  });

  /** The value labels that fit without touching. */
  private readonly valueTicks = computed<readonly KuiChartAxisTick[]>(() => {
    const ticks = this.scale().ticks;
    const labels = this.valueLabels();
    const vertical = this.isVertical();
    const lineHeight = Math.ceil(this.fontSize() * 1.25);
    const boxes = ticks.map((tick, index) => ({
      position: this.valueCoord(tick),
      width: vertical ? lineHeight : this.layout.textWidth(labels[index]),
    }));
    const selected = selectTickIndices(boxes, 8, !vertical);

    return selected.map((index, rank) => {
      const anchor: KuiChartTickAnchor =
        vertical || selected.length === 1
          ? 'middle'
          : rank === 0
            ? 'start'
            : rank === selected.length - 1
              ? 'end'
              : 'middle';

      return { position: boxes[index].position, label: labels[index], full: labels[index], anchor };
    });
  });

  /** Ticks of the axis along the bottom of the plot. */
  protected readonly bottomTicks = computed(() =>
    this.isVertical() ? this.categoryTicks() : this.valueTicks(),
  );

  /** Ticks of the axis along the left of the plot. */
  protected readonly leftTicks = computed(() =>
    this.isVertical() ? this.valueTicks() : this.categoryTicks(),
  );

  protected readonly showBottomAxis = computed(() =>
    this.isVertical() ? this.showCategoryAxis() : this.showValueAxis(),
  );
  protected readonly showLeftAxis = computed(() =>
    this.isVertical() ? this.showValueAxis() : this.showCategoryAxis(),
  );
  protected readonly bottomGrid = computed(() =>
    this.isVertical() ? this.showCategoryGrid() : this.showValueGrid(),
  );
  protected readonly leftGrid = computed(() =>
    this.isVertical() ? this.showValueGrid() : this.showCategoryGrid(),
  );
  protected readonly bottomTitle = computed(() =>
    this.isVertical() ? this.axes().xTitle : this.axes().yTitle,
  );
  protected readonly leftTitle = computed(() =>
    this.isVertical() ? this.axes().yTitle : this.axes().xTitle,
  );

  constructor() {
    effect(() => {
      this.bars();
      untracked(() => this.session.restoreFocus());
    });
  }

  protected markLabel(bar: KuiBarChartBar): string {
    return this.session.pointText({
      seriesName: bar.seriesName,
      categoryLabel: bar.categoryLabel,
      value: bar.value,
    });
  }

  /**
   * The bar under a point of the plot: any point inside a category band picks the bar of that band
   * nearest to it, so a thin or short bar is not the only thing to aim at.
   */
  private barAt(x: number, y: number): KuiBarChartBar | null {
    const plot = this.plot();
    if (x < plot.x || x > plot.x + plot.width || y < plot.y || y > plot.y + plot.height) {
      return null;
    }

    const count = this.categories().length;
    if (count === 0) return null;

    const band = this.categoryAxisLength() / count;
    const along = this.isVertical() ? x - plot.x : y - plot.y;
    const category = Math.min(count - 1, Math.max(0, Math.floor(along / band)));

    let best: KuiBarChartBar | null = null;
    let bestDistance = Number.POSITIVE_INFINITY;

    for (const bar of this.bars()) {
      if (bar.categoryIndex !== category) continue;

      const distance = distanceToRect(bar, x, y);

      if (distance < bestDistance) {
        best = bar;
        bestDistance = distance;
      }
    }

    // Only a pointer on the bar itself counts, not one merely near it.
    return bestDistance <= 0 ? best : null;
  }

  private hit(event: PointerEvent, svg: Element) {
    const point = toPlotPointer(svg as SVGSVGElement, event);
    const bar = this.barAt(point.x, point.y);

    return bar ? { seriesId: bar.seriesId, key: bar.key, text: this.markLabel(bar) } : null;
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

  protected onBarFocus(bar: KuiBarChartBar, target: Element): void {
    this.session.focus(bar.key, bar.seriesId, this.markLabel(bar), target);
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

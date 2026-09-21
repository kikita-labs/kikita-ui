/**
 * Formats a raw numeric value for axis ticks, tooltip text, and legend labels. Not used for the
 * alt-table representation, which always shows exact values -- see `docs/chart.md`.
 */
export type KuiChartValueFormat = (value: number) => string;

/** Which grid lines a cartesian chart draws, named by screen orientation, not axis semantics. */
export type KuiChartGridLines = 'both' | 'horizontal' | 'vertical' | 'none';

/**
 * Axis configuration shared by `kui-line-chart`, `kui-bar-chart`, and `kui-scatter-chart`.
 * `x`/`y` always refer to the semantic category/value axes, independent of `kui-bar-chart`'s
 * `orientation` -- only the on-screen placement of the axes changes when a bar chart is
 * horizontal, never which axis `x`/`y`/`xTitle`/`yTitle` describe.
 */
export interface KuiChartAxesOptions {
  /** Shows the categorical axis (grid, spine, tick labels). Defaults to `true`. */
  readonly x?: boolean;
  /** Shows the value axis (grid, spine, tick labels). Defaults to `true`. */
  readonly y?: boolean;
  /** Which grid lines to draw, by screen orientation. Defaults to `'both'`. */
  readonly gridLines?: KuiChartGridLines;
  /** Label for the categorical axis, rendered outside the SVG. */
  readonly xTitle?: string;
  /** Label for the value axis, rendered outside the SVG. */
  readonly yTitle?: string;
}

/**
 * One series for `kui-line-chart`/`kui-bar-chart`: values aligned index-for-index with the
 * chart's `categories`. `null` marks a gap (the line breaks / the bar is omitted for that
 * category); `NaN`/`Infinity` are treated the same as `null`. Provide `id` when `name` is not
 * guaranteed unique or stable (localized labels, editable names) -- legend hide/show state,
 * color persistence, and focus restoration key off `id ?? name`, so a duplicate `name` without an
 * `id` will not behave reliably across data updates.
 */
export interface KuiChartCartesianSeries {
  /** Stable identity for this series. Falls back to `name` when omitted -- see class doc. */
  readonly id?: string;
  /** Display name, shown in the legend and default tooltip text. */
  readonly name: string;
  /** CSS color override. Defaults to one of the five `--kui-chart-series-*` tokens, by index. */
  readonly color?: string;
  /** Values aligned with the chart's `categories`. `null` marks a gap in this series. */
  readonly data: readonly (number | null)[];
}

/** One coordinate for `kui-scatter-chart`. `r` is read only when the chart's `bubble` is `true`. */
export interface KuiChartScatterPoint {
  /** Position on the horizontal axis, in the series' own data units. */
  readonly x: number;
  /** Position on the vertical axis, in the series' own data units. */
  readonly y: number;
  /**
   * Bubble radius in SVG viewBox units. Read only when `bubble` is `true`.
   * The component does not clamp it; consumers must keep it within the plot area.
   */
  readonly r?: number;
}

/** One series for `kui-scatter-chart`. See {@link KuiChartCartesianSeries} for `id` guidance. */
export interface KuiChartScatterSeries {
  /** Stable identity for this series. Falls back to `name` when omitted. */
  readonly id?: string;
  /** Display name, shown in the legend and default tooltip text. */
  readonly name: string;
  /** CSS color override. Defaults to one of the five `--kui-chart-series-*` tokens, by index. */
  readonly color?: string;
  /** Coordinates for this series. */
  readonly points: readonly KuiChartScatterPoint[];
}

/**
 * One slice for `kui-donut-chart`. Negative `value` is treated as invalid input (donut shares
 * cannot be negative) and is dropped during normalization. See {@link KuiChartCartesianSeries}
 * for `id ?? label` identity guidance -- applies here with `label` in place of `name`.
 */
export interface KuiChartSlice {
  /** Stable identity for this slice. Falls back to `label` when omitted. */
  readonly id?: string;
  /** Display label, shown in the legend, default tooltip text, and alt-table. */
  readonly label: string;
  /** Share value. Negative values are dropped during normalization. */
  readonly value: number;
  /** CSS color override. Defaults to one of the five `--kui-chart-series-*` tokens, by index. */
  readonly color?: string;
}

/**
 * Denormalized point shape passed to a consumer-supplied {@link KuiChartTooltipFormatter}. This
 * is a lossy projection of the engine's internal normalized point/slice shapes (defined in
 * `chart-normalize.util.ts`, not exported from the public barrel) for a simple, stable formatter
 * signature -- the engine itself uses the discriminated internal types.
 */
export interface KuiChartPoint {
  /** Series/slice display name or label. */
  readonly seriesName: string;
  /** Category label, for `kui-line-chart`/`kui-bar-chart` points only. */
  readonly categoryLabel?: string;
  /** Horizontal-axis position, for `kui-scatter-chart` points only. */
  readonly x?: number;
  /** Vertical-axis position, for `kui-scatter-chart` points only. */
  readonly y?: number;
  /** The plotted value -- a cartesian point's `y`, a bar's height, or a donut slice's value. */
  readonly value: number;
  /** Bubble radius, for `kui-scatter-chart` points with `bubble` enabled only. */
  readonly r?: number;
}

/** Formats the text shown in the shared chart tooltip for one point/bar/segment. */
export type KuiChartTooltipFormatter = (point: KuiChartPoint) => string;

/**
 * One legend entry, as read from a chart's public {@link KuiChartLegendSource} surface --
 * `kui-chart-legend`'s (or a fully hand-rolled legend's) rendering unit. `id` is the series/slice
 * `id ?? name`/`id ?? label` identity described on {@link KuiChartCartesianSeries} and
 * {@link KuiChartSlice} -- the same value `toggleLegendItem`/`setHoveredLegendId` take.
 */
export interface KuiChartLegendItem {
  /** Stable identity -- pass to `toggleLegendItem`/`setHoveredLegendId`. */
  readonly id: string;
  /** Display text (series `name` or slice `label`). */
  readonly label: string;
  /** Swatch color -- the series/slice's resolved color, explicit or round-robin default. */
  readonly color?: string;
  /** `true` when this item is currently hidden (its data is excluded from the chart). */
  readonly hidden: boolean;
}

/**
 * Public legend-control surface every `kui-*-chart` component implements. Every chart already
 * renders its own inline legend (the `legend` input); this interface is for building a *second*,
 * independently positioned legend instead -- pass the chart itself (via a template reference
 * variable) to `kui-chart-legend`, or read these signals/call these methods directly to build a
 * fully custom legend. Set `[legend]="false"` on the chart to suppress its own inline legend when
 * using this instead, or the same data renders twice.
 *
 * Exposes legend data and hide/hover state for any external renderer, not only
 * the chart's built-in inline markup.
 */
export interface KuiChartLegendSource {
  /** Every series/slice, in series order, regardless of hidden state -- hidden items stay in the
   * list (with `hidden: true`) so a legend can keep them clickable to bring back. */
  readonly legendItems: () => readonly KuiChartLegendItem[];
  /** The currently hovered item's `id`, or `null` -- drives cross-highlight with the chart's own
   * marks. Read this to highlight the matching legend item; call `setHoveredLegendId` on
   * pointerenter/pointerleave to highlight the matching marks from the legend side. */
  readonly hoveredLegendId: () => string | null;
  /** Hides/shows the given item -- the same toggle the chart's own inline legend items call. */
  toggleLegendItem(id: string): void;
  /** Sets (or clears, with `null`) the hovered item -- drives cross-highlight from the legend
   * toward the chart's marks. */
  setHoveredLegendId(id: string | null): void;
}

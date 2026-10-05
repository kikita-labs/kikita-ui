import type { KuiChartNormalizedCartesianSeries, KuiChartSlicePoint } from './chart-normalize.util';

/** How many evenly-spaced horizontal grid lines the loading skeleton renders for line/bar/scatter
 * -- matches `computeNiceScale`'s typical real-data tick count (5) closely enough to read as "a
 * grid is about to be here", without pretending to know the real domain before data loads. */
const LOADING_GRID_LINE_COUNT = 4;

/**
 * Evenly-spaced Y coordinates for the loading skeleton's grid lines, between `top` and
 * `bottom` (inclusive at both ends) -- shared by `kui-line-chart`/`kui-bar-chart`/
 * `kui-scatter-chart` so their loading placeholders show the same grid/axis chrome the real chart
 * will render, instead of a shape floating with no context (found by the maintainer noting the
 * loading states didn't read as "this will become a chart with axes" at all).
 */
export function computeLoadingGridLines(top: number, bottom: number): readonly number[] {
  const step = (bottom - top) / LOADING_GRID_LINE_COUNT;
  return Array.from({ length: LOADING_GRID_LINE_COUNT + 1 }, (_, i) => top + i * step);
}

/** A "nice" numeric scale: a rounded `min`/`max` domain and evenly spaced `ticks` inside it. */
export interface KuiChartNiceScale {
  readonly min: number;
  readonly max: number;
  readonly ticks: readonly number[];
}

/**
 * Computes a rounded tick scale covering `[min, max]`, expanding to round step boundaries the way
 * `d3-scale`'s `nice()` does. `min === max` (a single data point, or a fully flat series) is widened
 * by 10% of its magnitude, or by `1` around zero, so a degenerate domain still produces a usable
 * scale instead of a division by zero, and a flat series of `1_000_000` is not drawn on a `±1` axis.
 * Ticks are `niceMin + i * step` rounded to the precision the step needs, so a step of `0.0002`
 * does not collapse into repeated zeros the way a fixed three-decimal rounding would.
 */
export function computeNiceScale(min: number, max: number, tickCount = 5): KuiChartNiceScale {
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    min = 0;
    max = 1;
  }
  if (min > max) [min, max] = [max, min];
  if (min === max) {
    const padding = min === 0 ? 1 : Math.abs(min) * 0.1;
    min -= padding;
    max += padding;
  }

  const range = max - min;
  const rawStep = range / tickCount;
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const normalized = rawStep / magnitude;
  const step =
    normalized < 1.5
      ? magnitude
      : normalized < 3
        ? 2 * magnitude
        : normalized < 7
          ? 5 * magnitude
          : 10 * magnitude;
  // The epsilon keeps `0.3 / 0.1` (2.9999999999999996) from losing a whole step.
  const niceMin = Math.floor(min / step + 1e-9) * step;
  const niceMax = Math.ceil(max / step - 1e-9) * step;
  const decimals = Math.min(12, Math.max(0, -Math.floor(Math.log10(step))));
  const round = (value: number): number => Number(value.toFixed(decimals));
  const count = Math.max(1, Math.round((niceMax - niceMin) / step));
  const ticks = Array.from({ length: count + 1 }, (_, index) => round(niceMin + index * step));

  return { min: round(niceMin), max: round(niceMax), ticks };
}

/**
 * Computes the value-axis domain for grouped (non-stacked) line/bar series: always includes `0`
 * (`--kui-chart` charts never suppress the zero baseline), but does not clamp out negative
 * values -- the domain is `[min(0, dataMin), max(0, dataMax)]`, not `[0, dataMax]`.
 */
export function computeGroupedDomain(series: readonly KuiChartNormalizedCartesianSeries[]): {
  min: number;
  max: number;
} {
  let min = 0;
  let max = 0;
  for (const s of series) {
    for (const slot of s.slots) {
      if (slot === null) continue;
      if (slot.y < min) min = slot.y;
      if (slot.y > max) max = slot.y;
    }
  }
  return { min, max };
}

/**
 * Computes the value-axis domain for stacked bar series: per category, positive values sum
 * separately from negative values (diverging stacking, the same strategy as D3's
 * `stackOffsetDiverging`) -- the domain is not the sum of all values regardless of sign, and it
 * is not the max of any single series. A hidden series (see `hiddenSeriesIds`) is excluded from
 * the sums, matching stacked bar's "hiding a series collapses the stack" behavior -- unlike
 * grouped line/bar, where the axis domain intentionally stays fixed across all series regardless
 * of hidden state.
 */
export function computeStackedDomain(
  series: readonly KuiChartNormalizedCartesianSeries[],
  categoryCount: number,
  hiddenSeriesIds: ReadonlySet<string> = new Set(),
): { min: number; max: number } {
  let min = 0;
  let max = 0;
  for (let categoryIndex = 0; categoryIndex < categoryCount; categoryIndex++) {
    let positiveSum = 0;
    let negativeSum = 0;
    for (const s of series) {
      if (hiddenSeriesIds.has(s.seriesId)) continue;
      const slot = s.slots[categoryIndex];
      if (slot === null) continue;
      if (slot.y >= 0) positiveSum += slot.y;
      else negativeSum += slot.y;
    }
    if (positiveSum > max) max = positiveSum;
    if (negativeSum < min) min = negativeSum;
  }
  return { min, max };
}

/**
 * Computes the domain for one numeric axis of `kui-scatter-chart` from every series' points
 * (`accessor` picks `x` or `y`), across ALL series regardless of hidden state (consistent with
 * `computeGroupedDomain`'s "hiding never recomputes the scale" rule for line/grouped-bar).
 * Deliberately does **not** force the domain to include `0`, unlike `computeGroupedDomain` --
 * scatter plots typically correlate two independent measures (e.g. age vs. income) where forcing
 * a zero baseline on either axis would compress the data range. This deliberate
 * per-type deviation from cartesian charts is documented in `docs/chart.md`.
 */
export function computeScatterDomain(
  series: readonly { readonly points: readonly { readonly x: number; readonly y: number }[] }[],
  accessor: 'x' | 'y',
): { min: number; max: number } {
  let min = Infinity;
  let max = -Infinity;
  for (const s of series) {
    for (const point of s.points) {
      const value = point[accessor];
      if (value < min) min = value;
      if (value > max) max = value;
    }
  }
  if (!Number.isFinite(min) || !Number.isFinite(max)) return { min: 0, max: 0 };
  return { min, max };
}

/**
 * Picks which category indices get a rendered tick label so labels do not overlap at high
 * density. `minLabelWidth` is an estimate in the same SVG viewBox units as
 * `availableWidth`; labels are not measured individually.
 *
 * The last index is always force-included (so the axis never silently drops its final category),
 * which the even `step` spacing above it does not account for -- the gap between the
 * second-to-last natural tick and the forced last one can land under `minLabelWidth`.
 * Edge labels anchor inward, so the second-to-last tick is dropped when that gap is too narrow.
 */
export function thinTicks(
  categoryCount: number,
  availableWidth: number,
  minLabelWidth: number,
): readonly number[] {
  if (categoryCount <= 0) return [];
  if (categoryCount === 1) return [0];

  const maxLabels = Math.max(1, Math.floor(availableWidth / minLabelWidth));
  if (maxLabels >= categoryCount) {
    return Array.from({ length: categoryCount }, (_, i) => i);
  }

  const step = Math.ceil((categoryCount - 1) / (maxLabels - 1));
  const indices: number[] = [];
  for (let i = 0; i < categoryCount; i += step) indices.push(i);
  if (indices.at(-1) !== categoryCount - 1) indices.push(categoryCount - 1);

  if (indices.length > 2) {
    const pxPerCategory = availableWidth / (categoryCount - 1);
    const lastGap = (indices.at(-1)! - indices.at(-2)!) * pxPerCategory;
    if (lastGap < minLabelWidth) indices.splice(-2, 1);
  }

  return indices;
}

/** One donut slice with its resolved `share` (0..1) of the total, for arc-angle math. */
export interface KuiChartDonutShare {
  readonly slice: KuiChartSlicePoint;
  readonly share: number;
}

/**
 * Computes donut shares after excluding hidden slices from both output and total.
 * A zero total gives every slice a share of `0`: nothing is drawn, because splitting nothing into
 * equal arcs would show data that does not exist. Unlike grouped line/bar axes, donut angles
 * recompute when visibility changes.
 */
export function computeDonutShares(
  slices: readonly KuiChartSlicePoint[],
  hiddenSliceIds: ReadonlySet<string> = new Set(),
): readonly KuiChartDonutShare[] {
  const visible = slices.filter((s) => !hiddenSliceIds.has(s.sliceId));
  const total = visible.reduce((sum, s) => sum + s.value, 0);

  if (total <= 0) {
    return visible.map((slice) => ({ slice, share: 0 }));
  }

  return visible.map((slice) => ({ slice, share: slice.value / total }));
}

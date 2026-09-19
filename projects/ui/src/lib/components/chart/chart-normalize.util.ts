import type { KuiChartCartesianSeries, KuiChartScatterSeries, KuiChartSlice } from './chart.types';
import { resolveSeriesColor } from './chart-color.util';

/**
 * Normalized point on a line/bar/scatter chart, used internally by the shared engine (tooltip,
 * alt-table, keyboard navigation) after {@link normalizeCartesianSeries}/
 * {@link normalizeScatterSeries}. Not exported from the public barrel -- see `chart.types.ts`'s
 * `KuiChartPoint` for the lossy public shape passed to a consumer's tooltip formatter instead.
 */
export interface KuiChartCartesianPoint {
  readonly kind: 'line' | 'bar' | 'scatter';
  readonly seriesId: string;
  readonly seriesName: string;
  readonly seriesColor: string;
  readonly categoryLabel?: string;
  readonly categoryIndex?: number;
  readonly x: number;
  readonly y: number;
  readonly r?: number;
}

/**
 * Normalized slice on a donut chart, used internally by the shared engine after
 * {@link normalizeSlices}. Not exported from the public barrel -- see `chart.types.ts`'s
 * `KuiChartPoint` for the lossy public shape passed to a consumer's tooltip formatter instead.
 */
export interface KuiChartSlicePoint {
  readonly kind: 'donut';
  readonly sliceId: string;
  readonly label: string;
  readonly color: string;
  readonly value: number;
}

/**
 * One series after normalization: `slots` is aligned index-for-index with the chart's
 * `categories`, and always has `categories.length` entries -- `null` marks a gap (missing,
 * `NaN`, or `Infinity` input value). The tooltip, alt-table, and SVG renderer all read from this
 * shape instead of the raw public `series`/`categories` inputs, so the three views cannot
 * disagree about what a gap means. `seriesColor` is always resolved (never `undefined`) --
 * either the consumer's explicit `color` or a round-robin `--kui-chart-series-*` token.
 */
export interface KuiChartNormalizedCartesianSeries {
  readonly seriesId: string;
  readonly seriesName: string;
  readonly seriesColor: string;
  readonly slots: readonly (KuiChartCartesianPoint | null)[];
}

/**
 * Resolves a stable per-item key from an optional explicit `id`, falling back to `label` (e.g.
 * series `name`, slice `label`). When two items share the same fallback and neither has an
 * explicit `id`, an index suffix is appended so keys stay unique -- this keeps `@for` tracking
 * and internal `Set`-based hide/show state from colliding, but hide/show and focus-restoration
 * behavior across data updates is only guaranteed when `id` is explicit and stable; see
 * {@link KuiChartCartesianSeries} JSDoc.
 */
export function resolveStableIds(
  items: readonly { readonly id?: string; readonly label: string }[],
): readonly string[] {
  const seen = new Map<string, number>();
  return items.map((item) => {
    const key = item.id ?? item.label;
    const count = seen.get(key) ?? 0;
    seen.set(key, count + 1);
    return count === 0 ? key : `${key}:${count}`;
  });
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

/**
 * Normalizes `kui-line-chart`/`kui-bar-chart` series against `categories` into a shared internal
 * shape. `series.data` and `categories` are truncated to the shorter length when they disagree --
 * no chart-breaking error, but a real input mistake the consumer should still see fixed.
 * `null`/`NaN`/`Infinity` values become gaps (`null` slots), never `0` -- silently substituting 0
 * would misrepresent both the drawn shape and the reported value.
 */
export function normalizeCartesianSeries(
  series: readonly KuiChartCartesianSeries[],
  categories: readonly string[],
  kind: 'line' | 'bar',
): readonly KuiChartNormalizedCartesianSeries[] {
  const ids = resolveStableIds(series.map((s) => ({ id: s.id, label: s.name })));

  return series.map((s, seriesIndex) => {
    const color = resolveSeriesColor(seriesIndex, s.color);
    const length = Math.min(s.data.length, categories.length);
    const slots: (KuiChartCartesianPoint | null)[] = [];

    for (let categoryIndex = 0; categoryIndex < length; categoryIndex++) {
      const raw = s.data[categoryIndex];
      if (!isFiniteNumber(raw)) {
        slots.push(null);
        continue;
      }
      slots.push({
        kind,
        seriesId: ids[seriesIndex],
        seriesName: s.name,
        seriesColor: color,
        categoryLabel: categories[categoryIndex],
        categoryIndex,
        x: categoryIndex,
        y: raw,
      });
    }

    return {
      seriesId: ids[seriesIndex],
      seriesName: s.name,
      seriesColor: color,
      slots,
    };
  });
}

/**
 * One scatter/bubble series after normalization: `points` drops any coordinate whose `x`/`y`/`r`
 * is not a finite number -- there is no category axis to align gaps against, so invalid points
 * are simply omitted rather than represented as gaps.
 */
export interface KuiChartNormalizedScatterSeries {
  readonly seriesId: string;
  readonly seriesName: string;
  readonly seriesColor: string;
  readonly points: readonly KuiChartCartesianPoint[];
}

/** Normalizes `kui-scatter-chart` series into the shared internal shape. */
export function normalizeScatterSeries(
  series: readonly KuiChartScatterSeries[],
): readonly KuiChartNormalizedScatterSeries[] {
  const ids = resolveStableIds(series.map((s) => ({ id: s.id, label: s.name })));

  return series.map((s, seriesIndex) => {
    const color = resolveSeriesColor(seriesIndex, s.color);
    return {
      seriesId: ids[seriesIndex],
      seriesName: s.name,
      seriesColor: color,
      points: s.points
        .filter(
          (p) =>
            isFiniteNumber(p.x) &&
            isFiniteNumber(p.y) &&
            (p.r === undefined || isFiniteNumber(p.r)),
        )
        .map((p) => ({
          kind: 'scatter' as const,
          seriesId: ids[seriesIndex],
          seriesName: s.name,
          seriesColor: color,
          x: p.x,
          y: p.y,
          r: p.r,
        })),
    };
  });
}

/**
 * Normalizes `kui-donut-chart` slices into the shared internal shape. Negative `value` is dropped
 * (donut shares cannot be negative -- see {@link KuiChartSlice} JSDoc); every remaining slice
 * keeps its resolved id even when the total is `0`, so the caller can still decide how to render
 * the all-zero case (see chart-scale.util's `computeDonutShares`) without re-deriving identity.
 */
export function normalizeSlices(slices: readonly KuiChartSlice[]): readonly KuiChartSlicePoint[] {
  const ids = resolveStableIds(slices.map((s) => ({ id: s.id, label: s.label })));

  return slices
    .map((s, index) => ({ slice: s, id: ids[index], index }))
    .filter(({ slice }) => isFiniteNumber(slice.value) && slice.value >= 0)
    .map(({ slice, id, index }) => ({
      kind: 'donut' as const,
      sliceId: id,
      label: slice.label,
      color: resolveSeriesColor(index, slice.color),
      value: slice.value,
    }));
}

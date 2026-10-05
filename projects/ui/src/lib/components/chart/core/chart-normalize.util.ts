import type { KuiChartCartesianSeries, KuiChartScatterSeries, KuiChartSlice } from '../chart.types';
import { resolveSeriesColor } from './chart-color.util';
import { warnChartOnce } from './chart-dev-warn.util';

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
 * series `name`, slice `label`). Every key is unique: a repeat of a base key gets a `#n` suffix, and
 * the suffix is raised until it does not meet any key already handed out, so the inputs `a`, `a`,
 * `a#1` give `a`, `a#1`, `a#1#1` and never the same key twice. This keeps `@for` tracking and the
 * internal `Set`-based hide/show state from colliding, but hide/show and focus restoration across
 * data updates are only guaranteed when `id` is explicit and stable; see
 * {@link KuiChartCartesianSeries} JSDoc.
 */
export function resolveStableIds(
  items: readonly { readonly id?: string; readonly label: string }[],
): readonly string[] {
  const used = new Set<string>();
  const repeats = new Map<string, number>();

  return items.map((item) => {
    const base = item.id ?? item.label;
    let repeat = repeats.get(base) ?? 0;
    let key = repeat === 0 ? base : `${base}#${repeat}`;

    while (used.has(key)) {
      repeat += 1;
      key = `${base}#${repeat}`;
    }

    repeats.set(base, repeat + 1);
    used.add(key);

    return key;
  });
}

/** Warns, in development mode, about explicit ids that are used more than once. */
function warnDuplicateIds(
  kind: string,
  items: readonly { readonly id?: string; readonly label: string }[],
): void {
  const seen = new Set<string>();

  for (const item of items) {
    if (item.id === undefined) continue;

    if (seen.has(item.id)) {
      warnChartOnce(
        `${kind}:duplicate-id:${item.id}`,
        `${kind}: the id "${item.id}" is used by more than one item. Ids must be unique; the later items get a "#n" suffix, so their hidden state and colour do not survive a data update.`,
      );
    }

    seen.add(item.id);
  }
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
  const identities = series.map((s) => ({ id: s.id, label: s.name }));
  const ids = resolveStableIds(identities);

  warnDuplicateIds(`kui-${kind}-chart`, identities);

  return series.map((s, seriesIndex) => {
    const color = resolveSeriesColor(seriesIndex, s.color);
    const length = Math.min(s.data.length, categories.length);

    if (s.data.length !== categories.length) {
      warnChartOnce(
        `kui-${kind}-chart:length:${s.name}:${s.data.length}:${categories.length}`,
        `kui-${kind}-chart: the series "${s.name}" has ${s.data.length} values for ${categories.length} categories; the longer side is cut to ${length}.`,
      );
    }

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
  const identities = series.map((s) => ({ id: s.id, label: s.name }));
  const ids = resolveStableIds(identities);

  warnDuplicateIds('kui-scatter-chart', identities);

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
  const identities = slices.map((s) => ({ id: s.id, label: s.label }));
  const ids = resolveStableIds(identities);

  warnDuplicateIds('kui-donut-chart', identities);

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

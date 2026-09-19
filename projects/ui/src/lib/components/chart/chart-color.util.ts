const SERIES_COLOR_VARS = [
  'var(--kui-chart-series-1)',
  'var(--kui-chart-series-2)',
  'var(--kui-chart-series-3)',
  'var(--kui-chart-series-4)',
  'var(--kui-chart-series-5)',
  'var(--kui-chart-series-6)',
  'var(--kui-chart-series-7)',
  'var(--kui-chart-series-8)',
] as const;

/**
 * Resolves a series/slice's effective color: the consumer's explicit `color` when given,
 * otherwise one of the eight `--kui-chart-series-*` tokens, cycling by index. Shared by every
 * normalization function so line/bar/scatter/donut all default the same way.
 */
export function resolveSeriesColor(index: number, explicit?: string): string {
  return explicit ?? SERIES_COLOR_VARS[index % SERIES_COLOR_VARS.length];
}

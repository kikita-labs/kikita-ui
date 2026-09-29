import type {
  KuiChartCartesianSeries,
  KuiChartScatterSeries,
  KuiChartSlice,
  KuiChartTooltipFormatter,
  KuiChartValueFormat,
} from '@kikita-labs/ui';

/** Translated fixtures and formatters shared by the Chart page and its example components. */
export interface ChartCatalogueData {
  readonly weekdays: readonly string[];
  readonly workdays: readonly string[];
  readonly plans: readonly string[];

  readonly sessions: readonly KuiChartCartesianSeries[];
  readonly traffic: readonly KuiChartCartesianSeries[];
  readonly trafficPair: readonly KuiChartCartesianSeries[];
  readonly sessionsWithGaps: readonly KuiChartCartesianSeries[];
  readonly trafficPairWithGaps: readonly KuiChartCartesianSeries[];
  readonly trafficColored: readonly KuiChartCartesianSeries[];
  readonly largeTraffic: readonly KuiChartCartesianSeries[];
  readonly exactTraffic: readonly KuiChartCartesianSeries[];

  readonly revenue: readonly KuiChartCartesianSeries[];
  readonly revenueGrouped: readonly KuiChartCartesianSeries[];
  readonly revenueGroupedWithGaps: readonly KuiChartCartesianSeries[];
  readonly balance: readonly KuiChartCartesianSeries[];

  readonly scatter: readonly KuiChartScatterSeries[];
  readonly scatterSingle: readonly KuiChartScatterSeries[];
  readonly bubble: readonly KuiChartScatterSeries[];

  readonly slices: readonly KuiChartSlice[];
  readonly slicesMany: readonly KuiChartSlice[];
  readonly slicesColored: readonly KuiChartSlice[];
  readonly sliceSingle: readonly KuiChartSlice[];
  readonly slicesNegative: readonly KuiChartSlice[];

  readonly currencyFormat: KuiChartValueFormat;
  readonly thousandsFormat: KuiChartValueFormat;
  readonly cartesianTooltip: KuiChartTooltipFormatter;
  readonly scatterTooltip: KuiChartTooltipFormatter;
  readonly donutTooltip: KuiChartTooltipFormatter;
}

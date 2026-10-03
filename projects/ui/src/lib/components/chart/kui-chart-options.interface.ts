/** Defaults shared by the cartesian, donut and scatter charts. */
export interface KuiChartBaseOptions {
  /** Chart size. */
  readonly size?: 'sm' | 'md' | 'lg';

  /** Shows the chart legend. */
  readonly legend?: boolean;
}

/** Defaults for `kui-bar-chart`, set under the `barChart` key of the component defaults. */
export type KuiBarChartOptions = KuiChartBaseOptions;

/** Defaults for `kui-line-chart`, set under the `lineChart` key of the component defaults. */
export type KuiLineChartOptions = KuiChartBaseOptions;

/** Defaults for `kui-donut-chart`, set under the `donutChart` key of the component defaults. */
export type KuiDonutChartOptions = KuiChartBaseOptions;

/** Defaults for `kui-scatter-chart`, set under the `scatterChart` key of the component defaults. */
export type KuiScatterChartOptions = KuiChartBaseOptions;

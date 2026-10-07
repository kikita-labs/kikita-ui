import type { KuiChartAxesOptions } from '@kikita-labs/ui';

/** Supported axis and grid-line configurations shown on the line chart. */
export const CHART_AXES_EXAMPLES: readonly {
  readonly id: string;
  readonly axes: KuiChartAxesOptions;
}[] = [
  { id: 'default', axes: {} },
  { id: 'gridHorizontal', axes: { gridLines: 'horizontal' } },
  { id: 'gridVertical', axes: { gridLines: 'vertical' } },
  { id: 'gridNone', axes: { gridLines: 'none' } },
  { id: 'hideCategoryAxis', axes: { x: false } },
  { id: 'hideValueAxis', axes: { y: false } },
  { id: 'hideBothAxes', axes: { x: false, y: false } },
];

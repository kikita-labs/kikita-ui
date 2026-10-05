import type { KuiChartScatterPoint } from '@kikita-labs/ui';

/** Builds `count` deterministic scatter points spread over the plot, for the stress example. */
export function createChartCloud(count: number): readonly KuiChartScatterPoint[] {
  return Array.from({ length: count }, (_, index) => ({
    x: Math.round(20 + ((index * 37) % 61) + Math.sin(index) * 3),
    y: Math.round(30000 + ((index * 7919) % 50000)),
  }));
}

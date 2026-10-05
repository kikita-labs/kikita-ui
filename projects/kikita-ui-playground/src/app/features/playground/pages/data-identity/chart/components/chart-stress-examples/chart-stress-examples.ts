import { Component, computed, input, signal } from '@angular/core';

import { KuiButton, KuiLineChart, KuiScatterChart } from '@kikita-labs/ui';

import { TranslocoPipe } from '@jsverse/transloco';

import { CHART_STRESS_SIZES } from '../../constants';
import { createChartCloud, createChartWave } from '../../helpers';
import type { ChartCatalogueData } from '../../interfaces';
import { ChartExample } from '../chart-example';

/** Draws a line chart and a scatter chart with thousands of points on demand, to measure the cost. */
@Component({
  selector: 'app-chart-stress-examples',
  imports: [ChartExample, KuiButton, KuiLineChart, KuiScatterChart, TranslocoPipe],
  templateUrl: './chart-stress-examples.html',
  styleUrl: './chart-stress-examples.scss',
})
export class ChartStressExamples {
  readonly data = input.required<ChartCatalogueData>();

  protected readonly sizes = CHART_STRESS_SIZES;

  /** Points drawn now; `null` until a button is pressed, so the page does not pay for them. */
  protected readonly count = signal<number | null>(null);

  protected readonly categories = computed(() =>
    Array.from({ length: this.count() ?? 0 }, (_, index) => String(index + 1)),
  );

  protected readonly line = computed(() => {
    const count = this.count();

    return count === null
      ? []
      : this.data().trafficPair.map((series, index) => ({
          ...series,
          data: createChartWave(count, index * 40),
        }));
  });

  protected readonly scatter = computed(() => {
    const count = this.count();

    return count === null
      ? []
      : [{ ...this.data().scatterSingle[0], points: createChartCloud(count) }];
  });
}

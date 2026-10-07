import { Component, computed, input } from '@angular/core';

import { KuiBarChart, KuiDonutChart, KuiLineChart } from '@kikita-labs/ui';

import { TranslocoPipe } from '@jsverse/transloco';

import { CHART_DENSE_COUNT } from '../../constants';
import { createChartWave } from '../../helpers';
import type { ChartCatalogueData } from '../../interfaces';
import { ChartExample } from '../chart-example';

/** Renders dense data, narrow containers, axis titles, and hatch patterns. */
@Component({
  selector: 'app-chart-dense-examples',
  imports: [ChartExample, KuiBarChart, KuiDonutChart, KuiLineChart, TranslocoPipe],
  templateUrl: './chart-dense-examples.html',
  styleUrl: './chart-dense-examples.scss',
})
export class ChartDenseExamples {
  readonly data = input.required<ChartCatalogueData>();

  protected readonly denseCategories = Array.from({ length: CHART_DENSE_COUNT }, (_, index) =>
    String(index + 1),
  );

  protected readonly dense = computed(() => [
    { ...this.data().sessions[0], data: createChartWave(CHART_DENSE_COUNT) },
  ]);
}

import { Component, input } from '@angular/core';

import { KuiBarChart, KuiDonutChart, KuiLineChart, KuiScatterChart } from '@kikita-labs/ui';

import { TranslocoPipe } from '@jsverse/transloco';

import { CHART_SIZES } from '../../constants';
import type { ChartCatalogueData } from '../../interfaces';
import { ChartExample } from '../chart-example';

/** Renders sm, md, and lg for every Chart type with identical data. */
@Component({
  selector: 'app-chart-size-examples',
  imports: [ChartExample, KuiBarChart, KuiDonutChart, KuiLineChart, KuiScatterChart, TranslocoPipe],
  templateUrl: './chart-size-examples.html',
  styleUrl: './chart-size-examples.scss',
})
export class ChartSizeExamples {
  readonly data = input.required<ChartCatalogueData>();

  protected readonly sizes = CHART_SIZES;
}

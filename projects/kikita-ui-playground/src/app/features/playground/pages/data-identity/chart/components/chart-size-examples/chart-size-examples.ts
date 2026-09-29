import { Component, input } from '@angular/core';

import {
  KuiBarChartComponent,
  KuiDonutChartComponent,
  KuiLineChartComponent,
  KuiScatterChartComponent,
} from '@kikita-labs/ui';

import { TranslocoPipe } from '@jsverse/transloco';

import { CHART_SIZES } from '../../constants';
import type { ChartCatalogueData } from '../../interfaces';
import { ChartExample } from '../chart-example';

/** Renders sm, md, and lg for every Chart type with identical data. */
@Component({
  selector: 'app-chart-size-examples',
  imports: [
    ChartExample,
    KuiBarChartComponent,
    KuiDonutChartComponent,
    KuiLineChartComponent,
    KuiScatterChartComponent,
    TranslocoPipe,
  ],
  templateUrl: './chart-size-examples.html',
  styleUrl: './chart-size-examples.scss',
})
export class ChartSizeExamples {
  readonly data = input.required<ChartCatalogueData>();

  protected readonly sizes = CHART_SIZES;
}

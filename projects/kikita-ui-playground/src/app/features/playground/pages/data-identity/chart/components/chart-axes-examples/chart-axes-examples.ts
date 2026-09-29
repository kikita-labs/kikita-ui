import { Component, input } from '@angular/core';

import {
  KuiBarChartComponent,
  KuiLineChartComponent,
  KuiScatterChartComponent,
} from '@kikita-labs/ui';

import { TranslocoPipe } from '@jsverse/transloco';

import { CHART_AXES_EXAMPLES } from '../../constants';
import type { ChartCatalogueData } from '../../interfaces';
import { ChartExample } from '../chart-example';

/** Renders the supported axis visibility and grid-line combinations. */
@Component({
  selector: 'app-chart-axes-examples',
  imports: [
    ChartExample,
    KuiBarChartComponent,
    KuiLineChartComponent,
    KuiScatterChartComponent,
    TranslocoPipe,
  ],
  templateUrl: './chart-axes-examples.html',
  styleUrl: './chart-axes-examples.scss',
})
export class ChartAxesExamples {
  readonly data = input.required<ChartCatalogueData>();

  protected readonly examples = CHART_AXES_EXAMPLES;
}

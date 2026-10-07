import { Component, input } from '@angular/core';

import { KuiBarChart, KuiLineChart, KuiScatterChart } from '@kikita-labs/ui';

import { TranslocoPipe } from '@jsverse/transloco';

import { CHART_AXES_EXAMPLES } from '../../constants';
import type { ChartCatalogueData } from '../../interfaces';
import { ChartExample } from '../chart-example';

/** Renders the supported axis visibility and grid-line combinations. */
@Component({
  selector: 'app-chart-axes-examples',
  imports: [ChartExample, KuiBarChart, KuiLineChart, KuiScatterChart, TranslocoPipe],
  templateUrl: './chart-axes-examples.html',
  styleUrl: './chart-axes-examples.scss',
})
export class ChartAxesExamples {
  readonly data = input.required<ChartCatalogueData>();

  protected readonly examples = CHART_AXES_EXAMPLES;
}

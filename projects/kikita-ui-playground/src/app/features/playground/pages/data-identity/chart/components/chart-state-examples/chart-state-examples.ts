import { Component, input } from '@angular/core';

import { KuiBarChart, KuiDonutChart, KuiLineChart, KuiScatterChart } from '@kikita-labs/ui';

import { TranslocoPipe } from '@jsverse/transloco';

import type { ChartCatalogueData } from '../../interfaces';
import { ChartExample } from '../chart-example';

/** Renders the loading and empty states for every Chart type. */
@Component({
  selector: 'app-chart-state-examples',
  imports: [ChartExample, KuiBarChart, KuiDonutChart, KuiLineChart, KuiScatterChart, TranslocoPipe],
  templateUrl: './chart-state-examples.html',
  styleUrl: './chart-state-examples.scss',
})
export class ChartStateExamples {
  readonly data = input.required<ChartCatalogueData>();

  protected readonly states = ['loading', 'empty'] as const;
}

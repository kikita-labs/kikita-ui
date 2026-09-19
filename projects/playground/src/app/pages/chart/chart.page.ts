import { Component, ViewEncapsulation } from '@angular/core';

import {
  KuiBarChartComponent,
  KuiChartLegendComponent,
  KuiChartLegendItemDirective,
  KuiDonutChartComponent,
  KuiLineChartComponent,
  KuiScatterChartComponent,
} from '@kikita-labs/ui';

import type {
  KuiChartCartesianSeries,
  KuiChartPoint,
  KuiChartScatterSeries,
  KuiChartSlice,
} from '@kikita-labs/ui';

import { PlaygroundPanelComponent } from '../../shared/panel/panel.component';

const DENSE_CATEGORIES = Array.from({ length: 120 }, (_, i) => `Day ${i + 1}`);
const DENSE_DATA = Array.from(
  { length: 120 },
  (_, i) => 400 + Math.round(Math.sin(i / 6) * 150) + (i % 7 === 0 ? 80 : 0),
);

@Component({
  selector: 'app-chart-page',
  imports: [
    KuiBarChartComponent,
    KuiChartLegendComponent,
    KuiChartLegendItemDirective,
    KuiDonutChartComponent,
    KuiLineChartComponent,
    KuiScatterChartComponent,
    PlaygroundPanelComponent,
  ],
  templateUrl: './chart.page.html',
  styleUrl: './chart.page.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ChartPage {
  protected readonly singleSeries: readonly KuiChartCartesianSeries[] = [
    { id: 'sessions', name: 'Sessions', data: [120, 180, 150, 220, 260, 210, 300] },
  ];

  protected readonly multiSeries: readonly KuiChartCartesianSeries[] = [
    { id: 'sessions', name: 'Sessions', data: [120, 180, 150, 220, 260, 210, 300] },
    { id: 'signups', name: 'Signups', data: [12, 18, 14, 26, 30, 22, 35] },
  ];

  protected readonly categories = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  protected readonly gapSeries: readonly KuiChartCartesianSeries[] = [
    { id: 'sessions', name: 'Sessions', data: [120, null, 150, null, 260, 210, 300] },
  ];

  protected readonly negativeSeries: readonly KuiChartCartesianSeries[] = [
    { id: 'net', name: 'Net change', data: [40, -20, 60, -30, 10, -15, 25] },
  ];

  protected readonly denseSeries: readonly KuiChartCartesianSeries[] = [
    { id: 'sessions', name: 'Sessions', data: DENSE_DATA },
  ];

  protected readonly denseCategories = DENSE_CATEGORIES;

  protected readonly emptySeries: readonly KuiChartCartesianSeries[] = [];

  protected readonly planCategories = ['Free', 'Pro', 'Business', 'Enterprise'];

  protected readonly mrrSeries: readonly KuiChartCartesianSeries[] = [
    { id: 'mrr', name: 'MRR', data: [0, 4200, 9800, 15600] },
  ];

  protected readonly groupedSeries: readonly KuiChartCartesianSeries[] = [
    { id: 'new', name: 'New', data: [40, 90, 60, 120] },
    { id: 'churned', name: 'Churned', data: [-10, -20, -15, -25] },
  ];

  protected readonly stackedSeries: readonly KuiChartCartesianSeries[] = [
    { id: 'sessions', name: 'Sessions', data: [120, 180, 150, 220] },
    { id: 'signups', name: 'Signups', data: [12, 18, 14, 26] },
    { id: 'purchases', name: 'Purchases', data: [3, 5, 4, 8] },
  ];

  protected readonly scatterSeries: readonly KuiChartScatterSeries[] = [
    {
      id: 'users',
      name: 'Users',
      points: [
        { x: 22, y: 32000 },
        { x: 35, y: 58000 },
        { x: 41, y: 71000 },
        { x: 28, y: 45000 },
        { x: 52, y: 93000 },
        { x: 19, y: 27000 },
        { x: 47, y: 82000 },
      ],
    },
  ];

  protected readonly scatterMultiSeries: readonly KuiChartScatterSeries[] = [
    {
      id: 'free',
      name: 'Free',
      points: [
        { x: 22, y: 3 },
        { x: 35, y: 5 },
        { x: 19, y: 2 },
      ],
    },
    {
      id: 'pro',
      name: 'Pro',
      points: [
        { x: 41, y: 18 },
        { x: 52, y: 24 },
        { x: 47, y: 20 },
      ],
    },
  ];

  protected readonly bubbleSeries: readonly KuiChartScatterSeries[] = [
    {
      id: 'plans',
      name: 'Plans',
      points: [
        { x: 22, y: 32000, r: 6 },
        { x: 35, y: 58000, r: 14 },
        { x: 41, y: 71000, r: 22 },
        { x: 52, y: 93000, r: 30 },
      ],
    },
  ];

  protected readonly emptyScatterSeries: readonly KuiChartScatterSeries[] = [];

  protected readonly planMixSlices: readonly KuiChartSlice[] = [
    { id: 'free', label: 'Free', value: 40 },
    { id: 'pro', label: 'Pro', value: 35 },
    { id: 'business', label: 'Business', value: 20 },
    { id: 'enterprise', label: 'Enterprise', value: 5 },
  ];

  protected readonly singleSlice: readonly KuiChartSlice[] = [
    { id: 'only', label: 'Only plan', value: 100 },
  ];

  protected readonly emptySlices: readonly KuiChartSlice[] = [];

  protected readonly mrrCustomSeries: readonly KuiChartCartesianSeries[] = [
    { name: 'MRR', color: 'var(--kui-color-success-fill)', data: [0, 4200, 9800, 15600] },
  ];

  protected formatMrrTooltip(point: KuiChartPoint): string {
    return `${point.categoryLabel}: $${point.value.toLocaleString('en-US')}/mo`;
  }
}

import { Component, computed, inject } from '@angular/core';

import { toSignal } from '@angular/core/rxjs-interop';
import { asapScheduler, filter, observeOn } from 'rxjs';

import {
  KuiBarChart,
  KuiButton,
  KuiChartLegend,
  KuiChartLegendItem,
  KuiDonutChart,
  KuiLineChart,
  KuiScatterChart,
  KuiText,
} from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import type { KuiChartCartesianSeries, KuiChartPoint } from '@kikita-labs/ui';

import {
  ChartAxesExamples,
  ChartDenseExamples,
  ChartExample,
  ChartSizeExamples,
  ChartStateExamples,
  ChartStressExamples,
} from './components';
import {
  CHART_ANNUAL_REVENUE,
  CHART_BALANCE_GAINS,
  CHART_BALANCE_LOSSES,
  CHART_BUBBLE_FREE,
  CHART_BUBBLE_PRO,
  CHART_EXACT_SESSIONS,
  CHART_EXACT_SIGNUPS,
  CHART_LARGE_TRAFFIC,
  CHART_MONTHLY_REVENUE,
  CHART_PLAN_MIX,
  CHART_SCATTER_FREE,
  CHART_SCATTER_PRO,
  CHART_SESSIONS,
  CHART_SESSIONS_WITH_GAPS,
  CHART_SIGNUPS,
  CHART_TRIALS,
} from './constants';
import type { ChartCatalogueData } from './interfaces';

const WEEKDAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
const PLAN_KEYS = ['free', 'pro', 'business', 'enterprise', 'team'] as const;

/** Shows every supported Chart type, mode, state, and interaction as a fixed catalogue. */
@Component({
  selector: 'app-chart',
  imports: [
    ChartAxesExamples,
    ChartDenseExamples,
    ChartExample,
    ChartSizeExamples,
    ChartStateExamples,
    ChartStressExamples,
    KuiBarChart,
    KuiButton,
    KuiChartLegend,
    KuiChartLegendItem,
    KuiDonutChart,
    KuiLineChart,
    KuiScatterChart,
    KuiText,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  templateUrl: './chart.html',
  styleUrl: './chart.scss',
})
export class Chart {
  private readonly transloco = inject(TranslocoService);

  private readonly language = toSignal(this.transloco.langChanges$, {
    initialValue: this.transloco.getActiveLang(),
  });

  private readonly translationLoad = toSignal(
    this.transloco.events$.pipe(
      filter((event) => event.type === 'translationLoadSuccess'),
      observeOn(asapScheduler),
    ),
    { initialValue: null },
  );

  /** Translated fixtures; recomputed on language changes so chart labels and tooltips follow. */
  protected readonly data = computed<ChartCatalogueData>(() => {
    const weekdays = WEEKDAY_KEYS.map((key) => this.label(`chart.weekdays.${key}`));
    const plans = PLAN_KEYS.map((key) => this.label(`chart.plans.${key}`));
    const sessions = this.cartesian('sessions', CHART_SESSIONS);
    const signups = this.cartesian('signups', CHART_SIGNUPS);
    const trials = this.cartesian('trials', CHART_TRIALS);
    const currencyFormat = (value: number): string => `$${value.toLocaleString('en-US')}`;

    return {
      weekdays,
      workdays: weekdays.slice(0, 5),
      plans: plans.slice(0, 4),

      sessions: [sessions],
      traffic: [sessions, signups, trials],
      trafficPair: [sessions, signups],
      sessionsWithGaps: [this.cartesian('sessions', CHART_SESSIONS_WITH_GAPS)],
      trafficPairWithGaps: [this.cartesian('sessions', CHART_SESSIONS_WITH_GAPS), signups],
      trafficColored: [
        { ...sessions, color: 'var(--kui-color-success-fill)' },
        { ...signups, color: 'var(--kui-color-info-fill)' },
      ],
      largeTraffic: [this.cartesian('sessions', CHART_LARGE_TRAFFIC)],
      exactTraffic: [
        this.cartesian('sessions', CHART_EXACT_SESSIONS),
        this.cartesian('signups', CHART_EXACT_SIGNUPS),
      ],

      revenue: [this.cartesian('revenue', CHART_MONTHLY_REVENUE)],
      revenueGrouped: [
        this.cartesian('monthly', CHART_MONTHLY_REVENUE),
        this.cartesian('annual', CHART_ANNUAL_REVENUE),
      ],
      revenueGroupedWithGaps: [
        this.cartesian('monthly', [0, null, 9800, 15600]),
        this.cartesian('annual', [0, 3100, null, 12100]),
      ],
      balance: [
        this.cartesian('gains', CHART_BALANCE_GAINS),
        this.cartesian('losses', CHART_BALANCE_LOSSES),
      ],

      scatter: [
        { id: 'free', name: plans[0], points: CHART_SCATTER_FREE },
        { id: 'pro', name: plans[1], points: CHART_SCATTER_PRO },
      ],
      scatterSingle: [{ id: 'pro', name: plans[1], points: CHART_SCATTER_PRO }],
      bubble: [
        { id: 'free', name: plans[0], points: CHART_BUBBLE_FREE },
        { id: 'pro', name: plans[1], points: CHART_BUBBLE_PRO },
      ],

      slices: plans.slice(0, 3).map((label, index) => ({ label, value: CHART_PLAN_MIX[index] })),
      slicesMany: plans.map((label, index) => ({ label, value: CHART_PLAN_MIX[index] })),
      slicesColored: [
        { label: plans[0], value: CHART_PLAN_MIX[0], color: 'var(--kui-color-success-fill)' },
        { label: plans[1], value: CHART_PLAN_MIX[1], color: 'var(--kui-color-info-fill)' },
        { label: plans[2], value: CHART_PLAN_MIX[2] },
      ],
      sliceSingle: [{ label: plans[1], value: 100 }],
      slicesNegative: [
        { label: plans[0], value: 40 },
        { label: plans[1], value: 35 },
        { label: this.label('chart.plans.refunds'), value: -10 },
      ],

      currencyFormat,
      thousandsFormat: (value: number): string => `${value / 1000}k`,
      cartesianTooltip: (point: KuiChartPoint): string =>
        this.translate('chart.tooltip.cartesian', {
          series: point.seriesName,
          category: point.categoryLabel ?? '',
          value: currencyFormat(point.value),
        }),
      scatterTooltip: (point: KuiChartPoint): string =>
        this.translate('chart.tooltip.scatter', {
          series: point.seriesName,
          y: (point.y ?? 0).toLocaleString('en-US'),
        }),
      donutTooltip: (point: KuiChartPoint): string =>
        this.translate('chart.tooltip.donut', {
          label: point.seriesName,
          value: point.value,
        }),
    };
  });

  private cartesian(id: string, values: readonly (number | null)[]): KuiChartCartesianSeries {
    return { id, name: this.label(`chart.series.${id}`), data: values };
  }

  private label(key: string): string {
    return this.translate(key);
  }

  /**
   * Translates `key` once the lazily loaded `chart` scope has it, and returns an empty string before
   * that instead of asking Transloco, which would log a missing-translation warning for every key
   * while the scope is still loading. The `data` computed runs again when the scope arrives.
   */
  private translate(key: string, params?: Record<string, unknown>): string {
    this.language();
    this.translationLoad();

    const loaded = this.transloco.getTranslation(this.transloco.getActiveLang()) as Record<
      string,
      unknown
    >;

    return key in loaded ? this.transloco.translate(key, params) : '';
  }
}

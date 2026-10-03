import type { Type } from '@angular/core';
import { Component, signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { describe, expect, it } from 'vitest';

import { KuiBarChartComponent } from '../components/chart/bar/kui-bar-chart.component';
import type {
  KuiChartCartesianSeries,
  KuiChartScatterSeries,
  KuiChartSlice,
} from '../components/chart/chart.types';
import { KuiDonutChartComponent } from '../components/chart/donut/kui-donut-chart.component';
import type { KuiChartBaseOptions } from '../components/chart/kui-chart-options.interface';
import { KuiLineChartComponent } from '../components/chart/line/kui-line-chart.component';
import { KuiScatterChartComponent } from '../components/chart/scatter/kui-scatter-chart.component';
import { provideKikitaUi } from '../root';
import { KuiDefaults } from './kui-defaults.service';

type ChartSize = 'sm' | 'md' | 'lg';

const CARTESIAN: readonly KuiChartCartesianSeries[] = [
  { id: 'a', name: 'A', data: [1, 2, 3] },
  { id: 'b', name: 'B', data: [3, 2, 1] },
];

const SCATTER: readonly KuiChartScatterSeries[] = [
  {
    id: 'a',
    name: 'A',
    points: [
      { x: 1, y: 1 },
      { x: 2, y: 3 },
    ],
  },
  {
    id: 'b',
    name: 'B',
    points: [
      { x: 1, y: 2 },
      { x: 3, y: 1 },
    ],
  },
];

const SLICES: readonly KuiChartSlice[] = [
  { id: 'x', label: 'X', value: 60 },
  { id: 'y', label: 'Y', value: 40 },
];

@Component({
  imports: [KuiBarChartComponent],
  template: `<kui-bar-chart
    [series]="series"
    [categories]="categories"
    [size]="size()"
    [legend]="legend()"
  />`,
})
class BarHost {
  readonly series = CARTESIAN;
  readonly categories = ['q1', 'q2', 'q3'];
  readonly size = signal<ChartSize | undefined>(undefined);
  readonly legend = signal<boolean | undefined>(undefined);
}

@Component({
  imports: [KuiLineChartComponent],
  template: `<kui-line-chart
    [series]="series"
    [categories]="categories"
    [size]="size()"
    [legend]="legend()"
  />`,
})
class LineHost {
  readonly series = CARTESIAN;
  readonly categories = ['q1', 'q2', 'q3'];
  readonly size = signal<ChartSize | undefined>(undefined);
  readonly legend = signal<boolean | undefined>(undefined);
}

@Component({
  imports: [KuiScatterChartComponent],
  template: `<kui-scatter-chart [series]="series" [size]="size()" [legend]="legend()" />`,
})
class ScatterHost {
  readonly series = SCATTER;
  readonly size = signal<ChartSize | undefined>(undefined);
  readonly legend = signal<boolean | undefined>(undefined);
}

@Component({
  imports: [KuiDonutChartComponent],
  template: `<kui-donut-chart [slices]="slices" [size]="size()" [legend]="legend()" />`,
})
class DonutHost {
  readonly slices = SLICES;
  readonly size = signal<ChartSize | undefined>(undefined);
  readonly legend = signal<boolean | undefined>(undefined);
}

interface ChartHost {
  readonly size: ReturnType<typeof signal<ChartSize | undefined>>;
  readonly legend: ReturnType<typeof signal<boolean | undefined>>;
}

const CASES = [
  { key: 'barChart', host: BarHost },
  { key: 'lineChart', host: LineHost },
  { key: 'scatterChart', host: ScatterHost },
  { key: 'donutChart', host: DonutHost },
] as const;

const HEIGHTS: Record<ChartSize, string> = { sm: '200px', md: '280px', lg: '360px' };

function setup(
  host: Type<ChartHost>,
  key: (typeof CASES)[number]['key'],
  options?: KuiChartBaseOptions,
): ComponentFixture<ChartHost> {
  TestBed.configureTestingModule({
    providers: [provideKikitaUi(options ? { defaults: { [key]: options } } : {})],
  });
  const fixture = TestBed.createComponent(host);
  fixture.detectChanges();
  return fixture;
}

function height(fixture: ComponentFixture<unknown>): string {
  const el = (fixture.nativeElement as HTMLElement).querySelector('.kui-chart') as HTMLElement;
  return el.style.getPropertyValue('--kui-chart-height');
}

function hasLegend(fixture: ComponentFixture<unknown>): boolean {
  return (fixture.nativeElement as HTMLElement).querySelector('.kui-chart__legend') !== null;
}

describe('KuiDefaults chart integration', () => {
  for (const { key, host } of CASES) {
    describe(key, () => {
      it('keeps the built-in md size and multi-series legend without defaults', () => {
        const fixture = setup(host, key);
        expect(height(fixture)).toBe(HEIGHTS.md);
        expect(hasLegend(fixture)).toBe(true);
      });

      it('applies configured size and legend defaults to the DOM', () => {
        const fixture = setup(host, key, { size: 'lg', legend: false });
        expect(height(fixture)).toBe(HEIGHTS.lg);
        expect(hasLegend(fixture)).toBe(false);
      });

      it('lets local inputs win over defaults', () => {
        const fixture = setup(host, key, { size: 'lg', legend: false });
        fixture.componentInstance.size.set('sm');
        fixture.componentInstance.legend.set(true);
        fixture.detectChanges();
        expect(height(fixture)).toBe(HEIGHTS.sm);
        expect(hasLegend(fixture)).toBe(true);
      });

      it('reacts to runtime default changes', () => {
        const fixture = setup(host, key);
        expect(height(fixture)).toBe(HEIGHTS.md);
        expect(hasLegend(fixture)).toBe(true);

        TestBed.inject(KuiDefaults).set(key, { size: 'sm', legend: false });
        fixture.detectChanges();
        expect(height(fixture)).toBe(HEIGHTS.sm);
        expect(hasLegend(fixture)).toBe(false);

        TestBed.inject(KuiDefaults).set(key, { size: 'lg', legend: true });
        fixture.detectChanges();
        expect(height(fixture)).toBe(HEIGHTS.lg);
        expect(hasLegend(fixture)).toBe(true);
      });
    });
  }
});

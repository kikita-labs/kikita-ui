import { Component, signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { describe, expect, it } from 'vitest';

import type {
  KuiChartAxesOptions,
  KuiChartCartesianSeries,
  KuiChartTooltipFormatter,
} from '../chart.types';
import { KUI_CHART_MARK_LIMIT } from '../core/chart-pointer.util';
import { KuiLineChart } from './kui-line-chart';

@Component({
  imports: [KuiLineChart],
  template: `
    <kui-line-chart
      [series]="series()"
      [categories]="categories()"
      [loading]="loading()"
      [area]="area()"
      [patterns]="patterns()"
      [axes]="axes()"
      [tooltip]="tooltip()"
    />
  `,
})
class HostComponent {
  readonly series = signal<readonly KuiChartCartesianSeries[]>([
    { id: 'sessions', name: 'Sessions', data: [10, 20, 30] },
  ]);
  readonly categories = signal<readonly string[]>(['Mon', 'Tue', 'Wed']);
  readonly loading = signal(false);
  readonly area = signal(false);
  readonly tooltip = signal<KuiChartTooltipFormatter | undefined>(undefined);
  readonly axes = signal<KuiChartAxesOptions>({});
  readonly patterns = signal(false);
}

function createFixture(): ComponentFixture<HostComponent> {
  TestBed.configureTestingModule({ imports: [HostComponent] });
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  return fixture;
}

function marks(fixture: ComponentFixture<HostComponent>): SVGPathElement[] {
  return Array.from(fixture.nativeElement.querySelectorAll('path.kui-chart__mark'));
}

function chartInstance(fixture: ComponentFixture<HostComponent>): KuiLineChart {
  return fixture.debugElement.query(By.directive(KuiLineChart)).componentInstance;
}

describe('KuiLineChart', () => {
  it('uses a generic accessible name when ariaLabel is omitted', () => {
    const fixture = createFixture();
    const graphic = fixture.nativeElement.querySelector('svg.kui-chart__svg') as SVGElement;

    expect(graphic.getAttribute('role')).toBe('graphics-document');
    expect(graphic.getAttribute('aria-label')).toBe('Line chart');
    expect(
      fixture.nativeElement.querySelector('.kui-chart__graphic')?.getAttribute('role'),
    ).toBeNull();
  });

  it('renders one mark per non-gap data point', () => {
    const fixture = createFixture();
    expect(marks(fixture)).toHaveLength(3);
  });

  it('does not render a mark for a null gap', () => {
    const fixture = createFixture();
    fixture.componentInstance.series.set([{ id: 's', name: 'S', data: [10, null, 30] }]);
    fixture.detectChanges();
    expect(marks(fixture)).toHaveLength(2);
  });

  it('shows the empty state when series has no data at all', () => {
    const fixture = createFixture();
    fixture.componentInstance.series.set([{ id: 's', name: 'S', data: [] }]);
    fixture.componentInstance.categories.set([]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.kui-chart__empty')).not.toBeNull();
    expect(marks(fixture)).toHaveLength(0);
  });

  it('shows a skeleton instead of the chart when loading', () => {
    const fixture = createFixture();
    fixture.componentInstance.loading.set(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.kui-chart__loading-wave')).not.toBeNull();
    expect(marks(fixture)).toHaveLength(0);
  });

  it('hides the legend for a single series by default', () => {
    const fixture = createFixture();
    expect(fixture.nativeElement.querySelector('.kui-chart__legend')).toBeNull();
  });

  it('shows the legend for multiple series and toggling hides that series marks', () => {
    const fixture = createFixture();
    fixture.componentInstance.series.set([
      { id: 'a', name: 'A', data: [1, 2, 3] },
      { id: 'b', name: 'B', data: [4, 5, 6] },
    ]);
    fixture.detectChanges();

    expect(marks(fixture)).toHaveLength(6);

    const legendButtons: HTMLButtonElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('.kui-chart__legend-item'),
    );
    expect(legendButtons).toHaveLength(2);

    legendButtons[0].click();
    fixture.detectChanges();

    expect(marks(fixture)).toHaveLength(3);
    expect(legendButtons[0].getAttribute('aria-pressed')).toBe('false');
  });

  it('keeps the legend interactive when every series is hidden -- not the same state as empty', () => {
    const fixture = createFixture();
    fixture.componentInstance.series.set([
      { id: 'a', name: 'A', data: [1, 2, 3] },
      { id: 'b', name: 'B', data: [4, 5, 6] },
    ]);
    fixture.detectChanges();
    const buttons: HTMLButtonElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('.kui-chart__legend-item'),
    );
    buttons.forEach((b) => b.click());
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.kui-chart__empty')).toBeNull();
    expect(fixture.nativeElement.querySelectorAll('.kui-chart__legend-item')).toHaveLength(2);
  });

  it('renders an aria-label on every mark equal to the default tooltip text', () => {
    const fixture = createFixture();
    const [firstMark] = marks(fixture);
    expect(firstMark.getAttribute('aria-label')).toBe('Sessions · Mon: 10');
  });

  it('gives every mark role="graphics-symbol img"', () => {
    const fixture = createFixture();
    marks(fixture).forEach((mark) => {
      expect(mark.getAttribute('role')).toBe('graphics-symbol img');
    });
  });

  it('only one mark is a tab stop at a time (roving tabindex)', () => {
    const fixture = createFixture();
    const tabbable = marks(fixture).filter((mark) => mark.getAttribute('tabindex') === '0');
    expect(tabbable).toHaveLength(1);
  });

  it('moves the roving tab stop with ArrowRight/ArrowLeft/Home/End', () => {
    const fixture = createFixture();
    const group = fixture.nativeElement.querySelector('g.kui-chart__marks');
    const dispatch = (key: string) =>
      group?.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));

    dispatch('ArrowRight');
    fixture.detectChanges();
    expect(marks(fixture)[1].getAttribute('tabindex')).toBe('0');

    dispatch('End');
    fixture.detectChanges();
    expect(marks(fixture)[2].getAttribute('tabindex')).toBe('0');

    dispatch('Home');
    fixture.detectChanges();
    expect(marks(fixture)[0].getAttribute('tabindex')).toBe('0');
  });

  it('renders the alt-table with exact (non-compact) values', () => {
    const fixture = createFixture();
    fixture.componentInstance.series.set([{ id: 's', name: 'Sessions', data: [1200, 2, 3] }]);
    fixture.detectChanges();
    const buttons: HTMLButtonElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('button'),
    );
    const tableButton = buttons.find((b) => b.textContent?.trim() === 'Table')!;
    tableButton.click();
    fixture.detectChanges();

    const table = fixture.nativeElement.querySelector('table');
    expect(table).not.toBeNull();
    expect(table.textContent).toContain('1200');
    expect(table.textContent).not.toContain('1.2K');
  });

  it('renders an area path only when area is true', () => {
    const fixture = createFixture();
    expect(fixture.nativeElement.querySelector('path.kui-chart__area')).toBeNull();

    fixture.componentInstance.area.set(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('path.kui-chart__area')).not.toBeNull();
  });

  it('overrides the default tooltip text with a custom formatter', () => {
    const fixture = createFixture();
    fixture.componentInstance.tooltip.set((point) => `custom:${point.seriesName}=${point.value}`);
    fixture.detectChanges();
    const [firstMark] = marks(fixture);
    expect(firstMark.getAttribute('aria-label')).toBe('custom:Sessions=10');
  });

  it('uses an explicit series color instead of the round-robin default', () => {
    const fixture = createFixture();
    fixture.componentInstance.series.set([
      { id: 'sessions', name: 'Sessions', color: 'crimson', data: [10, 20, 30] },
    ]);
    fixture.detectChanges();
    const [firstMark] = marks(fixture);
    expect(firstMark.getAttribute('style')).toContain('crimson');
  });

  it('renders ~500 points without throwing and still thins the tick labels (plan section 12.7 volume target)', () => {
    const fixture = createFixture();
    const categories = Array.from({ length: 500 }, (_, i) => `Day ${i + 1}`);
    const data = Array.from({ length: 500 }, (_, i) => 100 + Math.round(Math.sin(i / 10) * 50));
    fixture.componentInstance.categories.set(categories);
    fixture.componentInstance.series.set([{ id: 's', name: 'S', data }]);
    fixture.detectChanges();

    expect(marks(fixture)).toHaveLength(500);
    const tickTexts = fixture.nativeElement.querySelectorAll('text.kui-chart__axis-text--x');
    expect(tickTexts.length).toBeGreaterThan(0);
    expect(tickTexts.length).toBeLessThan(500);
  });

  it('exposes a public KuiChartLegendSource surface for kui-chart-legend / hand-rolled legends', () => {
    const fixture = createFixture();
    fixture.componentInstance.series.set([
      { id: 'a', name: 'A', data: [1, 2, 3] },
      { id: 'b', name: 'B', data: [4, 5, 6] },
    ]);
    fixture.detectChanges();
    const chart = chartInstance(fixture);

    expect(chart.legendItems()).toEqual([
      { id: 'a', label: 'A', color: 'var(--kui-chart-series-1)', hidden: false, shape: 'circle' },
      { id: 'b', label: 'B', color: 'var(--kui-chart-series-2)', hidden: false, shape: 'square' },
    ]);

    chart.setHoveredLegendId('b');
    expect(chart.hoveredLegendId()).toBe('b');

    chart.toggleLegendItem('a');
    expect(chart.legendItems()[0].hidden).toBe(true);
    // Hidden items stay in legendItems() -- toggleLegendItem is how a consumer brings one back.
    expect(chart.legendItems()).toHaveLength(2);
  });
  it('draws the marks of different series in different shapes, and a single series as circles', () => {
    const fixture = createFixture();
    const circle = marks(fixture)[0].getAttribute('d');

    fixture.componentInstance.series.set([
      { id: 'a', name: 'A', data: [1, 2, 3] },
      { id: 'b', name: 'B', data: [4, 5, 6] },
    ]);
    fixture.detectChanges();
    const paths = marks(fixture).map((mark) => mark.getAttribute('d'));

    expect(new Set(paths).size).toBe(2);
    expect(paths).toContain(circle);
  });

  it('keeps the shape of a series when another series is hidden', () => {
    const fixture = createFixture();
    fixture.componentInstance.series.set([
      { id: 'a', name: 'A', data: [1, 2, 3] },
      { id: 'b', name: 'B', data: [4, 5, 6] },
    ]);
    fixture.detectChanges();
    const before = marks(fixture)
      .filter((mark) => mark.getAttribute('aria-label')?.startsWith('B'))
      .map((mark) => mark.getAttribute('d'));

    (fixture.nativeElement.querySelectorAll('.kui-chart__legend-item')[0] as HTMLElement).click();
    fixture.detectChanges();
    const after = marks(fixture).map((mark) => mark.getAttribute('d'));

    expect(after).toEqual(before);
  });

  it('marks a hidden series in the legend with more than its pressed state', () => {
    const fixture = createFixture();
    fixture.componentInstance.series.set([
      { id: 'a', name: 'A', data: [1, 2, 3] },
      { id: 'b', name: 'B', data: [4, 5, 6] },
    ]);
    fixture.detectChanges();
    const item = fixture.nativeElement.querySelector('.kui-chart__legend-item') as HTMLElement;

    item.click();
    fixture.detectChanges();

    expect(item.classList.contains('kui-chart__legend-item--hidden')).toBe(true);
    expect(item.getAttribute('aria-pressed')).toBe('false');
    expect(item.querySelector('svg.kui-chart__legend-swatch')).not.toBeNull();
  });

  it('names the legend group and hides the axes from assistive technology', () => {
    const fixture = createFixture();
    fixture.componentInstance.series.set([
      { id: 'a', name: 'A', data: [1, 2, 3] },
      { id: 'b', name: 'B', data: [4, 5, 6] },
    ]);
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('.kui-chart__legend')?.getAttribute('aria-label'),
    ).toBe('Legend');
    const axes = Array.from(fixture.nativeElement.querySelectorAll('g[kuiChartAxis]'));

    expect(axes.length).toBeGreaterThan(0);
    for (const axis of axes) {
      expect((axis as Element).getAttribute('aria-hidden')).toBe('true');
    }
  });

  it('draws the axis titles from axes.xTitle and axes.yTitle', () => {
    const fixture = createFixture();
    fixture.componentInstance.axes.set({ xTitle: 'Weekday', yTitle: 'Sessions' });
    fixture.detectChanges();
    const titles = Array.from(
      fixture.nativeElement.querySelectorAll('text.kui-chart__axis-title'),
    ).map((title) => (title as Element).textContent?.trim());

    expect(titles).toEqual(expect.arrayContaining(['Weekday', 'Sessions']));
  });

  it('draws only the mark that holds the tab stop beyond the mark limit, and moves it with the keyboard', () => {
    const fixture = createFixture();
    const count = KUI_CHART_MARK_LIMIT + 20;
    fixture.componentInstance.categories.set(Array.from({ length: count }, (_, i) => `D${i}`));
    fixture.componentInstance.series.set([
      { id: 's', name: 'S', data: Array.from({ length: count }, (_, i) => i) },
    ]);
    fixture.detectChanges();

    expect(marks(fixture)).toHaveLength(1);
    expect(marks(fixture)[0].getAttribute('tabindex')).toBe('0');
    expect(marks(fixture)[0].getAttribute('aria-label')).toBe('S · D0: 0');

    const group = fixture.nativeElement.querySelector('g.kui-chart__marks');
    group?.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    fixture.detectChanges();

    expect(marks(fixture)).toHaveLength(1);
    expect(marks(fixture)[0].getAttribute('aria-label')).toBe(`S · D${count - 1}: ${count - 1}`);
  });

  it('reads the table of a dense chart in full, whatever is drawn', () => {
    const fixture = createFixture();
    const count = KUI_CHART_MARK_LIMIT + 20;
    fixture.componentInstance.categories.set(Array.from({ length: count }, (_, i) => `D${i}`));
    fixture.componentInstance.series.set([
      { id: 's', name: 'S', data: Array.from({ length: count }, (_, i) => i) },
    ]);
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('.kui-chart__toolbar button') as HTMLElement).click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('tbody tr')).toHaveLength(count);
  });

  it('fills the area with the hatch of the series when patterns is on', () => {
    const fixture = createFixture();
    fixture.componentInstance.area.set(true);
    fixture.detectChanges();
    const area = fixture.nativeElement.querySelector('path.kui-chart__area') as SVGElement;

    expect(area.getAttribute('fill')).toContain('-area-');

    fixture.componentInstance.patterns.set(true);
    fixture.detectChanges();

    expect(area.getAttribute('fill')).toContain('-pattern-');
  });

  it('gives every series its own dash for forced colours', () => {
    const fixture = createFixture();
    fixture.componentInstance.series.set([
      { id: 'a', name: 'A', data: [1, 2, 3] },
      { id: 'b', name: 'B', data: [4, 5, 6] },
    ]);
    fixture.detectChanges();
    const dashes = Array.from(fixture.nativeElement.querySelectorAll('path.kui-chart__line')).map(
      (line) => (line as SVGElement).style.getPropertyValue('--_kui-chart-dash'),
    );

    expect(new Set(dashes).size).toBe(2);
  });
});

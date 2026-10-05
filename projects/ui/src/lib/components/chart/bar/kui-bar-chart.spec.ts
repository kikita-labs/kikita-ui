import { Component, signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { describe, expect, it } from 'vitest';

import type { KuiChartCartesianSeries, KuiChartTooltipFormatter } from '../chart.types';
import { KuiBarChart } from './kui-bar-chart';

@Component({
  imports: [KuiBarChart],
  template: `
    <kui-bar-chart
      [series]="series()"
      [categories]="categories()"
      [orientation]="orientation()"
      [stacked]="stacked()"
      [patterns]="patterns()"
      [loading]="loading()"
      [tooltip]="tooltip()"
    />
  `,
})
class HostComponent {
  readonly series = signal<readonly KuiChartCartesianSeries[]>([
    { id: 'a', name: 'A', data: [10, 20, 30] },
  ]);
  readonly categories = signal<readonly string[]>(['Free', 'Pro', 'Business']);
  readonly orientation = signal<'vertical' | 'horizontal'>('vertical');
  readonly stacked = signal(false);
  readonly patterns = signal(false);
  readonly loading = signal(false);
  readonly tooltip = signal<KuiChartTooltipFormatter | undefined>(undefined);
}

function createFixture(): ComponentFixture<HostComponent> {
  TestBed.configureTestingModule({ imports: [HostComponent] });
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  return fixture;
}

/** The bounding box of a bar from its outline, which is made of M, H, V and A commands only. */
function bounds(bar: Element): { x: number; y: number; width: number; height: number } {
  const tokens = (bar.getAttribute('d') ?? '').match(/[MHVAZ]|-?\d+(?:\.\d+)?/g) ?? [];
  let x = 0;
  let y = 0;
  const xs: number[] = [];
  const ys: number[] = [];
  const mark = (): void => {
    xs.push(x);
    ys.push(y);
  };

  for (let i = 0; i < tokens.length; ) {
    const command = tokens[i++];

    if (command === 'M') {
      x = Number(tokens[i++]);
      y = Number(tokens[i++]);
    } else if (command === 'H') x = Number(tokens[i++]);
    else if (command === 'V') y = Number(tokens[i++]);
    else if (command === 'A') {
      i += 5;
      x = Number(tokens[i++]);
      y = Number(tokens[i++]);
    } else continue;

    mark();
  }

  const left = Math.min(...xs);
  const top = Math.min(...ys);

  return { x: left, y: top, width: Math.max(...xs) - left, height: Math.max(...ys) - top };
}

function bars(fixture: ComponentFixture<HostComponent>): SVGPathElement[] {
  return Array.from(fixture.nativeElement.querySelectorAll('path.kui-chart__bar'));
}

describe('KuiBarChart', () => {
  it('uses a generic accessible name when ariaLabel is omitted', () => {
    const fixture = createFixture();
    const graphic = fixture.nativeElement.querySelector('svg.kui-chart__svg') as SVGElement;

    expect(graphic.getAttribute('aria-label')).toBe('Bar chart');
  });

  it('renders one bar per non-gap data point (grouped, single series)', () => {
    const fixture = createFixture();
    expect(bars(fixture)).toHaveLength(3);
  });

  it('renders side-by-side bars for grouped multi-series', () => {
    const fixture = createFixture();
    fixture.componentInstance.series.set([
      { id: 'a', name: 'A', data: [10, 20, 30] },
      { id: 'b', name: 'B', data: [5, 15, 25] },
    ]);
    fixture.detectChanges();
    const rects = bars(fixture);
    expect(rects).toHaveLength(6);

    // Grouped: the two bars for the first category must not overlap on x.
    const [first, second] = rects;
    const firstRight = bounds(first).x + bounds(first).width;
    const secondX = bounds(second).x;
    expect(secondX).toBeGreaterThanOrEqual(firstRight - 0.01);
  });

  it('stacks bars in the same x position (vertical) when stacked', () => {
    const fixture = createFixture();
    fixture.componentInstance.series.set([
      { id: 'a', name: 'A', data: [10] },
      { id: 'b', name: 'B', data: [20] },
    ]);
    fixture.componentInstance.categories.set(['Q1']);
    fixture.componentInstance.stacked.set(true);
    fixture.detectChanges();

    const rects = bars(fixture);
    expect(rects).toHaveLength(2);
    expect(bounds(rects[0]).x).toBeCloseTo(bounds(rects[1]).x, 2);
    expect(bounds(rects[0]).width).toBeCloseTo(bounds(rects[1]).width, 2);
  });

  it('does not stack a single series even when stacked=true', () => {
    const fixture = createFixture();
    fixture.componentInstance.stacked.set(true);
    fixture.detectChanges();
    // With one series, stacked vs grouped renders identically -- still 3 bars, no crash.
    expect(bars(fixture)).toHaveLength(3);
  });

  it('renders horizontal bars with height instead of width driven by the category band', () => {
    const fixture = createFixture();
    fixture.componentInstance.orientation.set('horizontal');
    fixture.detectChanges();
    const rects = bars(fixture);
    expect(rects).toHaveLength(3);
    // In horizontal mode, bars are placed along y (category) and sized along x (value).
    const heights = rects.map((r) => Math.round(bounds(r).height * 100));
    const widths = rects.map((r) => bounds(r).width);
    expect(new Set(heights).size).toBeLessThanOrEqual(1); // same band thickness for all bars
    expect(widths.some((w) => w > 0)).toBe(true);
  });

  it('does not render a bar for a null gap', () => {
    const fixture = createFixture();
    fixture.componentInstance.series.set([{ id: 'a', name: 'A', data: [10, null, 30] }]);
    fixture.detectChanges();
    expect(bars(fixture)).toHaveLength(2);
  });

  it('shows the bar-silhouette skeleton when loading', () => {
    const fixture = createFixture();
    fixture.componentInstance.loading.set(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.kui-chart__loading-bars')).not.toBeNull();
    expect(bars(fixture)).toHaveLength(0);
  });

  it('shows the shared empty-state composition when there is no data', () => {
    const fixture = createFixture();
    fixture.componentInstance.series.set([{ id: 'a', name: 'A', data: [] }]);
    fixture.componentInstance.categories.set([]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.kui-chart__empty')).not.toBeNull();
  });

  it('gives every bar role="graphics-symbol img" and roving tabindex', () => {
    const fixture = createFixture();
    const rects = bars(fixture);
    rects.forEach((r) => expect(r.getAttribute('role')).toBe('graphics-symbol img'));
    expect(rects.filter((r) => r.getAttribute('tabindex') === '0')).toHaveLength(1);
  });

  it('overrides the default tooltip text with a custom formatter', () => {
    const fixture = createFixture();
    fixture.componentInstance.tooltip.set((point) => `custom:${point.seriesName}=${point.value}`);
    fixture.detectChanges();
    const [firstBar] = bars(fixture);
    expect(firstBar.getAttribute('aria-label')).toBe('custom:A=10');
  });

  it('uses an explicit series color instead of the round-robin default', () => {
    const fixture = createFixture();
    fixture.componentInstance.series.set([
      { id: 'a', name: 'A', color: 'crimson', data: [10, 20, 30] },
    ]);
    fixture.detectChanges();
    const [firstBar] = bars(fixture);
    expect(firstBar.getAttribute('style')).toContain('crimson');
  });

  it('renders ~500 bars without throwing (plan section 12.7 volume target)', () => {
    const fixture = createFixture();
    const categories = Array.from({ length: 500 }, (_, i) => `Cat ${i + 1}`);
    const data = Array.from({ length: 500 }, (_, i) => 10 + (i % 40));
    fixture.componentInstance.categories.set(categories);
    fixture.componentInstance.series.set([{ id: 's', name: 'S', data }]);
    fixture.detectChanges();
    expect(bars(fixture)).toHaveLength(500);
  });

  it('fills bars with the colour of the series by default and defines a pattern per series', () => {
    const fixture = createFixture();

    expect(bars(fixture)[0].style.fill).not.toContain('url(');
    expect(fixture.nativeElement.querySelectorAll('pattern')).toHaveLength(1);
  });

  it('fills bars with the hatch of the series when patterns is on, and shows it in the legend', () => {
    const fixture = createFixture();
    fixture.componentInstance.series.set([
      { id: 'a', name: 'A', data: [1, 2, 3] },
      { id: 'b', name: 'B', data: [3, 2, 1] },
    ]);
    fixture.componentInstance.patterns.set(true);
    fixture.detectChanges();
    const fills = new Set(bars(fixture).map((bar) => bar.style.fill));
    const ids = Array.from(fixture.nativeElement.querySelectorAll('pattern')).map(
      (pattern) => (pattern as Element).id,
    );

    expect(fills.size).toBe(2);
    for (const fill of fills) {
      expect(ids.some((id) => fill.includes(id))).toBe(true);
    }
    expect(
      fixture.nativeElement.querySelectorAll('.kui-chart__legend-swatch-pattern'),
    ).toHaveLength(2);
  });

  it('keeps the hatch of a series when another series is hidden', () => {
    const fixture = createFixture();
    fixture.componentInstance.series.set([
      { id: 'a', name: 'A', data: [1, 2, 3] },
      { id: 'b', name: 'B', data: [3, 2, 1] },
    ]);
    fixture.componentInstance.patterns.set(true);
    fixture.detectChanges();
    const before = bars(fixture)
      .filter((bar) => bar.getAttribute('aria-label')?.startsWith('B'))
      .map((bar) => bar.style.fill);

    (fixture.nativeElement.querySelectorAll('.kui-chart__legend-item')[0] as HTMLElement).click();
    fixture.detectChanges();

    expect(bars(fixture).map((bar) => bar.style.fill)).toEqual(before);
  });
});

import { Component, signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { describe, expect, it } from 'vitest';

import type { KuiChartCartesianSeries, KuiChartTooltipFormatter } from './chart.types';
import { KuiBarChartComponent } from './kui-bar-chart.component';

@Component({
  imports: [KuiBarChartComponent],
  template: `
    <kui-bar-chart
      ariaLabel="Signups per plan"
      [series]="series()"
      [categories]="categories()"
      [orientation]="orientation()"
      [stacked]="stacked()"
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
  readonly loading = signal(false);
  readonly tooltip = signal<KuiChartTooltipFormatter | undefined>(undefined);
}

function createFixture(): ComponentFixture<HostComponent> {
  TestBed.configureTestingModule({ imports: [HostComponent] });
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  return fixture;
}

function bars(fixture: ComponentFixture<HostComponent>): SVGRectElement[] {
  return Array.from(fixture.nativeElement.querySelectorAll('rect.kui-chart__bar'));
}

describe('KuiBarChartComponent', () => {
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
    const firstRight = Number(first.getAttribute('x')) + Number(first.getAttribute('width'));
    const secondX = Number(second.getAttribute('x'));
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
    expect(rects[0].getAttribute('x')).toBe(rects[1].getAttribute('x'));
    expect(rects[0].getAttribute('width')).toBe(rects[1].getAttribute('width'));
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
    const heights = rects.map((r) => Number(r.getAttribute('height')));
    const widths = rects.map((r) => Number(r.getAttribute('width')));
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
});

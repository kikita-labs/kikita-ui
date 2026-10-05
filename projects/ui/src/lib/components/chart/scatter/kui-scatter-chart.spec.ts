import { Component, signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { describe, expect, it } from 'vitest';

import type { KuiChartScatterSeries, KuiChartTooltipFormatter } from '../chart.types';
import { markerPath } from '../core/chart-symbols.util';
import { KuiScatterChart } from './kui-scatter-chart';

@Component({
  imports: [KuiScatterChart],
  template: `
    <kui-scatter-chart
      [series]="series()"
      [bubble]="bubble()"
      [loading]="loading()"
      [tooltip]="tooltip()"
    />
  `,
})
class HostComponent {
  readonly series = signal<readonly KuiChartScatterSeries[]>([
    {
      id: 'a',
      name: 'Cohort A',
      points: [
        { x: 1, y: 10 },
        { x: 3, y: 30 },
        { x: 5, y: 20 },
      ],
    },
  ]);
  readonly bubble = signal(false);
  readonly loading = signal(false);
  readonly tooltip = signal<KuiChartTooltipFormatter | undefined>(undefined);
}

function createFixture(): ComponentFixture<HostComponent> {
  TestBed.configureTestingModule({ imports: [HostComponent] });
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  return fixture;
}

function hitMarks(fixture: ComponentFixture<HostComponent>): SVGCircleElement[] {
  return Array.from(fixture.nativeElement.querySelectorAll('circle.kui-chart__mark-hit'));
}

function decorationMarks(fixture: ComponentFixture<HostComponent>): SVGPathElement[] {
  return Array.from(fixture.nativeElement.querySelectorAll('path.kui-chart__mark--decoration'));
}

describe('KuiScatterChart', () => {
  it('uses a generic accessible name when ariaLabel is omitted', () => {
    const fixture = createFixture();
    const graphic = fixture.nativeElement.querySelector('svg.kui-chart__svg') as SVGElement;

    expect(graphic.getAttribute('aria-label')).toBe('Scatter chart');
  });

  it('renders one hit-circle and one decoration circle per point', () => {
    const fixture = createFixture();
    expect(hitMarks(fixture)).toHaveLength(3);
    expect(decorationMarks(fixture)).toHaveLength(3);
  });

  it('drops points with a non-finite coordinate', () => {
    const fixture = createFixture();
    fixture.componentInstance.series.set([
      {
        id: 'a',
        name: 'A',
        points: [
          { x: 1, y: 2 },
          { x: Number.NaN, y: 3 },
        ],
      },
    ]);
    fixture.detectChanges();
    expect(hitMarks(fixture)).toHaveLength(1);
  });

  it('uses a fixed default radius when bubble is false, ignoring point.r', () => {
    const fixture = createFixture();
    fixture.componentInstance.series.set([{ id: 'a', name: 'A', points: [{ x: 1, y: 1, r: 40 }] }]);
    fixture.detectChanges();
    const decoration = decorationMarks(fixture)[0];
    expect(decoration.getAttribute('d')).toBe(markerPath('circle', 4));
  });

  it('uses point.r as the radius when bubble is true', () => {
    const fixture = createFixture();
    fixture.componentInstance.series.set([{ id: 'a', name: 'A', points: [{ x: 1, y: 1, r: 15 }] }]);
    fixture.componentInstance.bubble.set(true);
    fixture.detectChanges();
    const decoration = decorationMarks(fixture)[0];
    expect(decoration.getAttribute('d')).toBe(markerPath('circle', 15));
  });

  it('gives the hit-circle a larger radius than a small visual dot for touch/pointer targets', () => {
    const fixture = createFixture();
    const hit = hitMarks(fixture)[0];
    const decoration = decorationMarks(fixture)[0];
    expect(decoration.getAttribute('d')).toBe(markerPath('circle', 4));
    expect(Number(hit.getAttribute('r'))).toBeGreaterThan(4);
  });

  it('hides the decoration circle from the accessibility tree; the hit-circle carries the label', () => {
    const fixture = createFixture();
    expect(decorationMarks(fixture)[0].getAttribute('aria-hidden')).toBe('true');
    expect(hitMarks(fixture)[0].getAttribute('role')).toBe('graphics-symbol img');
    expect(hitMarks(fixture)[0].getAttribute('aria-label')).not.toBeNull();
  });

  it('shows the loading placeholder and the empty state correctly', () => {
    const fixture = createFixture();
    fixture.componentInstance.loading.set(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.kui-chart__loading-scatter')).not.toBeNull();

    fixture.componentInstance.loading.set(false);
    fixture.componentInstance.series.set([{ id: 'a', name: 'A', points: [] }]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.kui-chart__empty')).not.toBeNull();
  });

  it('renders the alt-table with an R column only when bubble is true', () => {
    const fixture = createFixture();
    const buttons: HTMLButtonElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('button'),
    );
    const tableButton = buttons.find((b) => b.textContent?.trim() === 'Table')!;
    tableButton.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('th').length).toBe(3);

    fixture.componentInstance.bubble.set(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('th').length).toBe(4);
  });

  it('only one mark is a tab stop at a time (roving tabindex)', () => {
    const fixture = createFixture();
    const tabbable = hitMarks(fixture).filter((m) => m.getAttribute('tabindex') === '0');
    expect(tabbable).toHaveLength(1);
  });

  it('overrides the default tooltip text with a custom formatter', () => {
    const fixture = createFixture();
    fixture.componentInstance.tooltip.set((point) => `custom:${point.seriesName}=${point.value}`);
    fixture.detectChanges();
    const [firstHit] = hitMarks(fixture);
    expect(firstHit.getAttribute('aria-label')).toBe('custom:Cohort A=10');
  });

  it('names a point with its data coordinates, not its screen position', () => {
    const fixture = createFixture();
    const labels = hitMarks(fixture).map((hit) => hit.getAttribute('aria-label'));

    expect(labels).toEqual(['Cohort A: (1, 10)', 'Cohort A: (3, 30)', 'Cohort A: (5, 20)']);
  });

  it('hands a custom formatter the data coordinates and the bubble radius', () => {
    const fixture = createFixture();
    const seen: unknown[] = [];
    fixture.componentInstance.series.set([
      { id: 'a', name: 'A', points: [{ x: 22, y: 32000, r: 7 }] },
    ]);
    fixture.componentInstance.bubble.set(true);
    fixture.componentInstance.tooltip.set((point) => {
      seen.push({ x: point.x, y: point.y, r: point.r, value: point.value });
      return 'text';
    });
    fixture.detectChanges();

    expect(seen).toContainEqual({ x: 22, y: 32000, r: 7, value: 32000 });
  });

  it('adds the radius to the name of a bubble and leaves it out for a plain scatter point', () => {
    const fixture = createFixture();
    fixture.componentInstance.series.set([{ id: 'a', name: 'A', points: [{ x: 22, y: 5, r: 7 }] }]);
    fixture.detectChanges();
    expect(hitMarks(fixture)[0].getAttribute('aria-label')).toBe('A: (22, 5)');

    fixture.componentInstance.bubble.set(true);
    fixture.detectChanges();
    expect(hitMarks(fixture)[0].getAttribute('aria-label')).toBe('A: (22, 5), radius 7');
  });

  it('names the table columns and the legend group from the chart messages', () => {
    const fixture = createFixture();
    fixture.componentInstance.series.set([
      { id: 'a', name: 'A', points: [{ x: 1, y: 2, r: 3 }] },
      { id: 'b', name: 'B', points: [{ x: 2, y: 3, r: 4 }] },
    ]);
    fixture.componentInstance.bubble.set(true);
    fixture.detectChanges();

    const legend = fixture.nativeElement.querySelector('.kui-chart__legend') as HTMLElement;
    expect(legend.getAttribute('aria-label')).toBe('Legend');

    (
      fixture.nativeElement.querySelector('.kui-chart__toolbar button[kuiButton]') as HTMLElement
    ).click();
    fixture.detectChanges();

    const headers = Array.from(fixture.nativeElement.querySelectorAll('th')).map((th) =>
      (th as HTMLElement).textContent?.trim(),
    );
    expect(headers).toEqual(['Series', 'X', 'Y', 'Radius']);
  });

  it('uses an explicit series color instead of the round-robin default', () => {
    const fixture = createFixture();
    fixture.componentInstance.series.set([
      { id: 'a', name: 'A', color: 'crimson', points: [{ x: 1, y: 1 }] },
    ]);
    fixture.detectChanges();
    const decoration = decorationMarks(fixture)[0];
    expect(decoration.getAttribute('style')).toContain('crimson');
  });

  it('renders ~500 points without throwing (plan section 12.7 volume target)', () => {
    const fixture = createFixture();
    const points = Array.from({ length: 500 }, (_, i) => ({ x: i, y: (i * 37) % 200 }));
    fixture.componentInstance.series.set([{ id: 's', name: 'S', points }]);
    fixture.detectChanges();
    expect(hitMarks(fixture)).toHaveLength(500);
  });
});

import { Component, signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { describe, expect, it } from 'vitest';

import type { KuiChartLegendItem, KuiChartLegendSource } from './chart.types';
import { KuiChartLegendComponent } from './kui-chart-legend.component';
import { KuiChartLegendItemDirective } from './kui-chart-legend-item.directive';

/** Minimal `KuiChartLegendSource` fake -- isolates these tests from any real chart component's
 * data-normalization/scale logic, since `kui-chart-legend` only ever reads this interface. */
class FakeChartLegendSource implements KuiChartLegendSource {
  private readonly items = signal<readonly KuiChartLegendItem[]>([
    { id: 'a', label: 'Series A', color: 'red', hidden: false },
    { id: 'b', label: 'Series B', color: 'blue', hidden: true },
  ]);
  private readonly hovered = signal<string | null>(null);

  readonly legendItems = () => this.items();
  readonly hoveredLegendId = () => this.hovered();

  toggleLegendItem(id: string): void {
    this.items.update((items) =>
      items.map((item) => (item.id === id ? { ...item, hidden: !item.hidden } : item)),
    );
  }

  setHoveredLegendId(id: string | null): void {
    this.hovered.set(id);
  }
}

@Component({
  imports: [KuiChartLegendComponent],
  template: `<kui-chart-legend [chart]="chart" />`,
})
class HostComponent {
  readonly chart = new FakeChartLegendSource();
}

function createFixture(): ComponentFixture<HostComponent> {
  TestBed.configureTestingModule({ imports: [HostComponent] });
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  return fixture;
}

function legendButtons(fixture: ComponentFixture<HostComponent>): HTMLButtonElement[] {
  return Array.from(fixture.nativeElement.querySelectorAll('.kui-chart__legend-item'));
}

describe('KuiChartLegendComponent', () => {
  it('renders one item per legendItems() entry, reflecting hidden state', () => {
    const fixture = createFixture();
    const buttons = legendButtons(fixture);
    expect(buttons).toHaveLength(2);
    expect(buttons[0].getAttribute('aria-pressed')).toBe('true');
    expect(buttons[1].getAttribute('aria-pressed')).toBe('false');
    expect(buttons[1].className).toContain('kui-chart__legend-item--hidden');
  });

  it('clicking an item calls toggleLegendItem on the chart', () => {
    const fixture = createFixture();
    legendButtons(fixture)[0].click();
    fixture.detectChanges();
    expect(legendButtons(fixture)[0].getAttribute('aria-pressed')).toBe('false');
  });

  it('hovering an item calls setHoveredLegendId, reflected in hoveredLegendId()', () => {
    const fixture = createFixture();
    legendButtons(fixture)[0].dispatchEvent(new Event('pointerenter'));
    expect(fixture.componentInstance.chart.hoveredLegendId()).toBe('a');
    legendButtons(fixture)[0].dispatchEvent(new Event('pointerleave'));
    expect(fixture.componentInstance.chart.hoveredLegendId()).toBeNull();
  });
});

@Component({
  imports: [KuiChartLegendComponent, KuiChartLegendItemDirective],
  template: `
    <kui-chart-legend [chart]="chart">
      <ng-template kuiChartLegendItem let-item>
        <span class="custom-item">{{ item.label }}</span>
      </ng-template>
    </kui-chart-legend>
  `,
})
class CustomTemplateHostComponent {
  readonly chart = new FakeChartLegendSource();
}

describe('KuiChartLegendComponent with a custom kuiChartLegendItem template', () => {
  it('renders the projected template instead of the built-in button markup', () => {
    TestBed.configureTestingModule({ imports: [CustomTemplateHostComponent] });
    const fixture = TestBed.createComponent(CustomTemplateHostComponent);
    fixture.detectChanges();
    const customItems: HTMLElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('.custom-item'),
    );
    expect(customItems).toHaveLength(2);
    expect(customItems[0].textContent).toBe('Series A');
    expect(fixture.nativeElement.querySelector('.kui-chart__legend-item')).toBeNull();
  });
});

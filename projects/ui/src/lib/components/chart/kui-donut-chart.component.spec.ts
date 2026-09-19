import { Component, signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { describe, expect, it } from 'vitest';

import type { KuiChartSlice, KuiChartTooltipFormatter } from './chart.types';
import { KuiDonutChartComponent } from './kui-donut-chart.component';

@Component({
  imports: [KuiDonutChartComponent],
  template: `
    <kui-donut-chart
      ariaLabel="Plan mix"
      [slices]="slices()"
      [loading]="loading()"
      [tooltip]="tooltip()"
    />
  `,
})
class HostComponent {
  readonly slices = signal<readonly KuiChartSlice[]>([
    { id: 'free', label: 'Free', value: 40 },
    { id: 'pro', label: 'Pro', value: 35 },
    { id: 'business', label: 'Business', value: 25 },
  ]);
  readonly loading = signal(false);
  readonly tooltip = signal<KuiChartTooltipFormatter | undefined>(undefined);
}

function createFixture(): ComponentFixture<HostComponent> {
  TestBed.configureTestingModule({ imports: [HostComponent] });
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  return fixture;
}

function slicePaths(fixture: ComponentFixture<HostComponent>): SVGPathElement[] {
  return Array.from(fixture.nativeElement.querySelectorAll('path.kui-chart__slice'));
}

/** The real hit target (pointer/focus events, a11y attrs) -- a separate, untransformed element
 * from the cosmetic `.kui-chart__slice` twin. See `kui-donut-chart.component.html`'s doc on the
 * hover-flicker bug this split fixes. */
function sliceHitPaths(fixture: ComponentFixture<HostComponent>): SVGPathElement[] {
  return Array.from(fixture.nativeElement.querySelectorAll('path.kui-chart__slice-hit'));
}

function legendButtons(fixture: ComponentFixture<HostComponent>): HTMLButtonElement[] {
  return Array.from(fixture.nativeElement.querySelectorAll('.kui-chart__legend-item'));
}

/**
 * Waits past the donut's hide/show re-partition animation (`DONUT_TWEEN_DURATION_MS`, 260ms) and
 * flushes change detection -- a slice/share change after the component's first render animates via
 * `requestAnimationFrame` (see `KuiDonutChartComponent`'s `displayedShareById` doc), so `d`/`share`
 * geometry doesn't reach its final value synchronously the way a plain signal write would. Any test
 * asserting on rendered slice geometry after a *second* `slices`/hide-toggle change needs this;
 * tests asserting on plain signal-driven state (legend `aria-pressed`, `legendEnabled()`, etc.) or
 * on the component's very first render don't, since those aren't animated.
 */
async function settleAnimation(fixture: ComponentFixture<HostComponent>): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  fixture.detectChanges();
}

/**
 * Asserts a single-slice donut's `d` is a real two-circle ring (`donutFullRingPath`'s shape:
 * an outer circle subpath and an inner circle subpath, each closed by its own `Z`), not a
 * degenerate zero-length arc -- the original symptom of the "SVG can't draw a true 360-degree
 * arc" bug (browsers render a single unclosed arc spanning exactly 360 degrees as invisible).
 * `donutArcPath`'s single-arc-per-edge technique can't close seamlessly for a full circle even
 * with its `FULL_CIRCLE_EPSILON` nudge (the tiny gap is visible once actually rendered, see
 * `KuiDonutChartComponent.renderedSlices`'s doc) -- `donutFullRingPath` sidesteps the whole
 * problem with two independently-closing circles instead of one continuous arc.
 */
function expectFullRingPath(d: string | null): void {
  expect(d).not.toBeNull();
  expect(d!.match(/Z/g)).toHaveLength(2);
  expect(d!.match(/M/g)).toHaveLength(2);
}

describe('KuiDonutChartComponent', () => {
  it('renders one arc path per slice', () => {
    const fixture = createFixture();
    expect(slicePaths(fixture)).toHaveLength(3);
  });

  it('drops negative-value slices', async () => {
    const fixture = createFixture();
    fixture.componentInstance.slices.set([
      { id: 'a', label: 'A', value: -10 },
      { id: 'b', label: 'B', value: 20 },
    ]);
    fixture.detectChanges();
    await settleAnimation(fixture);
    expect(slicePaths(fixture)).toHaveLength(1);
  });

  it('hiding a slice recomputes the remaining arcs to fill its angular space', async () => {
    const fixture = createFixture();
    const pathsBefore = slicePaths(fixture).map((p) => p.getAttribute('d'));

    legendButtons(fixture)[0].click();
    fixture.detectChanges();
    await settleAnimation(fixture);

    const pathsAfter = slicePaths(fixture).map((p) => p.getAttribute('d'));
    expect(pathsAfter).toHaveLength(2);
    // The remaining two arcs' geometry is recomputed against the smaller total (their combined
    // value, excluding the hidden slice) -- not identical to what they were before hiding.
    expect(pathsAfter).not.toEqual(pathsBefore.slice(1));
  });

  it('keeps the legend interactive and visible for a hidden slice', () => {
    const fixture = createFixture();
    legendButtons(fixture)[0].click();
    fixture.detectChanges();
    const buttons = legendButtons(fixture);
    expect(buttons).toHaveLength(3);
    expect(buttons[0].getAttribute('aria-pressed')).toBe('false');
  });

  it('gives a single all-zero slice a full ring instead of a broken render', async () => {
    const fixture = createFixture();
    fixture.componentInstance.slices.set([{ id: 'a', label: 'Only', value: 0 }]);
    fixture.detectChanges();
    await settleAnimation(fixture);
    const paths = slicePaths(fixture);
    expect(paths).toHaveLength(1);
    expect(paths[0].getAttribute('fill-rule')).toBe('evenodd');
    expectFullRingPath(paths[0].getAttribute('d'));
  });

  it('renders a real (non-zero-value) single slice as a seamless two-circle ring, not a one-arc wedge', async () => {
    // A single 100%-share slice spans the full circle. `donutArcPath`'s one-arc-per-edge technique
    // cannot close that seamlessly (browsers render a truly closed 360-degree arc as invisible,
    // and the `FULL_CIRCLE_EPSILON` workaround leaves a sliver visible once actually rendered at
    // real size -- found by browser-checking this exact demo, not by a unit test). Single-slice
    // donuts use `donutFullRingPath` instead -- see its own and `renderedSlices`'s doc.
    const fixture = createFixture();
    fixture.componentInstance.slices.set([{ id: 'only', label: 'Only plan', value: 100 }]);
    fixture.detectChanges();
    await settleAnimation(fixture);
    const paths = slicePaths(fixture);
    expect(paths).toHaveLength(1);
    expect(paths[0].getAttribute('fill-rule')).toBe('evenodd');
    expectFullRingPath(paths[0].getAttribute('d'));
  });

  it('shows the shared empty-state composition and the ring-shaped loading skeleton', () => {
    const fixture = createFixture();
    fixture.componentInstance.loading.set(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.kui-chart__loading-ring')).not.toBeNull();

    fixture.componentInstance.loading.set(false);
    fixture.componentInstance.slices.set([]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.kui-chart__empty')).not.toBeNull();
  });

  it('renders the alt-table with exact values', () => {
    const fixture = createFixture();
    const buttons: HTMLButtonElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('button'),
    );
    const tableButton = buttons.find((b) => b.textContent?.trim() === 'Table')!;
    tableButton.click();
    fixture.detectChanges();
    const table = fixture.nativeElement.querySelector('table');
    expect(table.textContent).toContain('Free');
    expect(table.textContent).toContain('40');
  });

  it('gives every slice role="graphics-symbol img" and roving tabindex', () => {
    const fixture = createFixture();
    const paths = sliceHitPaths(fixture);
    paths.forEach((p) => expect(p.getAttribute('role')).toBe('graphics-symbol img'));
    expect(paths.filter((p) => p.getAttribute('tabindex') === '0')).toHaveLength(1);
  });

  it('hides the legend for a single slice by default', () => {
    const fixture = createFixture();
    fixture.componentInstance.slices.set([{ id: 'a', label: 'Only', value: 10 }]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.kui-chart__legend')).toBeNull();
  });

  it('overrides the default tooltip text with a custom formatter', () => {
    const fixture = createFixture();
    fixture.componentInstance.tooltip.set((point) => `custom:${point.seriesName}=${point.value}`);
    fixture.detectChanges();
    const [firstSlice] = sliceHitPaths(fixture);
    expect(firstSlice.getAttribute('aria-label')).toBe('custom:Free=40');
  });

  it('uses an explicit slice color instead of the round-robin default', async () => {
    const fixture = createFixture();
    fixture.componentInstance.slices.set([{ id: 'a', label: 'A', color: 'crimson', value: 10 }]);
    fixture.detectChanges();
    await settleAnimation(fixture);
    const [firstSlice] = slicePaths(fixture);
    expect(firstSlice.getAttribute('style')).toContain('crimson');
  });

  it('renders ~500 thin slices without throwing (plan section 12.7 volume target)', async () => {
    const fixture = createFixture();
    const slices = Array.from({ length: 500 }, (_, i) => ({
      id: `s${i}`,
      label: `S${i}`,
      value: 1,
    }));
    fixture.componentInstance.slices.set(slices);
    fixture.detectChanges();
    await settleAnimation(fixture);
    expect(slicePaths(fixture)).toHaveLength(500);
  });
});

import { describe, expect, it } from 'vitest';

import { normalizeCartesianSeries, normalizeSlices } from './chart-normalize.util';
import {
  computeDonutShares,
  computeGroupedDomain,
  computeNiceScale,
  computeScatterDomain,
  computeStackedDomain,
  formatCompact,
  thinTicks,
} from './chart-scale.util';

describe('computeNiceScale', () => {
  it('rounds the domain outward to step boundaries', () => {
    const scale = computeNiceScale(3, 47);
    expect(scale.min).toBeLessThanOrEqual(3);
    expect(scale.max).toBeGreaterThanOrEqual(47);
    expect(scale.ticks.length).toBeGreaterThan(1);
  });

  it('expands a degenerate min===max domain instead of dividing by zero', () => {
    const scale = computeNiceScale(10, 10);
    expect(scale.min).toBeLessThan(10);
    expect(scale.max).toBeGreaterThan(10);
    expect(Number.isFinite(scale.min)).toBe(true);
    expect(Number.isFinite(scale.max)).toBe(true);
  });

  it('handles an all-zero domain', () => {
    const scale = computeNiceScale(0, 0);
    expect(scale.min).toBe(-1);
    expect(scale.max).toBe(1);
  });
});

describe('computeGroupedDomain', () => {
  it('always includes zero even when all values are positive', () => {
    const series = normalizeCartesianSeries(
      [{ name: 'A', data: [10, 20, 30] }],
      ['a', 'b', 'c'],
      'line',
    );
    expect(computeGroupedDomain(series)).toEqual({ min: 0, max: 30 });
  });

  it('does not clamp negative values to zero', () => {
    const series = normalizeCartesianSeries(
      [{ name: 'A', data: [-10, 5, -20] }],
      ['a', 'b', 'c'],
      'line',
    );
    expect(computeGroupedDomain(series)).toEqual({ min: -20, max: 5 });
  });

  it('ignores gaps', () => {
    const series = normalizeCartesianSeries(
      [{ name: 'A', data: [10, null, 30] }],
      ['a', 'b', 'c'],
      'line',
    );
    expect(computeGroupedDomain(series)).toEqual({ min: 0, max: 30 });
  });
});

describe('computeStackedDomain', () => {
  it('sums positive values across series per category, not per-series max', () => {
    const series = normalizeCartesianSeries(
      [
        { name: 'A', data: [60] },
        { name: 'B', data: [70] },
      ],
      ['q1'],
      'bar',
    );
    expect(computeStackedDomain(series, 1)).toEqual({ min: 0, max: 130 });
  });

  it('accumulates positive and negative stacks separately (diverging)', () => {
    const series = normalizeCartesianSeries(
      [
        { name: 'A', data: [40] },
        { name: 'B', data: [-30] },
        { name: 'C', data: [-10] },
      ],
      ['q1'],
      'bar',
    );
    expect(computeStackedDomain(series, 1)).toEqual({ min: -40, max: 40 });
  });

  it('excludes a hidden series from the stacked sum (collapses the stack)', () => {
    const series = normalizeCartesianSeries(
      [
        { id: 'a', name: 'A', data: [60] },
        { id: 'b', name: 'B', data: [70] },
      ],
      ['q1'],
      'bar',
    );
    expect(computeStackedDomain(series, 1, new Set(['b']))).toEqual({ min: 0, max: 60 });
  });
});

describe('formatCompact', () => {
  it.each([
    [0, '0'],
    [999, '999'],
    [1200, '1.2K'],
    [3400000, '3.4M'],
    [-1200, '-1.2K'],
  ])('formats %d as %s', (value, expected) => {
    expect(formatCompact(value)).toBe(expected);
  });
});

describe('thinTicks', () => {
  it('returns every index when they all fit', () => {
    expect(thinTicks(5, 500, 50)).toEqual([0, 1, 2, 3, 4]);
  });

  it('thins dense categories down to what fits, always keeping the last index', () => {
    const indices = thinTicks(120, 600, 50);
    expect(indices.length).toBeLessThan(120);
    expect(indices[0]).toBe(0);
    expect(indices.at(-1)).toBe(119);
  });

  it('handles zero and one category without throwing', () => {
    expect(thinTicks(0, 500, 50)).toEqual([]);
    expect(thinTicks(1, 500, 50)).toEqual([0]);
  });

  it('drops the second-to-last tick instead of rendering it too close to the forced last one', () => {
    // categoryCount=120, availableWidth=600, minLabelWidth=50 -> step lands the natural last tick
    // at index 110, only ~45 viewBox units before the forced index 119 -- under minLabelWidth, so
    // it must be dropped rather than left to visually collide with the edge-anchored last label.
    const indices = thinTicks(120, 600, 50);
    const pxPerCategory = 600 / 119;
    const gap = (indices.at(-1)! - indices.at(-2)!) * pxPerCategory;
    expect(gap).toBeGreaterThanOrEqual(50);
  });
});

describe('computeDonutShares', () => {
  it('computes proportional shares', () => {
    const slices = normalizeSlices([
      { label: 'Free', value: 25 },
      { label: 'Pro', value: 75 },
    ]);
    const shares = computeDonutShares(slices);
    expect(shares[0].share).toBeCloseTo(0.25);
    expect(shares[1].share).toBeCloseTo(0.75);
  });

  it('splits an all-zero total into equal shares instead of NaN', () => {
    const slices = normalizeSlices([
      { label: 'Free', value: 0 },
      { label: 'Pro', value: 0 },
    ]);
    const shares = computeDonutShares(slices);
    expect(shares[0].share).toBeCloseTo(0.5);
    expect(shares[1].share).toBeCloseTo(0.5);
  });

  it('gives a single all-zero slice a full circle (share 1), not zero', () => {
    const slices = normalizeSlices([{ label: 'Only', value: 0 }]);
    expect(computeDonutShares(slices)[0].share).toBe(1);
  });

  it('recomputes shares excluding hidden slices from both the total and the result', () => {
    const slices = normalizeSlices([
      { id: 'a', label: 'A', value: 25 },
      { id: 'b', label: 'B', value: 25 },
      { id: 'c', label: 'C', value: 50 },
    ]);
    const shares = computeDonutShares(slices, new Set(['b']));
    expect(shares).toHaveLength(2);
    expect(shares[0].share).toBeCloseTo(1 / 3);
    expect(shares[1].share).toBeCloseTo(2 / 3);
  });

  it('returns an empty list for an empty slices array without dividing by zero', () => {
    expect(computeDonutShares([])).toEqual([]);
  });
});

describe('computeScatterDomain', () => {
  it('computes the data extent for the given accessor, not forced through zero', () => {
    const series = [
      {
        points: [
          { x: 20, y: 30000 },
          { x: 80, y: 150000 },
        ],
      },
    ];
    expect(computeScatterDomain(series, 'x')).toEqual({ min: 20, max: 80 });
    expect(computeScatterDomain(series, 'y')).toEqual({ min: 30000, max: 150000 });
  });

  it('spans across every series regardless of hidden state (caller filters before calling)', () => {
    const series = [{ points: [{ x: 1, y: 1 }] }, { points: [{ x: 9, y: 9 }] }];
    expect(computeScatterDomain(series, 'x')).toEqual({ min: 1, max: 9 });
  });

  it('returns a zero domain for no points instead of Infinity', () => {
    expect(computeScatterDomain([], 'x')).toEqual({ min: 0, max: 0 });
    expect(computeScatterDomain([{ points: [] }], 'x')).toEqual({ min: 0, max: 0 });
  });
});

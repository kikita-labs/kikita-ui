import { describe, expect, it } from 'vitest';

import {
  normalizeCartesianSeries,
  normalizeScatterSeries,
  normalizeSlices,
  resolveStableIds,
} from './chart-normalize.util';

describe('resolveStableIds', () => {
  it('uses the explicit id when present', () => {
    expect(resolveStableIds([{ id: 'a', label: 'Alpha' }])).toEqual(['a']);
  });

  it('falls back to label when id is omitted', () => {
    expect(resolveStableIds([{ label: 'Alpha' }])).toEqual(['Alpha']);
  });

  it('appends an index suffix to keep colliding fallback labels unique', () => {
    expect(resolveStableIds([{ label: 'A' }, { label: 'A' }, { label: 'A' }])).toEqual([
      'A',
      'A:1',
      'A:2',
    ]);
  });
});

describe('normalizeCartesianSeries', () => {
  const categories = ['Mon', 'Tue', 'Wed'];

  it('maps aligned numeric data to points', () => {
    const [series] = normalizeCartesianSeries(
      [{ name: 'Sessions', data: [10, 20, 30] }],
      categories,
      'line',
    );

    expect(series.slots).toHaveLength(3);
    expect(series.slots[0]).toMatchObject({ y: 10, categoryLabel: 'Mon', categoryIndex: 0 });
    expect(series.slots[2]).toMatchObject({ y: 30, categoryLabel: 'Wed', categoryIndex: 2 });
  });

  it('treats null as a gap, not zero', () => {
    const [series] = normalizeCartesianSeries(
      [{ name: 'Sessions', data: [10, null, 30] }],
      categories,
      'line',
    );

    expect(series.slots[1]).toBeNull();
    expect(series.slots[0]).not.toBeNull();
    expect(series.slots[2]).not.toBeNull();
  });

  it('treats NaN and Infinity as gaps, not as literal values', () => {
    const [series] = normalizeCartesianSeries(
      [{ name: 'Sessions', data: [Number.NaN, Number.POSITIVE_INFINITY, 5] }],
      categories,
      'line',
    );

    expect(series.slots[0]).toBeNull();
    expect(series.slots[1]).toBeNull();
    expect(series.slots[2]).toMatchObject({ y: 5 });
  });

  it('truncates to the shorter of data/categories length instead of throwing', () => {
    const [series] = normalizeCartesianSeries(
      [{ name: 'Sessions', data: [1, 2] }],
      categories,
      'line',
    );

    expect(series.slots).toHaveLength(2);
  });

  it('truncates when data is longer than categories', () => {
    const [series] = normalizeCartesianSeries(
      [{ name: 'Sessions', data: [1, 2, 3, 4, 5] }],
      categories,
      'bar',
    );

    expect(series.slots).toHaveLength(3);
  });

  it('handles an empty series inside a non-empty series array', () => {
    const [withData, empty] = normalizeCartesianSeries(
      [
        { name: 'A', data: [1, 2, 3] },
        { name: 'B', data: [] },
      ],
      categories,
      'line',
    );

    expect(withData.slots).toHaveLength(3);
    expect(empty.slots).toHaveLength(0);
  });

  it('defaults seriesColor to a round-robin --kui-chart-series-* token when color is omitted', () => {
    const series = normalizeCartesianSeries(
      [
        { name: 'A', data: [1, 2, 3] },
        { name: 'B', data: [1, 2, 3] },
      ],
      categories,
      'line',
    );
    expect(series[0].seriesColor).toBe('var(--kui-chart-series-1)');
    expect(series[1].seriesColor).toBe('var(--kui-chart-series-2)');
    expect(series[0].slots[0]?.seriesColor).toBe('var(--kui-chart-series-1)');
  });

  it('uses an explicit color over the default when given', () => {
    const [series] = normalizeCartesianSeries(
      [{ name: 'A', color: 'crimson', data: [1] }],
      ['a'],
      'line',
    );
    expect(series.seriesColor).toBe('crimson');
  });

  it('resolves stable per-series ids used across all slots of that series', () => {
    const [series] = normalizeCartesianSeries(
      [{ id: 'sessions', name: 'Sessions', data: [1, 2, 3] }],
      categories,
      'line',
    );

    expect(series.seriesId).toBe('sessions');
    expect(series.slots.every((slot) => slot?.seriesId === 'sessions')).toBe(true);
  });
});

describe('normalizeScatterSeries', () => {
  it('maps valid coordinates through', () => {
    const [series] = normalizeScatterSeries([
      {
        name: 'Cohort A',
        points: [
          { x: 1, y: 2 },
          { x: 3, y: 4, r: 5 },
        ],
      },
    ]);

    expect(series.points).toHaveLength(2);
    expect(series.points[1]).toMatchObject({ x: 3, y: 4, r: 5, kind: 'scatter' });
  });

  it('defaults seriesColor to a round-robin token', () => {
    const series = normalizeScatterSeries([
      { name: 'A', points: [{ x: 1, y: 1 }] },
      { name: 'B', points: [{ x: 1, y: 1 }] },
    ]);
    expect(series[0].seriesColor).toBe('var(--kui-chart-series-1)');
    expect(series[1].seriesColor).toBe('var(--kui-chart-series-2)');
  });

  it('drops points with a non-finite x, y, or r', () => {
    const [series] = normalizeScatterSeries([
      {
        name: 'Cohort A',
        points: [
          { x: Number.NaN, y: 1 },
          { x: 1, y: Number.POSITIVE_INFINITY },
          { x: 1, y: 2, r: Number.NaN },
          { x: 1, y: 2 },
        ],
      },
    ]);

    expect(series.points).toHaveLength(1);
  });
});

describe('normalizeSlices', () => {
  it('maps valid slices through', () => {
    const slices = normalizeSlices([
      { label: 'Free', value: 40 },
      { label: 'Pro', value: 60 },
    ]);

    expect(slices).toHaveLength(2);
    expect(slices[0]).toMatchObject({ label: 'Free', value: 40, kind: 'donut' });
  });

  it('defaults color to a round-robin token', () => {
    const slices = normalizeSlices([
      { label: 'Free', value: 10 },
      { label: 'Pro', value: 20 },
    ]);
    expect(slices[0].color).toBe('var(--kui-chart-series-1)');
    expect(slices[1].color).toBe('var(--kui-chart-series-2)');
  });

  it('drops negative-value slices', () => {
    const slices = normalizeSlices([
      { label: 'Free', value: -10 },
      { label: 'Pro', value: 60 },
    ]);

    expect(slices).toHaveLength(1);
    expect(slices[0].label).toBe('Pro');
  });

  it('keeps zero-value slices (all-zero handling is the scale util concern, not normalization)', () => {
    const slices = normalizeSlices([
      { label: 'Free', value: 0 },
      { label: 'Pro', value: 0 },
    ]);

    expect(slices).toHaveLength(2);
  });

  it('drops non-finite values', () => {
    const slices = normalizeSlices([
      { label: 'Free', value: Number.NaN },
      { label: 'Pro', value: 60 },
    ]);

    expect(slices).toHaveLength(1);
  });
});

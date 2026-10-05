import { describe, expect, it } from 'vitest';

import type { KuiChartNavMark } from './chart-keyboard-nav.util';
import { computeNavigationTarget, resolveRovingKey } from './chart-keyboard-nav.util';

/** Two series over three categories; series 0 is drawn above series 1. */
const grid: readonly KuiChartNavMark[] = [
  { key: 'a0', series: 0, category: 0, x: 10, y: 20 },
  { key: 'b0', series: 1, category: 0, x: 10, y: 60 },
  { key: 'a1', series: 0, category: 1, x: 50, y: 30 },
  { key: 'b1', series: 1, category: 1, x: 50, y: 70 },
  { key: 'a2', series: 0, category: 2, x: 90, y: 25 },
  { key: 'b2', series: 1, category: 2, x: 90, y: 65 },
];

const sequence: readonly KuiChartNavMark[] = grid.map((mark, index) => ({
  ...mark,
  key: `m${index}`,
}));

describe('computeNavigationTarget', () => {
  it('returns null for a key that does not navigate, and for an empty chart', () => {
    expect(computeNavigationTarget('sequence', 'a', 'm0', sequence)).toBeNull();
    expect(computeNavigationTarget('columns', 'ArrowRight', null, [])).toBeNull();
  });

  it('moves to the first mark when the current key names nothing', () => {
    expect(computeNavigationTarget('columns', 'ArrowRight', 'gone', grid)).toBe('a0');
  });

  describe('sequence', () => {
    it('goes forward with Right and Down and back with Left and Up', () => {
      expect(computeNavigationTarget('sequence', 'ArrowRight', 'm1', sequence)).toBe('m2');
      expect(computeNavigationTarget('sequence', 'ArrowDown', 'm1', sequence)).toBe('m2');
      expect(computeNavigationTarget('sequence', 'ArrowLeft', 'm1', sequence)).toBe('m0');
      expect(computeNavigationTarget('sequence', 'ArrowUp', 'm1', sequence)).toBe('m0');
    });

    it('stays at the ends and jumps with Home and End', () => {
      expect(computeNavigationTarget('sequence', 'ArrowLeft', 'm0', sequence)).toBe('m0');
      expect(computeNavigationTarget('sequence', 'ArrowRight', 'm5', sequence)).toBe('m5');
      expect(computeNavigationTarget('sequence', 'Home', 'm3', sequence)).toBe('m0');
      expect(computeNavigationTarget('sequence', 'End', 'm3', sequence)).toBe('m5');
    });
  });

  describe('columns (line and stacked vertical bars)', () => {
    it('moves along the categories of the same series with Left and Right', () => {
      expect(computeNavigationTarget('columns', 'ArrowRight', 'a0', grid)).toBe('a1');
      expect(computeNavigationTarget('columns', 'ArrowRight', 'b1', grid)).toBe('b2');
      expect(computeNavigationTarget('columns', 'ArrowLeft', 'b1', grid)).toBe('b0');
    });

    it('moves between the series of one category by height with Up and Down', () => {
      expect(computeNavigationTarget('columns', 'ArrowDown', 'a1', grid)).toBe('b1');
      expect(computeNavigationTarget('columns', 'ArrowUp', 'b1', grid)).toBe('a1');
    });

    it('stays at the edges', () => {
      expect(computeNavigationTarget('columns', 'ArrowLeft', 'a0', grid)).toBe('a0');
      expect(computeNavigationTarget('columns', 'ArrowRight', 'a2', grid)).toBe('a2');
      expect(computeNavigationTarget('columns', 'ArrowUp', 'a1', grid)).toBe('a1');
      expect(computeNavigationTarget('columns', 'ArrowDown', 'b1', grid)).toBe('b1');
    });

    it('jumps to the first and last category of the series with Home and End', () => {
      expect(computeNavigationTarget('columns', 'Home', 'b1', grid)).toBe('b0');
      expect(computeNavigationTarget('columns', 'End', 'b1', grid)).toBe('b2');
    });

    it('skips a category where the series has a gap', () => {
      const withGap = grid.filter((mark) => mark.key !== 'a1');

      expect(computeNavigationTarget('columns', 'ArrowRight', 'a0', withGap)).toBe('a2');
      expect(computeNavigationTarget('columns', 'ArrowLeft', 'a2', withGap)).toBe('a0');
    });

    it('follows the visual order, not the series order, when lines cross', () => {
      const crossed = grid.map((mark) => (mark.key === 'a1' ? { ...mark, y: 90 } : mark));

      expect(computeNavigationTarget('columns', 'ArrowDown', 'b1', crossed)).toBe('a1');
      expect(computeNavigationTarget('columns', 'ArrowUp', 'a1', crossed)).toBe('b1');
    });
  });

  describe('rows (stacked horizontal bars)', () => {
    const rows: readonly KuiChartNavMark[] = [
      { key: 'a0', series: 0, category: 0, x: 20, y: 10 },
      { key: 'b0', series: 1, category: 0, x: 60, y: 10 },
      { key: 'a1', series: 0, category: 1, x: 30, y: 50 },
      { key: 'b1', series: 1, category: 1, x: 70, y: 50 },
    ];

    it('moves down the categories with Down and between segments with Right', () => {
      expect(computeNavigationTarget('rows', 'ArrowDown', 'a0', rows)).toBe('a1');
      expect(computeNavigationTarget('rows', 'ArrowUp', 'b1', rows)).toBe('b0');
      expect(computeNavigationTarget('rows', 'ArrowRight', 'a1', rows)).toBe('b1');
      expect(computeNavigationTarget('rows', 'ArrowLeft', 'b1', rows)).toBe('a1');
    });
  });
});

describe('resolveRovingKey', () => {
  it('keeps the chosen mark while it exists', () => {
    expect(resolveRovingKey(grid, 'b1', { series: 1, category: 1 })).toBe('b1');
  });

  it('moves to the same category of the closest series when the chosen mark is gone', () => {
    const withoutB1 = grid.filter((mark) => mark.key !== 'b1');

    expect(resolveRovingKey(withoutB1, 'b1', { series: 1, category: 1 })).toBe('a1');
  });

  it('stays at the same place along the axis when the whole series is hidden', () => {
    const onlyA = grid.filter((mark) => mark.series === 0);

    expect(resolveRovingKey(onlyA, 'b2', { series: 1, category: 2 })).toBe('a2');
  });

  it('falls back to the nearest category, then to the first mark', () => {
    const noCategoryOne = grid.filter((mark) => mark.category !== 1);

    expect(resolveRovingKey(noCategoryOne, 'a1', { series: 0, category: 1 })).toBe('a0');
    expect(resolveRovingKey(grid, null, null)).toBe('a0');
  });

  it('returns null when there are no marks', () => {
    expect(resolveRovingKey([], 'a0', { series: 0, category: 0 })).toBeNull();
  });
});

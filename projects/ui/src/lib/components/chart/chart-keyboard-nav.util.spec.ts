import { describe, expect, it } from 'vitest';

import { computeRovingIndex } from './chart-keyboard-nav.util';

describe('computeRovingIndex', () => {
  it('returns null when there are no marks', () => {
    expect(computeRovingIndex('ArrowRight', 0, 0)).toBeNull();
  });

  it('returns null for an unhandled key', () => {
    expect(computeRovingIndex('Escape', 2, 5)).toBeNull();
  });

  it.each([
    ['ArrowRight', 2, 5, 3],
    ['ArrowUp', 2, 5, 3],
    ['ArrowLeft', 2, 5, 1],
    ['ArrowDown', 2, 5, 1],
    ['Home', 2, 5, 0],
    ['End', 2, 5, 4],
  ])('%s from index %i (of %i) moves to %i', (key, current, count, expected) => {
    expect(computeRovingIndex(key, current, count)).toBe(expected);
  });

  it('clamps ArrowRight/ArrowUp at the last index', () => {
    expect(computeRovingIndex('ArrowRight', 4, 5)).toBe(4);
  });

  it('clamps ArrowLeft/ArrowDown at the first index', () => {
    expect(computeRovingIndex('ArrowLeft', 0, 5)).toBe(0);
  });
});

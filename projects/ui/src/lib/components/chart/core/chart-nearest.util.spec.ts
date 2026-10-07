import { describe, expect, it } from 'vitest';

import { distanceToRect, nearestPointIndex, nearestRectIndex } from './chart-nearest.util';

describe('nearestPointIndex', () => {
  const points = [
    { x: 10, y: 10 },
    { x: 40, y: 10 },
    { x: 40, y: 50 },
  ];

  it('returns the closest point within the distance', () => {
    expect(nearestPointIndex(points, 38, 12, 24)).toBe(1);
    expect(nearestPointIndex(points, 41, 46, 24)).toBe(2);
  });

  it('returns -1 when nothing is within the distance', () => {
    expect(nearestPointIndex(points, 200, 200, 24)).toBe(-1);
    expect(nearestPointIndex([], 0, 0, 24)).toBe(-1);
  });

  it('prefers the earlier point on a tie', () => {
    expect(
      nearestPointIndex(
        [
          { x: 0, y: 0 },
          { x: 10, y: 0 },
        ],
        5,
        0,
        24,
      ),
    ).toBe(0);
  });
});

describe('distanceToRect and nearestRectIndex', () => {
  const rects = [
    { x: 0, y: 0, width: 10, height: 100 },
    { x: 20, y: 40, width: 10, height: 60 },
  ];

  it('measures zero inside a rectangle and the straight distance outside it', () => {
    expect(distanceToRect(rects[0], 5, 50)).toBe(0);
    expect(distanceToRect(rects[0], 13, 50)).toBe(3);
    expect(distanceToRect(rects[0], 13, 104)).toBe(5);
  });

  it('picks the nearest rectangle within the distance', () => {
    expect(nearestRectIndex(rects, 4, 10, 24)).toBe(0);
    expect(nearestRectIndex(rects, 24, 60, 24)).toBe(1);
    expect(nearestRectIndex(rects, 15, 60, 24)).toBe(0);
  });

  it('returns -1 when no rectangle is within the distance', () => {
    expect(nearestRectIndex(rects, 400, 400, 24)).toBe(-1);
  });
});

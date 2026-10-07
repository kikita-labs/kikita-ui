import { describe, expect, it } from 'vitest';

import { KUI_CHART_MARKER_SHAPES, markerPath, markerShapeForSeries } from './chart-symbols.util';

describe('markerShapeForSeries', () => {
  it('uses circles when the series need not be told apart', () => {
    expect(markerShapeForSeries(3, false)).toBe('circle');
  });

  it('cycles through the shapes by series index', () => {
    expect(markerShapeForSeries(0, true)).toBe('circle');
    expect(markerShapeForSeries(1, true)).toBe('square');
    expect(markerShapeForSeries(KUI_CHART_MARKER_SHAPES.length, true)).toBe('circle');
  });
});

describe('markerPath', () => {
  it('draws a closed outline for every shape', () => {
    for (const shape of KUI_CHART_MARKER_SHAPES) {
      const path = markerPath(shape, 4);

      expect(path.startsWith('M')).toBe(true);
      expect(path.endsWith('Z')).toBe(true);
      expect(path).not.toContain('NaN');
    }
  });

  it('gives every shape a different outline', () => {
    const outlines = KUI_CHART_MARKER_SHAPES.map((shape) => markerPath(shape, 4));

    expect(new Set(outlines).size).toBe(KUI_CHART_MARKER_SHAPES.length);
  });

  it('scales with the radius and stays centred on the origin', () => {
    const small = markerPath('square', 2);
    const large = markerPath('square', 4);

    expect(small).not.toBe(large);
    expect(markerPath('diamond', 5)).toContain('0,-6.5');
  });
});

import { describe, expect, it } from 'vitest';

import { barPath } from './chart-bar-path.util';

describe('barPath', () => {
  it('draws a plain rectangle without a rounded end', () => {
    expect(barPath(10, 20, 30, 40, 4, null)).toBe('M10,20H40V60H10Z');
  });

  it('rounds only the top corners of an upward bar', () => {
    const d = barPath(10, 20, 30, 40, 4, 'top');

    expect(d.match(/A/g)).toHaveLength(2);
    expect(d.startsWith('M10,60V24')).toBe(true);
    expect(d.endsWith('V60Z')).toBe(true);
  });

  it('rounds only the bottom corners of a downward bar', () => {
    const d = barPath(10, 20, 30, 40, 4, 'bottom');

    expect(d.match(/A/g)).toHaveLength(2);
    expect(d.startsWith('M10,20H40V56')).toBe(true);
  });

  it('rounds the right corners of a bar growing right and the left ones of one growing left', () => {
    expect(barPath(10, 20, 40, 30, 4, 'right')).toContain('A4,4 0 0 1 50,24');
    expect(barPath(10, 20, 40, 30, 4, 'left')).toContain('A4,4 0 0 0 10,24');
  });

  it('cuts the radius to half the thickness and to the length', () => {
    expect(barPath(0, 0, 6, 100, 10, 'top')).toContain('A3,3');
    expect(barPath(0, 0, 100, 2, 10, 'top')).toContain('A2,2');
  });

  it('draws a bar of no size without a negative radius', () => {
    expect(barPath(0, 0, 0, 0, 4, 'top')).not.toContain('-');
  });
});

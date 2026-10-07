import { describe, expect, it } from 'vitest';

import {
  computeInsets,
  KUI_CHART_ELLIPSIS,
  selectTickIndices,
  truncateToWidth,
} from './chart-layout.util';

const evenBoxes = (count: number, width: number, span: number) =>
  Array.from({ length: count }, (_, index) => ({
    position: count === 1 ? 0 : (index / (count - 1)) * span,
    width,
  }));

describe('selectTickIndices', () => {
  it('keeps every label that fits', () => {
    expect(selectTickIndices(evenBoxes(5, 20, 400))).toEqual([0, 1, 2, 3, 4]);
  });

  it('thins labels by their measured width, not by a fixed estimate', () => {
    const narrow = selectTickIndices(evenBoxes(10, 20, 400));
    const wide = selectTickIndices(evenBoxes(10, 80, 400));

    expect(narrow).toHaveLength(10);
    expect(wide.length).toBeLessThan(narrow.length);
  });

  it('always keeps the first and the last label', () => {
    const indices = selectTickIndices(evenBoxes(120, 40, 300));

    expect(indices[0]).toBe(0);
    expect(indices.at(-1)).toBe(119);
    expect(indices.length).toBeGreaterThan(2);
  });

  it('leaves at least the gap between neighbouring labels', () => {
    const boxes = evenBoxes(60, 30, 480);
    const indices = selectTickIndices(boxes, 8);

    indices.slice(1).forEach((index, position) => {
      const previous = indices[position];
      const previousAnchor = position === 0 ? 'start' : 'middle';
      const anchor = position === indices.length - 2 ? 'end' : 'middle';
      const previousEnd =
        previousAnchor === 'start'
          ? boxes[previous].position + boxes[previous].width
          : boxes[previous].position + boxes[previous].width / 2;
      const start =
        anchor === 'end'
          ? boxes[index].position - boxes[index].width
          : boxes[index].position - boxes[index].width / 2;

      expect(start - previousEnd).toBeGreaterThanOrEqual(8 - 1e-9);
    });
  });

  it('drops the tick before the last one when the stride lands too close to it', () => {
    // 11 labels, stride 3 lands on 0, 3, 6, 9 and the forced last tick 10 sits next to 9.
    const indices = selectTickIndices(evenBoxes(11, 70, 400));

    expect(indices.at(-1)).toBe(10);
    expect(indices).not.toContain(9);
  });

  it('handles zero, one and two labels', () => {
    expect(selectTickIndices([])).toEqual([]);
    expect(selectTickIndices([{ position: 0, width: 10 }])).toEqual([0]);
    expect(selectTickIndices(evenBoxes(2, 500, 100))).toEqual([0, 1]);
  });
});

describe('computeInsets', () => {
  it('fits the widest left label and one line of bottom labels', () => {
    const insets = computeInsets({
      fontSize: 13,
      leftLabelWidth: 40,
      bottomLabels: true,
      leftTitle: false,
      bottomTitle: false,
    });

    expect(insets.left).toBeGreaterThan(40);
    expect(insets.bottom).toBeGreaterThan(13);
    expect(insets.top).toBe(8);
    expect(insets.right).toBe(8);
  });

  it('adds room for axis titles', () => {
    const plain = computeInsets({
      fontSize: 13,
      leftLabelWidth: 30,
      bottomLabels: true,
      leftTitle: false,
      bottomTitle: false,
    });
    const titled = computeInsets({
      fontSize: 13,
      leftLabelWidth: 30,
      bottomLabels: true,
      leftTitle: true,
      bottomTitle: true,
    });

    expect(titled.left).toBeGreaterThan(plain.left);
    expect(titled.bottom).toBeGreaterThan(plain.bottom);
  });

  it('keeps a small margin when an axis is hidden', () => {
    const insets = computeInsets({
      fontSize: 13,
      leftLabelWidth: 0,
      bottomLabels: false,
      leftTitle: false,
      bottomTitle: false,
    });

    expect(insets.left).toBe(8);
    expect(insets.bottom).toBe(8);
  });
});

describe('truncateToWidth', () => {
  const measure = (text: string) => text.length * 10;

  it('returns a label that fits unchanged', () => {
    expect(truncateToWidth('Pro', 100, measure)).toBe('Pro');
  });

  it('cuts a long label and ends it with an ellipsis that fits the width', () => {
    const cut = truncateToWidth('Business Enterprise', 100, measure);

    expect(cut.endsWith(KUI_CHART_ELLIPSIS)).toBe(true);
    expect(measure(cut)).toBeLessThanOrEqual(100);
    expect(cut.length).toBeGreaterThan(2);
  });

  it('shrinks to the ellipsis alone when nothing else fits, and leaves a zero width alone', () => {
    expect(truncateToWidth('Business', 12, measure)).toBe(KUI_CHART_ELLIPSIS);
    expect(truncateToWidth('Business', 0, measure)).toBe('Business');
  });
});

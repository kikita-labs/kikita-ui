/** A mark as keyboard navigation sees it. */
export interface KuiChartNavMark {
  /** Stable identity of the mark; the roving tab stop is kept by key, not by position. */
  readonly key: string;

  /** Index of the mark's series among the visible ones. */
  readonly series: number;

  /** Index of the mark's category. */
  readonly category: number;

  /** Position of the mark in the chart, in pixels. */
  readonly x: number;

  /** Position of the mark in the chart, in pixels. */
  readonly y: number;
}

/**
 * How the arrow keys move through the marks:
 *
 * - `sequence`: one list in reading order. Right and Down go to the next mark, Left and Up to the
 *   previous one (grouped bars, scatter points, donut slices).
 * - `columns`: categories run left to right. Left and Right move to the previous or next category of
 *   the same series, Up and Down move between the marks of the same category by their height (line
 *   and area charts, stacked vertical bars).
 * - `rows`: categories run top to bottom. Up and Down move along the categories, Left and Right
 *   between the marks of the same category by their position (stacked horizontal bars).
 */
export type KuiChartNavigationModel = 'sequence' | 'columns' | 'rows';

const SEQUENCE_STEP: Readonly<Record<string, 1 | -1>> = {
  ArrowRight: 1,
  ArrowDown: 1,
  ArrowLeft: -1,
  ArrowUp: -1,
};

function inSeries(marks: readonly KuiChartNavMark[], series: number): KuiChartNavMark[] {
  return marks.filter((mark) => mark.series === series).sort((a, b) => a.category - b.category);
}

function inCategory(
  marks: readonly KuiChartNavMark[],
  category: number,
  axis: 'x' | 'y',
): KuiChartNavMark[] {
  return marks.filter((mark) => mark.category === category).sort((a, b) => a[axis] - b[axis]);
}

/**
 * The key of the mark a `keydown` moves to, `currentKey` when the key is handled but the mark is at an
 * edge (so the caller still prevents the page from scrolling), or `null` when the key is not a
 * navigation key. `currentKey` that no longer names a mark moves to the first one.
 */
export function computeNavigationTarget(
  model: KuiChartNavigationModel,
  key: string,
  currentKey: string | null,
  marks: readonly KuiChartNavMark[],
): string | null {
  const handled = key in SEQUENCE_STEP || key === 'Home' || key === 'End';
  if (!handled || marks.length === 0) return null;

  const current = marks.find((mark) => mark.key === currentKey);
  if (!current) return marks[0].key;

  if (model === 'sequence') {
    const index = marks.indexOf(current);
    if (key === 'Home') return marks[0].key;
    if (key === 'End') return marks[marks.length - 1].key;

    return marks[Math.min(Math.max(index + SEQUENCE_STEP[key], 0), marks.length - 1)].key;
  }

  const alongCategories =
    model === 'columns' ? ['ArrowLeft', 'ArrowRight'] : ['ArrowUp', 'ArrowDown'];
  const betweenMarks = model === 'columns' ? ['ArrowUp', 'ArrowDown'] : ['ArrowLeft', 'ArrowRight'];

  if (key === 'Home' || key === 'End' || alongCategories.includes(key)) {
    const line = inSeries(marks, current.series);
    const index = line.indexOf(current);
    if (key === 'Home') return line[0].key;
    if (key === 'End') return line[line.length - 1].key;

    const step = key === alongCategories[1] ? 1 : -1;

    return line[Math.min(Math.max(index + step, 0), line.length - 1)].key;
  }

  // Between the marks of one category, ordered by where they are drawn: Up and Left go towards the
  // smaller coordinate, Down and Right towards the larger one.
  const column = inCategory(marks, current.category, model === 'columns' ? 'y' : 'x');
  const index = column.indexOf(current);
  const step = key === betweenMarks[1] ? 1 : -1;

  return column[Math.min(Math.max(index + step, 0), column.length - 1)].key;
}

/**
 * The key of the mark that holds the roving tab stop. The mark the user chose keeps it while it still
 * exists. When it is gone (its series was hidden, the data changed) the tab stop moves to the nearest
 * remaining mark: the same category in the closest series, else the closest category, else the first
 * mark. A chart with marks always has exactly one tab stop; `null` only when there are no marks.
 */
export function resolveRovingKey(
  marks: readonly KuiChartNavMark[],
  requestedKey: string | null,
  lastPosition: { readonly series: number; readonly category: number } | null,
): string | null {
  if (marks.length === 0) return null;
  if (requestedKey !== null && marks.some((mark) => mark.key === requestedKey)) return requestedKey;
  if (!lastPosition) return marks[0].key;

  let best = marks[0];
  let bestScore = Number.POSITIVE_INFINITY;

  for (const mark of marks) {
    // The category counts more than the series: the tab stop stays in the same place along the axis.
    const score =
      Math.abs(mark.category - lastPosition.category) * 1000 +
      Math.abs(mark.series - lastPosition.series);

    if (score < bestScore) {
      best = mark;
      bestScore = score;
    }
  }

  return best.key;
}

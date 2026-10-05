/** One axis tick label as the layout sees it: where it is centred and how wide it is, in pixels. */
export interface KuiChartTickBox {
  /** Centre of the label along the axis. */
  readonly position: number;

  /** Rendered width of the label. */
  readonly width: number;
}

/** Where a tick label sits relative to its position: edge labels anchor inward. */
export type KuiChartTickAnchor = 'start' | 'middle' | 'end';

/** Smallest empty space between two tick labels, in pixels. */
export const KUI_CHART_TICK_GAP = 8;

function extent(box: KuiChartTickBox, anchor: KuiChartTickAnchor): readonly [number, number] {
  if (anchor === 'start') return [box.position, box.position + box.width];
  if (anchor === 'end') return [box.position - box.width, box.position];
  return [box.position - box.width / 2, box.position + box.width / 2];
}

function fits(
  boxes: readonly KuiChartTickBox[],
  indices: readonly number[],
  gap: number,
  anchorEdges: boolean,
): boolean {
  for (let step = 1; step < indices.length; step++) {
    const previousAnchor: KuiChartTickAnchor = anchorEdges && step === 1 ? 'start' : 'middle';
    const currentAnchor: KuiChartTickAnchor =
      anchorEdges && step === indices.length - 1 ? 'end' : 'middle';
    const [, previousEnd] = extent(boxes[indices[step - 1]], previousAnchor);
    const [currentStart] = extent(boxes[indices[step]], currentAnchor);

    if (currentStart - previousEnd < gap) return false;
  }

  return true;
}

/**
 * Picks the tick labels to draw so that none overlaps its neighbour. It tries every stride from 1
 * up and takes the first one whose labels, measured, keep `gap` pixels between them; the first label
 * anchors to its start and the last to its end, as the renderer draws them. The last tick is always
 * kept, so the axis never silently drops its final value; when the stride does not land on it the
 * tick before it is dropped if the two would touch. Returns indices into `boxes`, ascending.
 * `anchorEdges` is `false` for a vertical axis, where every label is centred on its position.
 */
export function selectTickIndices(
  boxes: readonly KuiChartTickBox[],
  gap = KUI_CHART_TICK_GAP,
  anchorEdges = true,
): readonly number[] {
  const count = boxes.length;
  if (count === 0) return [];
  if (count === 1) return [0];

  for (let stride = 1; stride < count; stride++) {
    const indices: number[] = [];
    for (let index = 0; index < count; index += stride) indices.push(index);
    if (indices.at(-1) !== count - 1) indices.push(count - 1);

    if (fits(boxes, indices, gap, anchorEdges)) return indices;

    // The forced last tick may sit too close to the one before it: drop that one instead.
    if (indices.length > 2) {
      const trimmed = indices.filter((_, position) => position !== indices.length - 2);
      if (fits(boxes, trimmed, gap, anchorEdges)) return trimmed;
    }
  }

  return [0, count - 1].filter((value, position, all) => all.indexOf(value) === position);
}

/** Space reserved around the plot area, in pixels. */
export interface KuiChartInsets {
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
  readonly left: number;
}

/** What {@link computeInsets} needs to know about the axes. */
export interface KuiChartInsetOptions {
  /** Font size of the axis text, in pixels. */
  readonly fontSize: number;

  /** Widest label of the axis drawn on the left, or `0` when that axis is hidden. */
  readonly leftLabelWidth: number;

  /** Whether the axis drawn at the bottom shows labels. */
  readonly bottomLabels: boolean;

  /** Whether a title is drawn beside the left axis. */
  readonly leftTitle: boolean;

  /** Whether a title is drawn under the bottom axis. */
  readonly bottomTitle: boolean;

  /** Extra space above the plot, for example half a mark that sits on the top edge. */
  readonly top?: number;

  /** Extra space right of the plot, for example half a mark that sits on the right edge. */
  readonly right?: number;
}

const AXIS_LABEL_GAP = 6;
const OUTER_PADDING = 8;

/**
 * Space around the plot area derived from what the axes actually draw: the left inset fits the widest
 * measured label (plus a title), the bottom inset fits one line of labels (plus a title). A fixed
 * guess would clip a long label and waste room around a short one.
 */
export function computeInsets(options: KuiChartInsetOptions): KuiChartInsets {
  const { fontSize } = options;
  const lineHeight = Math.ceil(fontSize * 1.25);
  const left =
    (options.leftLabelWidth > 0 ? options.leftLabelWidth + AXIS_LABEL_GAP : OUTER_PADDING) +
    (options.leftTitle ? lineHeight + AXIS_LABEL_GAP : 0);
  const bottom =
    (options.bottomLabels ? lineHeight + AXIS_LABEL_GAP : OUTER_PADDING) +
    (options.bottomTitle ? lineHeight + AXIS_LABEL_GAP : 0);

  return {
    top: OUTER_PADDING + (options.top ?? 0),
    right: OUTER_PADDING + (options.right ?? 0),
    bottom,
    left: Math.max(left, OUTER_PADDING),
  };
}

/** The ellipsis appended to a cut label. */
export const KUI_CHART_ELLIPSIS = '…';

/**
 * Cuts `label` so that it is at most `maxWidth` wide when measured with `measure`, ending in an
 * ellipsis when something was removed. A label that already fits is returned unchanged.
 */
export function truncateToWidth(
  label: string,
  maxWidth: number,
  measure: (text: string) => number,
): string {
  if (maxWidth <= 0 || measure(label) <= maxWidth) return label;

  let low = 0;
  let high = label.length;

  while (low < high) {
    const middle = Math.ceil((low + high) / 2);

    if (measure(label.slice(0, middle).trimEnd() + KUI_CHART_ELLIPSIS) <= maxWidth) low = middle;
    else high = middle - 1;
  }

  return low === 0 ? KUI_CHART_ELLIPSIS : label.slice(0, low).trimEnd() + KUI_CHART_ELLIPSIS;
}

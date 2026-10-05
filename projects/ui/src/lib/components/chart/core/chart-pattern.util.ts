/** Edge length, in user units, of the square tile every hatch pattern repeats. */
export const KUI_CHART_PATTERN_TILE = 8;

/** Number of different hatch patterns; a series past the eighth repeats the first ones. */
export const KUI_CHART_PATTERN_COUNT = 8;

/** One hatch: the path drawn in the tile, and whether it is a filled shape (dots) or a stroked line. */
export interface KuiChartPatternShape {
  readonly d: string;
  readonly filled: boolean;
}

/** A dot of radius 1.2 centred on `(cx, cy)`, as a closed path. */
function dot(cx: number, cy: number): string {
  return `M${cx - 1.2},${cy} a1.2,1.2 0 1 0 2.4,0 a1.2,1.2 0 1 0 -2.4,0 Z`;
}

const DIAGONAL_UP = 'M-1,1 L1,-1 M0,8 L8,0 M7,9 L9,7';
const DIAGONAL_DOWN = 'M-1,7 L1,9 M0,0 L8,8 M7,-1 L9,1';

const SHAPES: readonly KuiChartPatternShape[] = [
  { d: DIAGONAL_UP, filled: false },
  { d: DIAGONAL_DOWN, filled: false },
  { d: 'M0,4 H8', filled: false },
  { d: 'M4,0 V8', filled: false },
  { d: `${dot(2, 2)} ${dot(6, 6)}`, filled: true },
  { d: `${DIAGONAL_UP} ${DIAGONAL_DOWN}`, filled: false },
  { d: 'M0,4 H8 M4,0 V8', filled: false },
  { d: 'M0,6 L4,2 L8,6', filled: false },
];

/** The hatch of the series or slice at `index`. */
export function patternShape(index: number): KuiChartPatternShape {
  return SHAPES[
    ((index % KUI_CHART_PATTERN_COUNT) + KUI_CHART_PATTERN_COUNT) % KUI_CHART_PATTERN_COUNT
  ];
}

/** The `id` of the `<pattern>` of the series or slice at `index` inside the chart `chartId`. */
export function patternId(chartId: string, index: number): string {
  return `${chartId}-pattern-${index}`;
}

/** The paint that fills a shape with the pattern of the series or slice at `index`. */
export function patternPaint(chartId: string, index: number): string {
  return `url(#${patternId(chartId, index)})`;
}

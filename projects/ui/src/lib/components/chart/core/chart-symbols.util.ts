import type { KuiChartMarkerShape } from '../chart.types';

/** The marker shapes of a multi-series line or scatter chart, in the order series use them. */
export const KUI_CHART_MARKER_SHAPES: readonly KuiChartMarkerShape[] = [
  'circle',
  'square',
  'diamond',
  'triangle',
  'triangle-down',
  'plus',
  'cross',
  'star',
];

/** The shape of the series at `index`: circles for a single series, the cycle of shapes otherwise. */
export function markerShapeForSeries(index: number, distinct: boolean): KuiChartMarkerShape {
  return distinct ? KUI_CHART_MARKER_SHAPES[index % KUI_CHART_MARKER_SHAPES.length] : 'circle';
}

type Pair = readonly [number, number];

function format(value: number): string {
  return String(Math.round(value * 100) / 100);
}

function polygon(points: readonly Pair[]): string {
  return `M${points.map(([x, y]) => `${format(x)},${format(y)}`).join(' L')} Z`;
}

function rotate(points: readonly Pair[], degrees: number): readonly Pair[] {
  const radians = (degrees * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);

  return points.map(([x, y]) => [x * cos - y * sin, x * sin + y * cos] as const);
}

function plus(r: number): readonly Pair[] {
  const t = 0.45 * r;
  const l = 1.4 * r;

  return [
    [-t, -l],
    [t, -l],
    [t, -t],
    [l, -t],
    [l, t],
    [t, t],
    [t, l],
    [-t, l],
    [-t, t],
    [-l, t],
    [-l, -t],
    [-t, -t],
  ];
}

function star(r: number): readonly Pair[] {
  const outer = 1.45 * r;
  const inner = 0.62 * r;

  return Array.from({ length: 10 }, (_, index) => {
    const radius = index % 2 === 0 ? outer : inner;
    const angle = (index * Math.PI) / 5 - Math.PI / 2;

    return [radius * Math.cos(angle), radius * Math.sin(angle)] as const;
  });
}

/**
 * The outline of a marker centred on `0,0`, as SVG path data. `r` is the radius of the circle; the
 * other shapes are sized to cover about the same area, so the marks of different series read as equally
 * heavy.
 */
export function markerPath(shape: KuiChartMarkerShape, r: number): string {
  switch (shape) {
    case 'square': {
      const h = 0.88 * r;
      return polygon([
        [-h, -h],
        [h, -h],
        [h, h],
        [-h, h],
      ]);
    }
    case 'diamond': {
      const d = 1.3 * r;
      return polygon([
        [0, -d],
        [d, 0],
        [0, d],
        [-d, 0],
      ]);
    }
    case 'triangle':
      return polygon([
        [0, -1.3 * r],
        [1.2 * r, 0.9 * r],
        [-1.2 * r, 0.9 * r],
      ]);
    case 'triangle-down':
      return polygon([
        [0, 1.3 * r],
        [-1.2 * r, -0.9 * r],
        [1.2 * r, -0.9 * r],
      ]);
    case 'plus':
      return polygon(plus(r));
    case 'cross':
      return polygon(rotate(plus(r), 45));
    case 'star':
      return polygon(star(r));
    default:
      return `M${format(-r)},0 A${format(r)},${format(r)} 0 1 0 ${format(r)},0 A${format(r)},${format(r)} 0 1 0 ${format(-r)},0 Z`;
  }
}

/** Dash pattern of the line of the series at `index`, for forced colours; the first is solid. */
export const KUI_CHART_LINE_DASHES = [
  'none',
  '8 4',
  '2 3',
  '10 4 2 4',
  '4 4',
  '14 3',
  '1 4',
  '6 2 1 2',
] as const;

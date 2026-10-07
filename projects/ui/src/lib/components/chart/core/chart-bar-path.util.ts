/** The end of a bar that is rounded: the one away from the axis it stands on. */
export type KuiChartBarEnd = 'top' | 'bottom' | 'left' | 'right';

function format(value: number): string {
  return String(Math.round(value * 100) / 100);
}

/**
 * The outline of a bar whose end away from its axis is rounded with radius `radius` and whose other
 * end is square, or a plain rectangle when `end` is `null`. An SVG `<rect>` can only round all four
 * corners with one `rx`, so a bar with one rounded end is a path (what d3-shape and Recharts draw too).
 * The radius is cut to what fits: half the bar's thickness, and the bar's own length.
 */
export function barPath(
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  end: KuiChartBarEnd | null,
): string {
  const r = (limit: number): number => Math.max(0, Math.min(radius, limit));
  const right = x + width;
  const bottom = y + height;

  switch (end) {
    case 'top': {
      const k = r(Math.min(width / 2, height));
      return `M${format(x)},${format(bottom)}V${format(y + k)}A${format(k)},${format(k)} 0 0 1 ${format(x + k)},${format(y)}H${format(right - k)}A${format(k)},${format(k)} 0 0 1 ${format(right)},${format(y + k)}V${format(bottom)}Z`;
    }
    case 'bottom': {
      const k = r(Math.min(width / 2, height));
      return `M${format(x)},${format(y)}H${format(right)}V${format(bottom - k)}A${format(k)},${format(k)} 0 0 1 ${format(right - k)},${format(bottom)}H${format(x + k)}A${format(k)},${format(k)} 0 0 1 ${format(x)},${format(bottom - k)}Z`;
    }
    case 'right': {
      const k = r(Math.min(height / 2, width));
      return `M${format(x)},${format(y)}H${format(right - k)}A${format(k)},${format(k)} 0 0 1 ${format(right)},${format(y + k)}V${format(bottom - k)}A${format(k)},${format(k)} 0 0 1 ${format(right - k)},${format(bottom)}H${format(x)}Z`;
    }
    case 'left': {
      const k = r(Math.min(height / 2, width));
      return `M${format(right)},${format(y)}H${format(x + k)}A${format(k)},${format(k)} 0 0 0 ${format(x)},${format(y + k)}V${format(bottom - k)}A${format(k)},${format(k)} 0 0 0 ${format(x + k)},${format(bottom)}H${format(right)}Z`;
    }
    default:
      return `M${format(x)},${format(y)}H${format(right)}V${format(bottom)}H${format(x)}Z`;
  }
}

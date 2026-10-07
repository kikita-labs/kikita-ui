/** A point in the chart's own coordinate space (pixels from the top-left corner of the SVG). */
export interface KuiChartPlotPoint {
  readonly x: number;
  readonly y: number;
}

/** An axis-aligned rectangle in the same space. */
export interface KuiChartPlotRect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/**
 * The index of the point nearest to `(x, y)` within `maxDistance`, or `-1` when none is that close.
 * Ties go to the earlier point. A linear scan: a chart draws its points as DOM, so there are never
 * so many that a spatial index would pay for itself.
 */
export function nearestPointIndex(
  points: readonly KuiChartPlotPoint[],
  x: number,
  y: number,
  maxDistance: number,
): number {
  const limit = maxDistance * maxDistance;
  let best = -1;
  let bestDistance = limit;

  for (let index = 0; index < points.length; index++) {
    const dx = points[index].x - x;
    const dy = points[index].y - y;
    const distance = dx * dx + dy * dy;

    if (distance <= limit && (best === -1 || distance < bestDistance)) {
      best = index;
      bestDistance = distance;
    }
  }

  return best;
}

/** Distance from `(x, y)` to a rectangle: `0` inside it. */
export function distanceToRect(rect: KuiChartPlotRect, x: number, y: number): number {
  const dx = Math.max(rect.x - x, 0, x - (rect.x + rect.width));
  const dy = Math.max(rect.y - y, 0, y - (rect.y + rect.height));

  return Math.hypot(dx, dy);
}

/** The index of the rectangle nearest to `(x, y)` within `maxDistance`, or `-1`. Ties go to the earlier one. */
export function nearestRectIndex(
  rects: readonly KuiChartPlotRect[],
  x: number,
  y: number,
  maxDistance: number,
): number {
  let best = -1;
  let bestDistance = maxDistance;

  for (let index = 0; index < rects.length; index++) {
    const distance = distanceToRect(rects[index], x, y);

    if (distance < bestDistance || (best === -1 && distance <= maxDistance)) {
      best = index;
      bestDistance = distance;
    }
  }

  return best;
}

/** A point in the coordinate space of an SVG (pixels from its top-left corner at scale 1). */
export interface KuiChartPlotPointer {
  readonly x: number;
  readonly y: number;
}

/**
 * Converts a pointer event to the coordinate space of `svg`. It uses the element's own transform, so
 * it is right whether the chart is drawn at scale 1 (after measuring) or scaled to fit (the server
 * markup before the first measurement), and falls back to the bounding box where there is no layout.
 */
export function toPlotPointer(svg: SVGSVGElement, event: PointerEvent): KuiChartPlotPointer {
  const ctm = typeof svg.getScreenCTM === 'function' ? svg.getScreenCTM() : null;

  if (ctm && typeof DOMPoint !== 'undefined') {
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(ctm.inverse());

    return { x: point.x, y: point.y };
  }

  const rect = svg.getBoundingClientRect();

  return { x: event.clientX - rect.left, y: event.clientY - rect.top };
}

/** Beyond this many marks a line chart draws only the mark that holds the tab stop as DOM. */
export const KUI_CHART_MARK_LIMIT = 500;

/**
 * Keeps focus where a pointer press just put it. A press on the plot focuses the nearest mark from
 * `pointerdown`, but the browser then moves focus to the (unfocusable) plot when `mousedown` runs its
 * default action; cancelling that one `mousedown` leaves focus on the mark.
 */
export function keepFocusOnPress(event: PointerEvent): void {
  event.target?.addEventListener('mousedown', (mouseDown) => mouseDown.preventDefault(), {
    once: true,
  });
}

/** How far past the plot the pointer area reaches, so marks on the plot edge can be aimed at whole, in pixels. */
export const KUI_CHART_PLOT_HIT_REACH = 12;

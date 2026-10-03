/**
 * Computes the next roving-tabindex index for a `keydown` on a chart's marks group: arrows move
 * by one, Home/End jump to the first/last mark. Returns `null` for an unhandled key (caller
 * should not call `preventDefault()` or update focus in that case) or when there are no marks.
 * Shared by every chart type's marks group -- the navigation model (one flat, ordered list of
 * marks) is the same regardless of what a "mark" represents (point, bar, segment).
 */
export function computeRovingIndex(key: string, current: number, markCount: number): number | null {
  if (markCount === 0) return null;
  switch (key) {
    case 'ArrowRight':
    case 'ArrowUp':
      return Math.min(current + 1, markCount - 1);
    case 'ArrowLeft':
    case 'ArrowDown':
      return Math.max(current - 1, 0);
    case 'Home':
      return 0;
    case 'End':
      return markCount - 1;
    default:
      return null;
  }
}

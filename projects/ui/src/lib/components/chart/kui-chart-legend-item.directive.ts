import { Directive, inject, TemplateRef } from '@angular/core';

import type { KuiChartLegendItem } from './chart.types';

/** Template context for `[kuiChartLegendItem]` -- `$implicit` is the legend entry itself,
 * `hovered` is whether it's the currently cross-highlighted item (from a hovered mark/slice on
 * the chart, or another legend item's own hover). */
export interface KuiChartLegendItemContext {
  readonly $implicit: KuiChartLegendItem;
  readonly hovered: boolean;
}

/**
 * Marks an `<ng-template>` inside `kui-chart-legend` as its custom per-item render template,
 * replacing the component's own default `<button>` markup entirely -- for consumers who need
 * different DOM (icons, extra metadata, a non-button element) than `kui-chart-legend`'s built-in
 * item can provide. The template receives a {@link KuiChartLegendItemContext}; call the
 * `KuiChartLegendSource` passed to `kui-chart-legend`'s own `toggleLegendItem`/
 * `setHoveredLegendId` directly from the template (it's already in scope) to wire up interactions
 * -- this directive only supplies the per-item data, not a second set of callbacks for the same
 * thing.
 *
 * ```html
 * <kui-chart-legend [chart]="chartRef">
 *   <ng-template kuiChartLegendItem let-item let-hovered="hovered">
 *     <button
 *       type="button"
 *       [class.active]="hovered"
 *       (click)="chartRef.toggleLegendItem(item.id)"
 *       (pointerenter)="chartRef.setHoveredLegendId(item.id)"
 *       (pointerleave)="chartRef.setHoveredLegendId(null)"
 *     >
 *       {{ item.label }}
 *     </button>
 *   </ng-template>
 * </kui-chart-legend>
 * ```
 */
@Directive({ selector: 'ng-template[kuiChartLegendItem]' })
export class KuiChartLegendItemDirective {
  /** @internal read by `kui-chart-legend` via `contentChild(KuiChartLegendItemDirective)`. */
  readonly templateRef = inject(TemplateRef<KuiChartLegendItemContext>);

  /** Lets templates type-check `let item = ...` against {@link KuiChartLegendItemContext}. */
  static ngTemplateContextGuard(
    _dir: KuiChartLegendItemDirective,
    _ctx: unknown,
  ): _ctx is KuiChartLegendItemContext {
    return true;
  }
}

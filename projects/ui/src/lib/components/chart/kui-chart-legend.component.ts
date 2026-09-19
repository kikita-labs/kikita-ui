import { NgTemplateOutlet } from '@angular/common';
import { Component, contentChild, input, TemplateRef, ViewEncapsulation } from '@angular/core';

import type { KuiChartLegendSource } from './chart.types';
import { KuiChartLegendItemDirective } from './kui-chart-legend-item.directive';

@Component({
  selector: 'kui-chart-legend',
  imports: [NgTemplateOutlet],
  templateUrl: './kui-chart-legend.component.html',
  host: { class: 'kui-chart-legend' },
  encapsulation: ViewEncapsulation.None,
})
/**
 * Standalone chart legend -- renders a `KuiChartLegendSource` chart's legend items anywhere in
 * the DOM, independent of that chart's own inline `legend` slot. Pass the chart itself through a
 * template reference variable:
 *
 * ```html
 * <kui-line-chart #chartRef ariaLabel="..." [series]="series" [categories]="categories" [legend]="false" />
 * <kui-chart-legend [chart]="chartRef" />
 * ```
 *
 * `[legend]="false"` on the chart suppresses its own inline legend so the data isn't rendered
 * twice -- `kui-chart-legend` reads the exact same `legendItems`/`hoveredLegendId` signals and
 * calls the exact same `toggleLegendItem`/`setHoveredLegendId` methods the chart's own inline
 * legend does, so hide/show and hover cross-highlight state stay identical either way.
 *
 * Without a custom template, renders the same `<button>` markup (and `.kui-chart__legend*` CSS
 * classes) as the chart's own inline legend. Project a `kuiChartLegendItem`-marked `<ng-template>`
 * to fully replace that markup -- see `KuiChartLegendItemDirective` for the template context and
 * an example.
 */
export class KuiChartLegendComponent {
  /** The chart to read legend items/state from and dispatch toggle/hover calls to -- any
   * `kui-*-chart` component (they all implement `KuiChartLegendSource`), passed through a
   * template reference variable. */
  readonly chart = input.required<KuiChartLegendSource>();

  protected readonly itemTemplate = contentChild(KuiChartLegendItemDirective, {
    read: TemplateRef,
  });
}

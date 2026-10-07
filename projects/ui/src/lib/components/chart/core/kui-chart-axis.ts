import { Component, computed, input, ViewEncapsulation } from '@angular/core';

import type { KuiChartTickAnchor } from './chart-layout.util';
import type { KuiChartPlotRect } from './chart-nearest.util';

/** One label of a {@link KuiChartAxis}. */
export interface KuiChartAxisTick {
  /** Where the label is centred along the axis, in pixels. */
  readonly position: number;

  /** The text drawn, possibly cut with an ellipsis. */
  readonly label: string;

  /** The whole text; shown as the `<title>` of the label when `label` was cut. */
  readonly full: string;

  /** Which end of the label sits on `position`: edge labels anchor inward so they stay inside. */
  readonly anchor: KuiChartTickAnchor;
}

/**
 * @internal
 * One axis of a cartesian chart: its line, its labels, optional grid lines and an optional title,
 * drawn in the chart's own pixel space. The chart gives it positions and texts already laid out; it
 * only draws. It is hidden from assistive technology: every mark has its own name and the data table
 * has the values.
 */
@Component({
  selector: 'g[kuiChartAxis]',
  templateUrl: './kui-chart-axis.html',
  host: { 'aria-hidden': 'true' },
  encapsulation: ViewEncapsulation.None,
})
export class KuiChartAxis {
  /** `bottom` runs along the bottom of the plot, `left` along its left edge. */
  readonly orientation = input.required<'bottom' | 'left'>();

  /** The labels, in axis order. */
  readonly ticks = input.required<readonly KuiChartAxisTick[]>();

  /** The plot area the axis belongs to. */
  readonly plot = input.required<KuiChartPlotRect>();

  /** Draws a grid line across the plot at every label. */
  readonly grid = input(false);

  /** Title of the axis. */
  readonly title = input<string | undefined>(undefined);

  /** Font size of the axis text, in pixels. */
  readonly fontSize = input(13);

  protected readonly isBottom = computed(() => this.orientation() === 'bottom');
  protected readonly right = computed(() => this.plot().x + this.plot().width);
  protected readonly bottom = computed(() => this.plot().y + this.plot().height);

  /** Where the baseline of a bottom label sits: one line below the axis. */
  protected readonly labelBaseline = computed(() => this.bottom() + 6 + this.fontSize());

  /** Baseline of a bottom title, under the labels. */
  protected readonly bottomTitleY = computed(
    () => this.labelBaseline() + 6 + Math.ceil(this.fontSize() * 1.25) - 3,
  );

  /** The rotation that stands a left title on its side, centred on the plot. */
  protected readonly leftTitleTransform = computed(() => {
    const x = Math.ceil(this.fontSize() * 1.25) - 4;
    const y = this.plot().y + this.plot().height / 2;

    return `translate(${x} ${y}) rotate(-90)`;
  });
}

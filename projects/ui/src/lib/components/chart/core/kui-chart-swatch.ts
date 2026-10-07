import { Component, computed, input, ViewEncapsulation } from '@angular/core';

import { kuiNextId } from '../../../utils/kui-id.util';
import type { KuiChartMarkerShape } from '../chart.types';
import { patternId, patternPaint } from './chart-pattern.util';
import { markerPath } from './chart-symbols.util';
import { KuiChartPatterns } from './kui-chart-patterns';

/**
 * @internal
 * The small key mark of a legend entry. It is a circle in the series colour, or the marker shape the
 * series uses on the chart when the chart tells series apart by shape too, so the legend matches what
 * it explains. A hidden entry is drawn as an outline.
 */
@Component({
  selector: 'svg[kuiChartSwatch]',
  templateUrl: './kui-chart-swatch.html',
  host: {
    class: 'kui-chart__legend-swatch',
    viewBox: '-7 -7 14 14',
    'aria-hidden': 'true',
    focusable: 'false',
    '[style.--_kui-chart-swatch]': 'color()',
  },
  imports: [KuiChartPatterns],
  encapsulation: ViewEncapsulation.None,
})
export class KuiChartSwatch {
  /** The series colour. */
  readonly color = input<string | undefined>(undefined);

  /** The marker shape of the series. */
  readonly shape = input<KuiChartMarkerShape>('circle');

  /** Index of the hatch pattern of the series; the swatch is a patterned square when it is set. */
  readonly pattern = input<number | undefined>(undefined);

  private readonly swatchId = kuiNextId('kui-chart-swatch');

  protected readonly path = computed(() => markerPath(this.shape(), 4.5));

  protected readonly definitions = computed(() => {
    const index = this.pattern() ?? 0;

    return [{ id: patternId(this.swatchId, index), index, color: this.color() }];
  });

  protected readonly paint = computed(() => patternPaint(this.swatchId, this.pattern() ?? 0));
}

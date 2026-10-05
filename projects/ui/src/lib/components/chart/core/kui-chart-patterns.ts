import { Component, computed, input, ViewEncapsulation } from '@angular/core';

import { KUI_CHART_PATTERN_TILE, patternShape } from './chart-pattern.util';

/** One `<pattern>` to define: its id, the index of the hatch, and the series or slice colour. */
export interface KuiChartPatternDefinition {
  readonly id: string;
  readonly index: number;
  readonly color?: string;
}

/**
 * @internal
 * The `<pattern>` elements a chart fills its series with. A pattern is a tinted background with a
 * hatch in the full series colour, so the series stays recognisable by colour and also by texture.
 * In forced colours the same patterns are drawn in system colours.
 */
@Component({
  selector: 'defs[kuiChartPatterns]',
  templateUrl: './kui-chart-patterns.html',
  encapsulation: ViewEncapsulation.None,
})
export class KuiChartPatterns {
  /** The patterns to define. */
  readonly patterns = input.required<readonly KuiChartPatternDefinition[]>();

  protected readonly tile = KUI_CHART_PATTERN_TILE;

  protected readonly entries = computed(() =>
    this.patterns().map((pattern) => ({ ...pattern, shape: patternShape(pattern.index) })),
  );
}

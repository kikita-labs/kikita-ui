import { Component, input, ViewEncapsulation } from '@angular/core';

import { KuiTooltipPlacement } from './kui-tooltip-placement.type';

/** @internal CDK overlay surface used by Kikita tooltip producers. */
@Component({
  selector: 'kui-tooltip-surface',
  template: '{{ text() }}',
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'kui-tooltip kui-tooltip--overlay',
    role: 'tooltip',
    '[attr.id]': 'tooltipId()',
    '[attr.data-kui-placement]': 'placement()',
  },
})
export class KuiTooltipSurfaceComponent {
  /** Tooltip element id used by `aria-describedby`. */
  readonly tooltipId = input<string | null>(null);

  /** Tooltip text content. */
  readonly text = input('');

  /** Preferred tooltip placement. */
  readonly placement = input<KuiTooltipPlacement>('top');
}

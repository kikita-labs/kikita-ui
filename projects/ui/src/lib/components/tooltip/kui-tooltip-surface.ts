import { booleanAttribute, Component, input, ViewEncapsulation } from '@angular/core';

import type { KuiTooltipPlacement } from './kui-tooltip-placement.type';

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
    '[class.kui-tooltip--touch]': 'touchEnabled()',
    '[class.kui-tooltip--hoverable]': 'hoverable()',
  },
})
export class KuiTooltipSurface {
  /** Tooltip element id used by `aria-describedby`. */
  readonly tooltipId = input<string | null>(null);

  /** Tooltip text content. */
  readonly text = input('');

  /** Preferred tooltip placement. */
  readonly placement = input<KuiTooltipPlacement>('top');

  /** @internal Allows an explicitly touch-enabled tooltip to render at mobile widths. */
  readonly touchEnabled = input(false, { transform: booleanAttribute });

  /** @internal Lets the pointer rest on the tooltip, as WCAG 1.4.13 asks for hover content. */
  readonly hoverable = input(false, { transform: booleanAttribute });
}

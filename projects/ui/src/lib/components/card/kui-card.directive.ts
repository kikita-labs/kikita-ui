import { Directive, booleanAttribute, input } from '@angular/core';

import { KuiCardAppearance } from './kui-card-appearance.type';

/** Applies Kikita UI card surface styling to semantic container elements. */
@Directive({
  selector: '[kuiCard]',
  host: {
    class: 'kui-card',
    '[attr.data-kui-appearance]': 'appearance()',
    '[attr.data-kui-interactive]': 'interactive() ? "" : null',
  },
})
export class KuiCardDirective {
  /** Visual surface treatment. */
  readonly appearance = input<KuiCardAppearance>('surface');

  /** Enables hover and focus-visible affordances for clickable cards. */
  readonly interactive = input(false, { transform: booleanAttribute });
}

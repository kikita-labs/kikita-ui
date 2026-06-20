import { Directive, input } from '@angular/core';

import { KuiSize } from '../../types';
import { KuiBadgeAppearance } from './kui-badge-appearance.type';

/** Applies Kikita UI badge styling to inline status or metadata elements. */
@Directive({
  selector: '[kuiBadge]',
  host: {
    class: 'kui-badge',
    '[attr.data-kui-appearance]': 'appearance()',
    '[attr.data-kui-size]': 'size()',
  },
})
export class KuiBadgeDirective {
  /** Visual badge treatment mapped to Kikita UI status tokens. */
  readonly appearance = input<KuiBadgeAppearance>('neutral');

  /** Badge size mapped to Kikita UI text and spacing tokens. */
  readonly size = input<KuiSize>('md');
}

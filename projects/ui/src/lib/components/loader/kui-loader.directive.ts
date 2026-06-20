import { Directive, input } from '@angular/core';

import { KuiSize } from '../../types';

/** Applies Kikita UI loading indicator styling to an inline element. */
@Directive({
  selector: '[kuiLoader]',
  host: {
    class: 'kui-loader',
    role: 'status',
    'aria-live': 'polite',
    '[attr.data-kui-size]': 'size()',
    '[attr.aria-label]': 'label()',
  },
})
export class KuiLoaderDirective {
  /** Loader size mapped to Kikita UI loader tokens. */
  readonly size = input<KuiSize>('md');

  /** Accessible label for the loading indicator. */
  readonly label = input('Loading');
}

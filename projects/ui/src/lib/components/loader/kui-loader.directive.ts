import { Directive, computed, input } from '@angular/core';

import { KuiSize } from '../../types';
import { injectKuiRootSizeDefault } from '../../utils/kui-defaults.util';

/** Applies Kikita UI loading indicator styling to an inline element. */
@Directive({
  selector: '[kuiLoader]',
  host: {
    class: 'kui-loader',
    role: 'status',
    'aria-live': 'polite',
    '[attr.data-kui-size]': 'effectiveSize()',
    '[attr.aria-label]': 'label()',
  },
})
export class KuiLoaderDirective {
  /** Loader size mapped to Kikita UI loader tokens. */
  readonly size = input<KuiSize | undefined>();

  /** Accessible label for the loading indicator. */
  readonly label = input('Loading');

  private readonly rootDefaultSize = injectKuiRootSizeDefault();

  protected readonly effectiveSize = computed(() => this.size() ?? this.rootDefaultSize ?? 'md');
}

import { computed, Directive, inject, input } from '@angular/core';

import { KuiDefaults } from '../../providers/kui-defaults.service';
import type { KuiSize } from '../../types';
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
  /** Loader size. Defaults to `defaults.loader.size`, then the global `defaults.size`, then md. */
  readonly size = input<KuiSize | undefined>();

  /** Accessible label for the loading indicator. */
  readonly label = input('Loading');

  private readonly loaderDefaults = inject(KuiDefaults).get('loader');
  private readonly rootDefaultSize = injectKuiRootSizeDefault();

  protected readonly effectiveSize = computed(
    () => this.size() ?? this.loaderDefaults()?.size ?? this.rootDefaultSize() ?? 'md',
  );
}

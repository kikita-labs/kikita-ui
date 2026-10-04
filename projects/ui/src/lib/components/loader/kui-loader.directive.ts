import { computed, Directive, inject, input } from '@angular/core';

import { injectKuiMessages } from '../../i18n/inject-kui-messages';
import { KuiDefaults } from '../../providers/kui-defaults.service';
import { injectKuiRootSizeDefault } from '../../providers/kui-defaults.util';
import type { KuiSize } from '../../types';

/** Applies Kikita UI loading indicator styling to an inline element. */
@Directive({
  selector: '[kuiLoader]',
  host: {
    class: 'kui-loader',
    role: 'status',
    'aria-live': 'polite',
    '[attr.data-kui-size]': 'effectiveSize()',
    '[attr.aria-label]': 'effectiveLabel()',
  },
})
export class KuiLoader {
  /** Loader size. Defaults to `defaults.loader.size`, then the global `defaults.size`, then md. */
  readonly size = input<KuiSize | undefined>();

  /** Accessible label for the loading indicator. Defaults to the `common.loading` message. */
  readonly label = input<string | undefined>();

  private readonly loaderDefaults = inject(KuiDefaults).get('loader');
  private readonly common = injectKuiMessages('common');

  protected readonly effectiveLabel = computed(() => this.label() ?? this.common().loading);
  private readonly rootDefaultSize = injectKuiRootSizeDefault();

  protected readonly effectiveSize = computed(
    () => this.size() ?? this.loaderDefaults()?.size ?? this.rootDefaultSize() ?? 'md',
  );
}

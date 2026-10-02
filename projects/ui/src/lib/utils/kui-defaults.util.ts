import type { Signal } from '@angular/core';
import { computed, inject } from '@angular/core';

import { KuiDefaults } from '../providers/kui-defaults.service';
import type { KuiSize } from '../types';

/**
 * Injects the global control size as a signal, limited to the sizes a primitive supports.
 *
 * The signal follows the nearest `KuiDefaults` level, so a nested `kuiProvideDefaults` or a runtime
 * change is reflected without recreating the component. It is `undefined` when no size is set or
 * when the configured size is not in `supportedSizes`.
 */
export function injectKuiRootSizeDefault<TSize extends string = KuiSize>(
  supportedSizes?: readonly TSize[],
): Signal<TSize | undefined> {
  const defaults = inject(KuiDefaults);

  return computed(() => {
    const size = defaults.effective().size as TSize | undefined;

    return size && (!supportedSizes || supportedSizes.includes(size)) ? size : undefined;
  });
}

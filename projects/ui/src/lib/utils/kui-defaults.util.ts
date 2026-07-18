import { inject } from '@angular/core';

import { KIKITA_UI_OPTIONS } from '../providers/kikita-ui-options.token';
import type { KuiSize } from '../types';

export function injectKuiRootSizeDefault<TSize extends string = KuiSize>(
  supportedSizes?: readonly TSize[],
): TSize | undefined {
  const size = inject(KIKITA_UI_OPTIONS, { optional: true })?.defaults?.size as TSize | undefined;

  return size && (!supportedSizes || supportedSizes.includes(size)) ? size : undefined;
}

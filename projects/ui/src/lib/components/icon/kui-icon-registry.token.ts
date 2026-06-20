import { InjectionToken } from '@angular/core';

import { KuiIconRegistry } from './kui-icon-source.type';

/** Multi-provider token containing registered Kikita UI icon sets. */
export const KUI_ICONS = new InjectionToken<readonly KuiIconRegistry[]>('KUI_ICONS');

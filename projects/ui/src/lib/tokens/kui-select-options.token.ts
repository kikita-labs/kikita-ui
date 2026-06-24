import { InjectionToken } from '@angular/core';

import type { KuiFieldOptions } from './kui-field-options.token';

export interface KuiSelectOptions extends KuiFieldOptions {
  emptyText?: string;
}

export const KUI_SELECT_OPTIONS = new InjectionToken<KuiSelectOptions>('KUI_SELECT_OPTIONS');

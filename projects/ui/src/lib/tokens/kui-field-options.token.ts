import { InjectionToken, Provider } from '@angular/core';

export interface KuiFieldOptions {
  clearable?: boolean;
}

export const KUI_FIELD_OPTIONS = new InjectionToken<KuiFieldOptions>('KUI_FIELD_OPTIONS');

export function kuiProvideFieldOptions(opts: KuiFieldOptions): Provider {
  return { provide: KUI_FIELD_OPTIONS, useValue: opts };
}

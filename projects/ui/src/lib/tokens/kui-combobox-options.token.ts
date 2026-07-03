import { InjectionToken, Provider } from '@angular/core';

/** Defaults specific to `input[kuiCombobox]` controls. */
export interface KuiComboboxOptions {
  /** When true, combobox controls show a clear button by default. */
  clearable?: boolean;
}

/** Injection token for `kui-combobox` defaults. Takes precedence over {@link KUI_FIELD_OPTIONS}. */
export const KUI_COMBOBOX_OPTIONS = new InjectionToken<KuiComboboxOptions>('KUI_COMBOBOX_OPTIONS');

/** Provides app-wide defaults for `input[kuiCombobox]` controls. */
export function kuiProvideComboboxOptions(opts: KuiComboboxOptions): Provider {
  return { provide: KUI_COMBOBOX_OPTIONS, useValue: opts };
}

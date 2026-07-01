import { InjectionToken, Provider } from '@angular/core';

/** Defaults specific to `kui-combobox` controls. */
export interface KuiComboboxOptions {
  /** When true, combobox controls show a clear button by default. */
  clearable?: boolean;
  /** Default visible selected chips before combobox renders a collapsed `+N` chip. */
  maxVisibleChips?: number;
  /** Empty row text rendered when no options match the current query. */
  emptyText?: string;
  /** Loading row text rendered while the combobox is loading. */
  loadingText?: string;
}

/** Injection token for `kui-combobox` defaults. Takes precedence over {@link KUI_FIELD_OPTIONS}. */
export const KUI_COMBOBOX_OPTIONS = new InjectionToken<KuiComboboxOptions>('KUI_COMBOBOX_OPTIONS');

/** Provides app-wide defaults for `kui-combobox` controls. */
export function kuiProvideComboboxOptions(opts: KuiComboboxOptions): Provider {
  return { provide: KUI_COMBOBOX_OPTIONS, useValue: opts };
}

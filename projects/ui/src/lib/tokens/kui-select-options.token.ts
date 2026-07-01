import { InjectionToken, Provider } from '@angular/core';

/** Defaults specific to `input[kuiSelect]` controls. */
export interface KuiSelectOptions {
  /** When true, select controls show a clear button by default. */
  clearable?: boolean;
  /** Default visible selected chips before select renders a collapsed `+N` chip. */
  maxVisibleChips?: number;
}

/** Injection token for `input[kuiSelect]` defaults. Takes precedence over {@link KUI_FIELD_OPTIONS}. */
export const KUI_SELECT_OPTIONS = new InjectionToken<KuiSelectOptions>('KUI_SELECT_OPTIONS');

/** Provides app-wide defaults for `input[kuiSelect]` controls. */
export function kuiProvideSelectOptions(opts: KuiSelectOptions): Provider {
  return { provide: KUI_SELECT_OPTIONS, useValue: opts };
}

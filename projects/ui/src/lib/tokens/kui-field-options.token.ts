import { InjectionToken, Provider } from '@angular/core';

/** Global defaults applied to all Kikita UI field controls. */
export interface KuiFieldOptions {
  /** When true, all select controls inside the app show a clear button by default. */
  clearable?: boolean;
  /** Default visible selected chips before field controls render a collapsed `+N` chip. */
  maxVisibleChips?: number;
}

/** Injection token for app-wide {@link KuiFieldOptions} defaults. */
export const KUI_FIELD_OPTIONS = new InjectionToken<KuiFieldOptions>('KUI_FIELD_OPTIONS');

/**
 * Provides app-wide field option defaults.
 *
 * @example
 * ```ts
 * // app.config.ts
 * providers: [kuiProvideFieldOptions({ clearable: true })]
 * ```
 */
export function kuiProvideFieldOptions(opts: KuiFieldOptions): Provider {
  return { provide: KUI_FIELD_OPTIONS, useValue: opts };
}

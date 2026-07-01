import { InjectionToken, Provider } from '@angular/core';

import { KuiSize } from '../types';

/** Global defaults applied to all Kikita UI field controls. */
export interface KuiFieldOptions {
  /** Default `kui-field` size when no local `size` input is provided. */
  size?: KuiSize;
  /** Hides automatically rendered Angular Signal Forms error messages by default. */
  hideErrors?: boolean;
  /** When true, field controls with clear affordances show a clear button by default. */
  clearable?: boolean;
}

/** Injection token for app-wide {@link KuiFieldOptions} defaults. */
export const KUI_FIELD_OPTIONS = new InjectionToken<KuiFieldOptions>('KUI_FIELD_OPTIONS');

/**
 * Provides app-wide field option defaults.
 *
 * @example
 * ```ts
 * // app.config.ts
 * providers: [kuiProvideFieldOptions({ size: 'sm', hideErrors: true })]
 * ```
 */
export function kuiProvideFieldOptions(opts: KuiFieldOptions): Provider {
  return { provide: KUI_FIELD_OPTIONS, useValue: opts };
}

import type { Provider } from '@angular/core';
import { InjectionToken } from '@angular/core';

import type { KuiSize } from '../types';

/** Shared defaults for input-like controls composed inside `kui-field`. */
export interface KuiFieldControlOptions {
  /** When true, field controls with clear affordances show a clear button by default. */
  readonly clearable?: boolean;
}

/** Global defaults applied to all Kikita UI field controls. */
export interface KuiFieldOptions extends KuiFieldControlOptions {
  /** Default `kui-field` size when no local `size` input is provided. */
  readonly size?: KuiSize;
  /** Hides automatically rendered Angular Signal Forms error messages by default. */
  readonly hideErrors?: boolean;
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

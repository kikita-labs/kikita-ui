import { InjectionToken, Provider } from '@angular/core';

import { KuiToastOptions } from './kui-toast.types';

/** @internal DI token for global toast defaults. */
export const KUI_TOAST_OPTIONS = new InjectionToken<KuiToastOptions>('KUI_TOAST_OPTIONS');

/**
 * Provide global defaults for all toasts in the current injector scope.
 *
 * @example
 * ```ts
 * // app.config.ts
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideKuiToastOptions({ position: 'top-end', duration: 4000 }),
 *   ],
 * };
 * ```
 */
export function provideKuiToastOptions(options: KuiToastOptions): Provider {
  return { provide: KUI_TOAST_OPTIONS, useValue: options };
}

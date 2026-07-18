import type { Provider } from '@angular/core';
import { InjectionToken } from '@angular/core';

/**
 * BCP 47 locale tag (for example `'en-US'`, `'ru-RU'`) used by date-aware Kikita UI
 * components such as `kui-calendar` to resolve month names, weekday names, and the
 * first day of the week. Defaults to `navigator.language`, falling back to `'en-US'`.
 */
export const KUI_LOCALE = new InjectionToken<string>('KUI_LOCALE', {
  factory: () => (typeof navigator !== 'undefined' && navigator.language) || 'en-US',
});

/**
 * Overrides the locale used by date-aware Kikita UI components for the whole app, or
 * for a subtree when added to a component's own `providers` array. A component-level
 * `locale` input, where available, takes precedence over this token.
 *
 * @example
 * ```ts
 * // app.config.ts
 * providers: [kuiProvideLocale('ru-RU')]
 * ```
 */
export function kuiProvideLocale(locale: string): Provider {
  return { provide: KUI_LOCALE, useValue: locale };
}

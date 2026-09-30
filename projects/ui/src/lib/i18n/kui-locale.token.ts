import { isPlatformServer } from '@angular/common';
import type { Provider } from '@angular/core';
import { inject, InjectionToken, PLATFORM_ID } from '@angular/core';

/**
 * BCP 47 locale tag (for example `'en-US'`, `'ru-RU'`) used by date-aware Kikita UI
 * components such as `kui-calendar` to resolve month names, weekday names, and the
 * first day of the week. In the browser it defaults to `navigator.language`, falling back to
 * `'en-US'`. On the server it is always `'en-US'`, because Node's `navigator.language` is the
 * host's locale, which would make server output depend on the machine. A server-rendered app
 * whose users are not `en-US` should provide the locale with {@link kuiProvideLocale}, or the
 * hydrated browser may render different month and weekday names than the server HTML.
 */
export const KUI_LOCALE = new InjectionToken<string>('KUI_LOCALE', {
  factory: () =>
    (!isPlatformServer(inject(PLATFORM_ID)) && typeof navigator !== 'undefined'
      ? navigator.language
      : '') || 'en-US',
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

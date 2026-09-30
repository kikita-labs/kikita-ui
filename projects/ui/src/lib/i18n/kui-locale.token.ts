import { isPlatformServer } from '@angular/common';
import type { Provider } from '@angular/core';
import { inject, InjectionToken, PLATFORM_ID, REQUEST, TransferState } from '@angular/core';

import {
  KUI_DEFAULT_LOCALE,
  KUI_LOCALE_SEED,
  kuiLocaleFromAcceptLanguage,
} from './kui-locale-seed.util';

/**
 * BCP 47 locale tag (for example `'en-US'`, `'ru-RU'`) used by date-aware Kikita UI
 * components such as `kui-calendar` to resolve month names, weekday names, and the
 * first day of the week.
 *
 * On the server it is the most preferred language of the request's `Accept-Language` header
 * (Angular's `REQUEST` token), or `'en-US'` when there is no request, as in prerendering, or no
 * usable header. It never reads the host's locale, so server output does not depend on the
 * machine. The server records the value in `TransferState` and the browser's first render reuses
 * it, so the server HTML and the hydrated DOM always agree. Without a transferred value (a
 * client-only app) the browser uses `navigator.language`, falling back to `'en-US'`.
 *
 * Server responses now vary by `Accept-Language`: a cache in front of the server must send
 * `Vary: Accept-Language`. Provide a fixed locale with {@link kuiProvideLocale} to opt out.
 */
export const KUI_LOCALE = new InjectionToken<string>('KUI_LOCALE', {
  factory: () => {
    const transferState = inject(TransferState);

    if (isPlatformServer(inject(PLATFORM_ID))) {
      const request = inject(REQUEST, { optional: true });
      const locale =
        kuiLocaleFromAcceptLanguage(request?.headers.get('accept-language')) ?? KUI_DEFAULT_LOCALE;

      transferState.set(KUI_LOCALE_SEED, locale);
      return locale;
    }

    const browserLocale = typeof navigator !== 'undefined' ? navigator.language : '';

    return transferState.get(KUI_LOCALE_SEED, null) || browserLocale || KUI_DEFAULT_LOCALE;
  },
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

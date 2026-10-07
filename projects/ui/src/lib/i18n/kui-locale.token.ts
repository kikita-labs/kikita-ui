import { isPlatformServer } from '@angular/common';
import { inject, InjectionToken, PLATFORM_ID, REQUEST, TransferState } from '@angular/core';

import {
  KUI_DEFAULT_LOCALE,
  KUI_LOCALE_SEED,
  kuiLocaleFromAcceptLanguage,
} from './kui-locale-seed.util';

/**
 * Root source of the locale (a BCP 47 tag such as `'en-US'` or `'ru-RU'`) that `KuiI18n` uses
 * when neither `provideKikitaUi({ locale })` nor `provideKuiLocale` sets one. Components read the
 * locale through `KuiI18n`, which also supports a subtree locale and runtime changes; provide a
 * fixed locale with `provideKuiLocale` rather than this token.
 *
 * On the server it is the most preferred language of the request's `Accept-Language` header
 * (Angular's `REQUEST` token), or `'en-US'` when there is no request, as in prerendering, or no
 * usable header. It never reads the host's locale, so server output does not depend on the
 * machine. The server records the value in `TransferState` and the browser's first render reuses
 * it, so the server HTML and the hydrated DOM always agree. Without a transferred value (a
 * client-only app) the browser uses `navigator.language`, falling back to `'en-US'`.
 *
 * Server responses now vary by `Accept-Language`: a cache in front of the server must send
 * `Vary: Accept-Language`. Provide a fixed locale with `provideKuiLocale` to opt out.
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

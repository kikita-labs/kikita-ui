import { computed, inject, type Signal } from '@angular/core';

import { toSignal } from '@angular/core/rxjs-interop';

import { KUI_LOCALE, type KuiMessagesLayer } from '@kikita-labs/ui';

import {
  createKuiMessagesLayer,
  KUI_LOCALE_BY_LANGUAGE,
  type KuiMessageCatalogue,
} from '@app/shared/utilities';
import { TranslocoService } from '@jsverse/transloco';

/**
 * Formatting locale of Kikita UI. A language the visitor switched to wins (`ru` formats as
 * `ru-RU`); otherwise the request's own locale applies, which keeps the server-negotiated
 * `Accept-Language` behavior of `KUI_LOCALE`. It runs in an injection context, which is where
 * `provideKikitaUi({ locale })` calls it.
 */
export function playgroundKuiLocale(): Signal<string> {
  const transloco = inject(TranslocoService);
  const requested = inject(KUI_LOCALE);
  const language = toSignal(transloco.langChanges$, { initialValue: transloco.getActiveLang() });

  return computed(() => KUI_LOCALE_BY_LANGUAGE[language()] ?? requested);
}

/**
 * Library messages from the `kui` subtree of the active translation catalogue, so every Kikita UI
 * label switches language together with the shell. It runs in an injection context, which is where
 * `provideKikitaUi({ messages })` calls it.
 */
export function playgroundKuiMessages(): Signal<KuiMessagesLayer> {
  const transloco = inject(TranslocoService);
  const catalogue = toSignal(transloco.selectTranslateObject<KuiMessageCatalogue>('kui'), {
    initialValue: undefined,
  });

  return computed(() => createKuiMessagesLayer(catalogue()));
}

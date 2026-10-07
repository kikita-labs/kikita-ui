import { registerLocaleData } from '@angular/common';
import localeRu from '@angular/common/locales/ru';
import { computed, inject } from '@angular/core';

import { toSignal } from '@angular/core/rxjs-interop';

import { TranslocoService } from '@jsverse/transloco';

registerLocaleData(localeRu);

/** Resolves the Playground language reactively to the Angular locale id used by DecimalPipe. */
export function createPaginationNumberLocale() {
  const transloco = inject(TranslocoService);
  const activeLanguage = toSignal(transloco.langChanges$, {
    initialValue: transloco.getActiveLang(),
  });

  return computed(() => (activeLanguage() === 'ru' ? 'ru' : 'en-US'));
}

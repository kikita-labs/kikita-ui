import { computed, inject } from '@angular/core';

import { toSignal } from '@angular/core/rxjs-interop';

import { TranslocoService } from '@jsverse/transloco';

/** Resolves the Playground language reactively to the Date Picker examples' calendar locale. */
export function createDatePickerCalendarLocale() {
  const transloco = inject(TranslocoService);
  const activeLanguage = toSignal(transloco.langChanges$, {
    initialValue: transloco.getActiveLang(),
  });

  return computed(() => (activeLanguage() === 'ru' ? 'ru-RU' : 'en-US'));
}

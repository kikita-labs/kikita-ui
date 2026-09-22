import { HttpClient } from '@angular/common/http';
import { inject, Injectable, REQUEST } from '@angular/core';

import type { Translation, TranslocoLoader } from '@jsverse/transloco';

@Injectable({ providedIn: 'root' })
export class TranslocoHttpLoader implements TranslocoLoader {
  private readonly http = inject(HttpClient);
  private readonly request = inject(REQUEST, { optional: true });

  /** Loads a catalogue from the app's public i18n directory. */
  public getTranslation(language: string) {
    const origin = this.request ? new URL(this.request.url).origin : '';
    return this.http.get<Translation>(`${origin}/i18n/${language}.json`);
  }
}

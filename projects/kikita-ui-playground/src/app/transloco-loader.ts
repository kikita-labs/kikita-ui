import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import type { Translation, TranslocoLoader } from '@jsverse/transloco';

@Injectable({ providedIn: 'root' })
export class TranslocoHttpLoader implements TranslocoLoader {
  private readonly http = inject(HttpClient);

  /**
   * Loads a catalogue from the app's public i18n directory. The URL stays relative on both
   * platforms: Angular resolves it against the incoming request during SSR, and the identical
   * key lets the browser reuse the server response from the HTTP transfer cache.
   */
  public getTranslation(language: string) {
    return this.http.get<Translation>(`/i18n/${language}.json`);
  }
}

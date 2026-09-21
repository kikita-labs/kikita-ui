import {
  ApplicationConfig,
  inject,
  LOCALE_ID,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';

import { KUI_LOCALE } from '@kikita-labs/ui';

import { routes } from './app.routes';

/** Browser configuration for the internal Kikita UI v2 Playground. */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(),
    {
      provide: KUI_LOCALE,
      useFactory: () => inject(LOCALE_ID),
    },
  ],
};

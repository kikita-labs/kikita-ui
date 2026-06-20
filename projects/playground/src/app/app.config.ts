import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { provideKikitaUi, provideKuiIcons } from '@kikita-labs/ui';

import { routes } from './app.routes';

const PLAYGROUND_ICONS = {
  check:
    '<svg viewBox="0 0 16 16" fill="none"><path d="M3 8l3 3 7-7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  spark:
    '<svg viewBox="0 0 16 16" fill="none"><path d="M8 1.5l1.4 4.2L13.5 7 9.4 8.3 8 12.5 6.6 8.3 2.5 7l4.1-1.3L8 1.5z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>',
  warning:
    '<svg viewBox="0 0 16 16" fill="none"><path d="M8 2l6 11H2L8 2z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M8 6v3.2M8 11.5h.01" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
} as const;

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideKikitaUi(),
    provideKuiIcons(PLAYGROUND_ICONS),
  ],
};

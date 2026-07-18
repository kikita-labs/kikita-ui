import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import type { EnvironmentProviders } from '@angular/core';
import {
  ENVIRONMENT_INITIALIZER,
  inject,
  makeEnvironmentProviders,
  PLATFORM_ID,
} from '@angular/core';

import { KUI_ICONS, resolveLucideIcon } from '../components/icon';
import { DEFAULT_KUI_THEME, provideKuiTheme } from '../theme';
import type { KikitaUiOptions } from './kikita-ui-options.interface';
import { KIKITA_UI_OPTIONS } from './kikita-ui-options.token';

/** Provides root Kikita UI configuration for an Angular application. */
export function provideKikitaUi(options: KikitaUiOptions = {}): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideKuiTheme(options.theme ?? DEFAULT_KUI_THEME),
    ...(options.icons === false
      ? []
      : [{ provide: KUI_ICONS, multi: true, useValue: resolveLucideIcon }]),
    {
      provide: ENVIRONMENT_INITIALIZER,
      multi: true,
      useFactory: () => {
        const document = inject(DOCUMENT);
        const platformId = inject(PLATFORM_ID);

        return () => {
          if (!isPlatformBrowser(platformId)) return;

          if (options.scrollbars === 'styled') {
            document.documentElement.dataset['kuiScrollbars'] = 'styled';
            return;
          }

          if (options.scrollbars === 'native') {
            delete document.documentElement.dataset['kuiScrollbars'];
          }
        };
      },
    },
    {
      provide: KIKITA_UI_OPTIONS,
      useValue: options,
    },
  ]);
}

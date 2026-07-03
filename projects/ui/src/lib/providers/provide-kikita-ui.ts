import { DOCUMENT } from '@angular/common';
import {
  ENVIRONMENT_INITIALIZER,
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
} from '@angular/core';

import { DEFAULT_KUI_THEME, provideKuiTheme } from '../theme';
import { KIKITA_UI_OPTIONS } from './kikita-ui-options.token';
import { KikitaUiOptions } from './kikita-ui-options.interface';

/** Provides root Kikita UI configuration for an Angular application. */
export function provideKikitaUi(options: KikitaUiOptions = {}): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideKuiTheme(options.theme ?? DEFAULT_KUI_THEME),
    {
      provide: ENVIRONMENT_INITIALIZER,
      multi: true,
      useFactory: () => {
        const document = inject(DOCUMENT);

        return () => {
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

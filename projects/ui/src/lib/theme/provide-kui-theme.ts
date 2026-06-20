import { DOCUMENT } from '@angular/common';
import {
  ENVIRONMENT_INITIALIZER,
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
} from '@angular/core';

import { createKuiTheme, createKuiThemeStyleSheet } from './create-kui-theme';
import { DEFAULT_KUI_THEME } from './default-kui-theme.const';
import { KuiThemeOptions } from './kui-theme-options.interface';
import { KuiGeneratedTheme } from './kui-theme-tokens.interface';
import { KUI_THEME } from './kui-theme.token';

const KUI_THEME_STYLE_ID = 'kui-theme';

/** Provides a generated Kikita UI theme from seed options and installs its CSS variables. */
export function provideKuiTheme(
  options: KuiThemeOptions = DEFAULT_KUI_THEME,
): EnvironmentProviders {
  const theme = createKuiTheme(options);

  return makeEnvironmentProviders([
    {
      provide: KUI_THEME,
      useValue: theme,
    },
    {
      provide: ENVIRONMENT_INITIALIZER,
      multi: true,
      useValue: () => {
        applyKuiThemeStyleSheet(inject(DOCUMENT), theme);
      },
    },
  ]);
}

function applyKuiThemeStyleSheet(document: Document, theme: KuiGeneratedTheme): void {
  if (!document.head) {
    return;
  }

  const existingStyle = document.getElementById(KUI_THEME_STYLE_ID) as HTMLStyleElement | null;
  const style = existingStyle ?? document.createElement('style');

  style.id = KUI_THEME_STYLE_ID;
  style.textContent = createKuiThemeStyleSheet(theme);

  if (!existingStyle) {
    document.head.appendChild(style);
  }
}

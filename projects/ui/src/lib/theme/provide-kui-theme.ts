import { DOCUMENT } from '@angular/common';
import type { EnvironmentProviders } from '@angular/core';
import { ENVIRONMENT_INITIALIZER, inject, makeEnvironmentProviders } from '@angular/core';

import { createKuiTheme, createKuiThemeStyleSheet } from './create-kui-theme';
import { DEFAULT_KUI_THEME } from './default-kui-theme.const';
import { KUI_THEME } from './kui-theme.token';
import type { KuiThemeOptions } from './kui-theme-options.interface';
import type { KuiGeneratedTheme } from './kui-theme-tokens.interface';

const KUI_THEME_STYLE_ID = 'kui-theme';

/**
 * Provides a generated Kikita UI theme from seed options and installs its CSS variables. It also
 * sets `data-kui-density` on `<html>` from `seeds.density` unless the attribute is already
 * present, on the server too, so the first HTML already carries the density.
 */
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
        const document = inject(DOCUMENT);

        applyKuiThemeStyleSheet(document, theme);
        applyKuiDensity(document, options.seeds.density);
      },
    },
  ]);
}

function applyKuiDensity(document: Document, density: string): void {
  const root = document.documentElement;

  if (root && !root.hasAttribute('data-kui-density')) {
    root.setAttribute('data-kui-density', density);
  }
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

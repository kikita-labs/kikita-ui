import { DOCUMENT } from '@angular/common';
import type { EnvironmentProviders } from '@angular/core';
import { ENVIRONMENT_INITIALIZER, inject, makeEnvironmentProviders } from '@angular/core';

import { KUI_BRAND_ICONS, KUI_ICONS, resolveLucideIcon } from '../components/icon';
import { KuiI18n } from '../i18n/kui-i18n.service';
import { KUI_I18N_SEED } from '../i18n/kui-i18n.token';
import type { KikitaUiOptions } from '../providers/kikita-ui-options.interface';
import { KIKITA_UI_OPTIONS } from '../providers/kikita-ui-options.token';
import type { KuiDefaultsSource } from '../providers/kui-defaults.interface';
import { KuiDefaults } from '../providers/kui-defaults.service';
import { KUI_DEFAULTS_SEED } from '../providers/kui-defaults.token';
import { DEFAULT_KUI_THEME, provideKuiTheme } from '../theme';

/** Provides root Kikita UI configuration for an Angular application. */
export function provideKikitaUi(options: KikitaUiOptions = {}): EnvironmentProviders {
  const seed = createDefaultsSeed(options);

  return makeEnvironmentProviders([
    provideKuiTheme(options.theme ?? DEFAULT_KUI_THEME),
    ...(options.icons === false
      ? []
      : [
          { provide: KUI_ICONS, multi: true, useValue: resolveLucideIcon },
          { provide: KUI_ICONS, multi: true, useValue: KUI_BRAND_ICONS },
        ]),
    {
      provide: ENVIRONMENT_INITIALIZER,
      multi: true,
      useFactory: () => {
        const document = inject(DOCUMENT);

        // Runs on the server too: the attribute is a plain attribute on `<html>`, outside the
        // compiled templates, so writing it during server rendering cannot change the hydrated
        // DOM shape and makes the first HTML response already carry the scrollbar mode.
        return () => {
          if (options.scrollbars === 'styled') {
            document.documentElement.setAttribute('data-kui-scrollbars', 'styled');
            return;
          }

          if (options.scrollbars === 'native') {
            document.documentElement.removeAttribute('data-kui-scrollbars');
          }
        };
      },
    },
    KuiDefaults,
    KuiI18n,
    ...(options.locale !== undefined || options.messages !== undefined
      ? [
          {
            provide: KUI_I18N_SEED,
            multi: true,
            useValue: { locale: options.locale, messages: options.messages },
          },
        ]
      : []),
    ...(seed ? [{ provide: KUI_DEFAULTS_SEED, multi: true, useValue: seed }] : []),
    {
      provide: KIKITA_UI_OPTIONS,
      useValue: options,
    },
  ]);
}

/**
 * Builds the root defaults seed. The deprecated root `tooltip` option becomes the `tooltip` key
 * unless `defaults.tooltip` is set, which wins.
 */
function createDefaultsSeed(options: KikitaUiOptions): KuiDefaultsSource | undefined {
  const { defaults, tooltip } = options;

  if (!tooltip) {
    return defaults;
  }

  return () => {
    const layer = typeof defaults === 'function' ? defaults() : (defaults ?? {});

    return layer.tooltip === undefined ? { ...layer, tooltip } : layer;
  };
}

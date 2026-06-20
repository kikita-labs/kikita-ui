import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';

import { KUI_ICONS } from './kui-icon-registry.token';
import { KuiIconRegistry } from './kui-icon-source.type';

/**
 * Registers trusted static inline SVG icons for `KuiIconComponent` lookup by name.
 *
 * Do not register user-generated SVG markup.
 */
export function provideKuiIcons(icons: KuiIconRegistry): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: KUI_ICONS,
      multi: true,
      useValue: icons,
    },
  ]);
}

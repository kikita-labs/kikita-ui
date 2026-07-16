import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';

import { KUI_ICONS } from './kui-icon-registry.token';
import { KuiIconRegistry } from './kui-icon-source.type';

/**
 * Registers an icon set for `KuiIconComponent` lookup by name — either a static map of trusted
 * inline SVG markup, or an async resolver (e.g. backed by a different icon library or a remote
 * source). Later calls take precedence over earlier ones for names they both define, so this can
 * be used at the root to override Kikita UI's default Lucide icons, or in a specific component's
 * `providers` to scope an override to that subtree.
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

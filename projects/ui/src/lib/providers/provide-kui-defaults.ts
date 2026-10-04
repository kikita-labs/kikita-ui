import type { Provider } from '@angular/core';

import { KuiDefaults } from './kui-defaults';
import type { KuiDefaultsSource } from './kui-defaults.interface';
import { KUI_DEFAULTS_SEED } from './kui-defaults.token';

/**
 * Adds a level of component defaults for a subtree.
 *
 * Use it in `providers` of a component, a route or an environment injector. The level merges over
 * the defaults it inherits per component key and per property, so only the properties it names change.
 *
 * @example
 * ```ts
 * @Component({ providers: [provideKuiDefaults({ button: { size: 'lg' } })] })
 * ```
 */
export function provideKuiDefaults(source: KuiDefaultsSource): Provider[] {
  return [KuiDefaults, { provide: KUI_DEFAULTS_SEED, multi: true, useValue: source }];
}

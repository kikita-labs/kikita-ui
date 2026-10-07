import { InjectionToken } from '@angular/core';

import type { KuiDefaultsSource } from './kui-defaults.interface';

/**
 * @internal
 * Initial layers of one injector level, in provider order. `KuiDefaults` reads them with
 * `self: true`, so a nested level never inherits the seeds of its parent, and several providers on
 * one level combine instead of replacing each other.
 */
export const KUI_DEFAULTS_SEED = new InjectionToken<readonly KuiDefaultsSource[]>(
  'KUI_DEFAULTS_SEED',
);

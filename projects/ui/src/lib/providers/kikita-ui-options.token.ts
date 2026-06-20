import { InjectionToken } from '@angular/core';

import { KikitaUiOptions } from './kikita-ui-options.interface';

/** Injection token containing root Kikita UI configuration. */
export const KIKITA_UI_OPTIONS = new InjectionToken<KikitaUiOptions>('KIKITA_UI_OPTIONS', {
  factory: () => ({}),
});

import { InjectionToken } from '@angular/core';

import { createKuiTheme } from './create-kui-theme';
import { DEFAULT_KUI_THEME } from './default-kui-theme.const';
import type { KuiGeneratedTheme } from './kui-theme-tokens.interface';

/** Injection token containing the generated Kikita UI theme. */
export const KUI_THEME = new InjectionToken<KuiGeneratedTheme>('KUI_THEME', {
  factory: () => createKuiTheme(DEFAULT_KUI_THEME),
});

import type { KuiThemeOptions } from './kui-theme-options.interface';

/** Default experimental Kikita UI theme seeds. */
export const DEFAULT_KUI_THEME: KuiThemeOptions = {
  seeds: {
    color: {
      primary: 'oklch(0.52 0.25 285)',
      neutral: 'oklch(0.5 0.01 80)',
      success: 'oklch(0.54 0.16 145)',
      warning: 'oklch(0.56 0.15 65)',
      danger: 'oklch(0.54 0.22 25)',
      info: 'oklch(0.53 0.14 215)',
    },
    radius: 8,
    density: 'regular',
  },
};

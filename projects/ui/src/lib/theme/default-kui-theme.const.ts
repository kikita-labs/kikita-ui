import { KuiThemeOptions } from './kui-theme-options.interface';

/** Default experimental Kikita UI theme seeds. */
export const DEFAULT_KUI_THEME: KuiThemeOptions = {
  seeds: {
    color: {
      primary: 'oklch(0.52 0.25 285)',
      neutral: 'oklch(0.5 0.01 80)',
      success: 'oklch(0.54 0.16 145)',
      warning: 'oklch(0.74 0.16 75)',
      danger: 'oklch(0.54 0.22 25)',
      info: 'oklch(0.58 0.16 215)',
    },
    radius: 8,
    density: 'regular',
  },
};

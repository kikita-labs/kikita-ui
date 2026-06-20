import { KuiDensity, KuiSize } from '../types';
import { KuiThemeOptions } from '../theme';

/** Root configuration for Kikita UI providers. */
export interface KikitaUiOptions {
  /** Theme seeds and generated theme options. */
  readonly theme?: KuiThemeOptions;

  /** Global component defaults. */
  readonly defaults?: KikitaUiDefaults;
}

/** Shared defaults used by Kikita UI components unless locally overridden. */
export interface KikitaUiDefaults {
  readonly size?: KuiSize;
  readonly density?: KuiDensity;
}

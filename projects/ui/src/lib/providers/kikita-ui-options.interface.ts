import { KuiDensity, KuiSize } from '../types';
import { KuiThemeOptions } from '../theme';

/** Root configuration for Kikita UI providers. */
export interface KikitaUiOptions {
  /** Theme seeds and generated theme options. */
  readonly theme?: KuiThemeOptions;

  /** Global native scrollbar styling mode. Defaults to native browser scrollbars outside Kikita-owned components. */
  readonly scrollbars?: KuiScrollbarMode;

  /** Global component defaults. */
  readonly defaults?: KikitaUiDefaults;

  /**
   * Default icon set resolved by `kui-icon` when a name isn't matched by a locally provided set.
   * Defaults to `'lucide'`. Set to `false` to opt out of bundling the default Lucide resolver.
   */
  readonly icons?: 'lucide' | false;
}

/** Global native scrollbar styling mode for application-owned scroll containers. */
export type KuiScrollbarMode = 'native' | 'styled';

/** Shared defaults used by Kikita UI components unless locally overridden. */
export interface KikitaUiDefaults {
  readonly size?: KuiSize;
  readonly density?: KuiDensity;
}

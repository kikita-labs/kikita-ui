import type { KuiTooltipOptions } from '../components/tooltip/kui-tooltip-options.interface';
import type { KuiLocaleSource, KuiMessagesSource } from '../i18n/kui-messages.interface';
import type { KuiThemeOptions } from '../theme';
import type { KuiComponentDefaults, KuiDefaultsSource } from './kui-defaults.interface';

/** Root configuration for Kikita UI providers. */
export interface KikitaUiOptions {
  /** Theme seeds and generated theme options. */
  readonly theme?: KuiThemeOptions;

  /** Global native scrollbar styling mode. Defaults to native browser scrollbars outside Kikita-owned components. */
  readonly scrollbars?: KuiScrollbarMode;

  /**
   * Global component defaults, one key per primitive plus the global control `size`.
   *
   * Properties accept plain values or signals. A function runs in an injection context. Nested
   * levels added with `kuiProvideDefaults` merge over these per component key and per property.
   */
  readonly defaults?: KuiDefaultsSource;

  /**
   * Locale for dates, numbers and plural rules: a BCP 47 tag, a `Signal` of one, or a function that
   * runs in an injection context. Defaults to the request's `Accept-Language` on the server and the
   * browser language on the client, falling back to `en-US`. Use
   * `locale: () => inject(LOCALE_ID)` to follow Angular's `LOCALE_ID`.
   */
  readonly locale?: KuiLocaleSource;

  /**
   * Overrides for the library's own text (accessible names, visible words, placeholders), merged
   * over the English defaults per group and per key. Pass a `Signal` to follow the application's
   * language at runtime. See `KuiMessages`.
   */
  readonly messages?: KuiMessagesSource;

  /**
   * Default options for `kuiTooltip` instances. Defaults to adaptive `auto` behavior.
   *
   * @deprecated Use `defaults.tooltip`; it wins when both are set. Planned removal in 3.0.
   */
  readonly tooltip?: KuiTooltipOptions;

  /**
   * Default icon set resolved by `kui-icon` when a name isn't matched by a locally provided set.
   * Defaults to `'lucide'`. Set to `false` to opt out of bundling the default Lucide resolver.
   */
  readonly icons?: 'lucide' | false;
}

/** Global native scrollbar styling mode for application-owned scroll containers. */
export type KuiScrollbarMode = 'native' | 'styled';

/**
 * Shared defaults used by Kikita UI components unless locally overridden.
 *
 * @deprecated Use {@link KuiComponentDefaults}. Planned removal in 3.0.
 */
export type KikitaUiDefaults = KuiComponentDefaults;

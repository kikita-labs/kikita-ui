import type { KuiTextTone } from './kui-text-tone.type';
import type { KuiTextVariant } from './kui-text-variant.type';

/** Defaults for `[kuiText]`, set under the `typography` key of the component defaults. */
export interface KuiTypographyOptions {
  /** Semantic typography role. */
  readonly variant?: KuiTextVariant;

  /** Semantic text colour tone. */
  readonly tone?: KuiTextTone;
}

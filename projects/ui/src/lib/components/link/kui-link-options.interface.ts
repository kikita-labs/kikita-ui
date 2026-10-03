import type { KuiIconGlyph } from '../icon/kui-icon-glyph.type';
import type { KuiLinkTone } from './kui-link-tone.type';
import type { KuiLinkUnderline } from './kui-link-underline.type';

/** Defaults for `a[kuiLink], button[kuiLink]`, set under the `link` key of the component defaults. */
export interface KuiLinkOptions {
  /** Default tone. */
  readonly tone?: KuiLinkTone;

  /** When the link is underlined. */
  readonly underline?: KuiLinkUnderline;
  /** Icon shown after an external link. Takes precedence over `defaults.icons.externalLink`. */
  readonly externalIcon?: KuiIconGlyph;
}

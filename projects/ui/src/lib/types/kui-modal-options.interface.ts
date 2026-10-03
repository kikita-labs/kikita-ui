import type { KuiIconGlyph } from '../components/icon/kui-icon-glyph.type';

/** Defaults shared by dialogs and drawers. */
export interface KuiModalSurfaceOptions {
  /** Shows the close button in the header. */
  readonly closable?: boolean;

  /** Icon of the close button. Takes precedence over `defaults.icons.close`. */
  readonly closeIcon?: KuiIconGlyph;
}

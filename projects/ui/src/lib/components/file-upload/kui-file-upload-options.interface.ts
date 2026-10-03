import type { KuiSize } from '../../types';
import type { KuiIconGlyph } from '../icon/kui-icon-glyph.type';
import type { KuiFileUploadVariant } from './kui-file-upload.component';
import type { KuiFileUploadMode } from './kui-file-upload.component';

/** Defaults for `kui-file-upload`, set under the `fileUpload` key of the component defaults. */
export interface KuiFileUploadOptions {
  /** Component size. Takes precedence over the global `defaults.size`. */
  readonly size?: KuiSize;

  /** Default variant. */
  readonly variant?: KuiFileUploadVariant;

  /** Default mode. */
  readonly mode?: KuiFileUploadMode;
  /** Icon of the remove-file button. Takes precedence over `defaults.icons.remove`. */
  readonly removeIcon?: KuiIconGlyph;
}

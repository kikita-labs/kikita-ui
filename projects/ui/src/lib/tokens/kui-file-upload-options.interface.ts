import type { KuiFileUploadVariant } from '../components/file-upload/kui-file-upload.component';
import type { KuiFileUploadMode } from '../components/file-upload/kui-file-upload.component';
import type { KuiSize } from '../types';

/** Defaults for `kui-file-upload`, set under the `fileUpload` key of the component defaults. */
export interface KuiFileUploadOptions {
  /** Component size. Takes precedence over the global `defaults.size`. */
  readonly size?: KuiSize;

  /** Default variant. */
  readonly variant?: KuiFileUploadVariant;

  /** Default mode. */
  readonly mode?: KuiFileUploadMode;
}

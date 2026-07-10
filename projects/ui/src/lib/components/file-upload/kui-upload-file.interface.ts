/** Lifecycle status of a single entry in a `kui-file-upload` file list. */
export type KuiUploadFileStatus = 'pending' | 'uploading' | 'success' | 'error';

/**
 * A single file entry tracked by `kui-file-upload`.
 *
 * `kui-file-upload` only picks, validates, and lists files — it does not perform any network
 * transport itself. The consumer owns `status`/`progress`/`errorMsg` by writing back into the
 * two-way `files` model (start uploading on a new `pending` entry, update `progress` as it
 * advances, set `success` or `error` when it settles). `file` carries the native `File` so the
 * consumer can actually read/upload its bytes.
 */
export interface KuiUploadFile {
  /** Stable id for this entry, unique within the component instance. */
  readonly id: string;
  /** The underlying native `File` selected via the picker or drag-and-drop. */
  readonly file: File;
  /** Mirrors `file.name`. */
  readonly name: string;
  /** Mirrors `file.size` in bytes. */
  readonly size: number;
  /** Mirrors `file.type`. */
  readonly type: string;
  /** Current lifecycle status. New entries start as `pending` unless client-side validation failed. */
  readonly status: KuiUploadFileStatus;
  /** Upload progress from 0 to 100. Only meaningful while `status` is `uploading`. */
  readonly progress?: number;
  /** Error message shown in the list. Only meaningful while `status` is `error`. */
  readonly errorMsg?: string;
}

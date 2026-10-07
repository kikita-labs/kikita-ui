/** Options for building a page-owned gallery of placeholder photos. */
export interface MediaViewerPhotoOptions {
  /** Gives every photo an explicit `id`; when false the viewer falls back to each `src`. */
  readonly withIds?: boolean;
}

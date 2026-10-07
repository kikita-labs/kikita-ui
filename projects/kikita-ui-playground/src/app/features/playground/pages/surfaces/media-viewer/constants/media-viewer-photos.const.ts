/** Hues, in degrees, cycled by the generated placeholder photos. */
export const MEDIA_VIEWER_PHOTO_HUES = [10, 65, 130, 190, 250, 310] as const;

/** Number of photos in the shared example gallery. */
export const MEDIA_VIEWER_GALLERY_SIZE = 6;

/** Same-origin static photo used by the loading example. */
export const MEDIA_VIEWER_FILE_PHOTO_SRC = '/media-viewer/landscape.svg';

/** Same-origin path that does not exist, used by the error examples. */
export const MEDIA_VIEWER_MISSING_PHOTO_SRC = '/media-viewer/missing.svg';

/** Zero-based indexes of the gallery photos, used to render one tile per photo. */
export const MEDIA_VIEWER_TILE_INDEXES: readonly number[] = Array.from(
  { length: MEDIA_VIEWER_GALLERY_SIZE },
  (_, index) => index,
);

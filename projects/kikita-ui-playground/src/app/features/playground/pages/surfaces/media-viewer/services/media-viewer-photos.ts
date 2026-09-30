import { inject, Service } from '@angular/core';

import { mediaViewerPhotoSrc } from '@features/playground/pages/surfaces/media-viewer/helpers';
import type { MediaViewerPhotoOptions } from '@features/playground/pages/surfaces/media-viewer/interfaces';
import { TranslocoService } from '@jsverse/transloco';
import type { KuiMediaViewerItem } from '@kikita-labs/ui';

/** Builds translated placeholder photo items for the Media Viewer examples at open time. */
@Service()
export class MediaViewerPhotos {
  private readonly transloco = inject(TranslocoService);

  /** Creates `count` placeholder photos with alt text in the active language. */
  items(count: number, options: MediaViewerPhotoOptions = {}): KuiMediaViewerItem[] {
    const withIds = options.withIds ?? true;

    return Array.from({ length: count }, (_, index) => ({
      ...(withIds ? { id: `photo-${index + 1}` } : {}),
      src: mediaViewerPhotoSrc(index),
      alt: this.transloco.translate('mediaViewer.labels.photoAlt', { number: index + 1 }),
    }));
  }

  /** Translates a label from the Media Viewer scope in the active language. */
  label(key: string): string {
    return this.transloco.translate(`mediaViewer.labels.${key}`);
  }
}

import { Component, inject } from '@angular/core';

import { KuiButton, kuiMediaViewer } from '@kikita-labs/ui';

import {
  MEDIA_VIEWER_FILE_PHOTO_SRC,
  MEDIA_VIEWER_MISSING_PHOTO_SRC,
} from '@features/playground/pages/surfaces/media-viewer/constants';
import { MediaViewerPhotos } from '@features/playground/pages/surfaces/media-viewer/services';
import { TranslocoPipe } from '@jsverse/transloco';

/** Shows the loading and error stage states and gallery items without explicit ids. */
@Component({
  selector: 'app-media-viewer-state-examples',
  imports: [KuiButton, TranslocoPipe],
  templateUrl: './media-viewer-state-examples.html',
  styleUrl: './media-viewer-state-examples.scss',
})
export class MediaViewerStateExamples {
  private readonly openViewer = kuiMediaViewer();

  private readonly photos = inject(MediaViewerPhotos);

  protected openLoading(): void {
    this.openViewer({
      items: [{ id: 'file-photo', src: MEDIA_VIEWER_FILE_PHOTO_SRC, alt: this.alt('slowAlt') }],
    });
  }

  protected openBroken(): void {
    this.openViewer({
      items: [
        { id: 'broken-photo', src: MEDIA_VIEWER_MISSING_PHOTO_SRC, alt: this.alt('brokenAlt') },
      ],
    });
  }

  protected openBrokenGallery(): void {
    const [first, , third] = this.photos.items(3);

    this.openViewer({
      items: [
        first,
        { id: 'broken-photo', src: MEDIA_VIEWER_MISSING_PHOTO_SRC, alt: this.alt('brokenAlt') },
        third,
      ],
      index: 1,
    });
  }

  protected openWithoutIds(): void {
    this.openViewer({ items: this.photos.items(3, { withIds: false }) });
  }

  private alt(key: string): string {
    return this.photos.label(key);
  }
}

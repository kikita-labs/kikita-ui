import { Component, inject, signal } from '@angular/core';

import { KuiButtonDirective, kuiMediaViewer } from '@kikita-labs/ui';

import { MEDIA_VIEWER_GALLERY_SIZE } from '@features/playground/pages/surfaces/media-viewer/constants';
import { MediaViewerPhotos } from '@features/playground/pages/surfaces/media-viewer/services';
import { TranslocoPipe } from '@jsverse/transloco';

/** Opens the Media Viewer with only the required `items` option. */
@Component({
  selector: 'app-media-viewer-default-example',
  imports: [KuiButtonDirective, TranslocoPipe],
  templateUrl: './media-viewer-default-example.html',
  styleUrl: './media-viewer-default-example.scss',
})
export class MediaViewerDefaultExample {
  private readonly openViewer = kuiMediaViewer();

  private readonly photos = inject(MediaViewerPhotos);

  protected readonly lastViewed = signal<number | null>(null);

  protected open(): void {
    this.openViewer({
      items: this.photos.items(MEDIA_VIEWER_GALLERY_SIZE),
      onIndexChange: (index) => this.lastViewed.set(index),
    });
  }
}

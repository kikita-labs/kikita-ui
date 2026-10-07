import { Component, inject, signal } from '@angular/core';

import { kuiMediaViewer } from '@kikita-labs/ui';

import { MediaViewerTile } from '@features/playground/pages/surfaces/media-viewer/components/media-viewer-tile';
import {
  MEDIA_VIEWER_GALLERY_SIZE,
  MEDIA_VIEWER_TILE_INDEXES,
} from '@features/playground/pages/surfaces/media-viewer/constants';
import { mediaViewerPhotoSrc } from '@features/playground/pages/surfaces/media-viewer/helpers';
import { MediaViewerPhotos } from '@features/playground/pages/surfaces/media-viewer/services';
import { TranslocoPipe } from '@jsverse/transloco';

/** Opens the Media Viewer from a grid of photo tiles, each at its own index. */
@Component({
  selector: 'app-media-viewer-grid-example',
  imports: [MediaViewerTile, TranslocoPipe],
  templateUrl: './media-viewer-grid-example.html',
  styleUrl: './media-viewer-grid-example.scss',
})
export class MediaViewerGridExample {
  private readonly openViewer = kuiMediaViewer();

  private readonly photos = inject(MediaViewerPhotos);

  protected readonly tileIndexes = MEDIA_VIEWER_TILE_INDEXES;

  protected readonly total = MEDIA_VIEWER_GALLERY_SIZE;

  protected readonly lastViewed = signal<number | null>(null);

  protected src(index: number): string {
    return mediaViewerPhotoSrc(index);
  }

  protected openAt(index: number): void {
    this.openViewer({
      items: this.photos.items(MEDIA_VIEWER_GALLERY_SIZE),
      index,
      onIndexChange: (viewed) => this.lastViewed.set(viewed),
    });
  }
}

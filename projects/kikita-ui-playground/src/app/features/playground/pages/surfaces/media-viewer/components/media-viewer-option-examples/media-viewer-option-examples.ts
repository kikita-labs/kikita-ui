import { Component, inject, signal } from '@angular/core';

import { KuiButtonDirective, kuiMediaViewer } from '@kikita-labs/ui';

import { MEDIA_VIEWER_GALLERY_SIZE } from '@features/playground/pages/surfaces/media-viewer/constants';
import { MediaViewerPhotos } from '@features/playground/pages/surfaces/media-viewer/services';
import { TranslocoPipe } from '@jsverse/transloco';

/** Shows single-photo mode, index clamping, a custom accessible name, and custom zoom bounds. */
@Component({
  selector: 'app-media-viewer-option-examples',
  imports: [KuiButtonDirective, TranslocoPipe],
  templateUrl: './media-viewer-option-examples.html',
  styleUrl: './media-viewer-option-examples.scss',
})
export class MediaViewerOptionExamples {
  private readonly openViewer = kuiMediaViewer();

  private readonly photos = inject(MediaViewerPhotos);

  protected readonly lastViewed = signal<number | null>(null);

  protected openSingle(): void {
    this.openViewer({ items: this.photos.items(1) });
  }

  protected openPastEnd(): void {
    this.openViewer({
      items: this.photos.items(MEDIA_VIEWER_GALLERY_SIZE),
      index: 99,
      onIndexChange: (index) => this.lastViewed.set(index),
    });
  }

  protected openCustomLabel(): void {
    this.openViewer({
      items: this.photos.items(MEDIA_VIEWER_GALLERY_SIZE),
      ariaLabel: this.photos.label('customAriaLabel'),
    });
  }

  protected openZoomLimits(): void {
    this.openViewer({
      items: this.photos.items(MEDIA_VIEWER_GALLERY_SIZE),
      maxZoom: 1.5,
      zoomStep: 0.25,
    });
  }
}

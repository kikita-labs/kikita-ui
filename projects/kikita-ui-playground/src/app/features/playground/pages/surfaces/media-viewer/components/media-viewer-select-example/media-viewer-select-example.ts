import { Component, computed, inject, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';

import { KuiCheckboxDirective, kuiMediaViewer } from '@kikita-labs/ui';

import { MediaViewerTile } from '@features/playground/pages/surfaces/media-viewer/components/media-viewer-tile';
import {
  MEDIA_VIEWER_GALLERY_SIZE,
  MEDIA_VIEWER_TILE_INDEXES,
} from '@features/playground/pages/surfaces/media-viewer/constants';
import { mediaViewerPhotoSrc } from '@features/playground/pages/surfaces/media-viewer/helpers';
import type { MediaViewerSelectionModel } from '@features/playground/pages/surfaces/media-viewer/interfaces';
import { MediaViewerPhotos } from '@features/playground/pages/surfaces/media-viewer/services';
import { TranslocoPipe } from '@jsverse/transloco';

/** Shows the documented consumer composition of a selection checkbox beside each cover button. */
@Component({
  selector: 'app-media-viewer-select-example',
  imports: [FormField, KuiCheckboxDirective, MediaViewerTile, TranslocoPipe],
  templateUrl: './media-viewer-select-example.html',
  styleUrl: './media-viewer-select-example.scss',
})
export class MediaViewerSelectExample {
  private readonly openViewer = kuiMediaViewer();

  private readonly photos = inject(MediaViewerPhotos);

  protected readonly tileIndexes = MEDIA_VIEWER_TILE_INDEXES;

  protected readonly total = MEDIA_VIEWER_GALLERY_SIZE;

  protected readonly selectionModel = signal<MediaViewerSelectionModel>({
    selected: MEDIA_VIEWER_TILE_INDEXES.map(() => false),
  });

  protected readonly selectionForm = form(this.selectionModel);

  protected readonly selectedCount = computed(
    () => this.selectionModel().selected.filter(Boolean).length,
  );

  protected src(index: number): string {
    return mediaViewerPhotoSrc(index);
  }

  protected openAt(index: number): void {
    this.openViewer({ items: this.photos.items(MEDIA_VIEWER_GALLERY_SIZE), index });
  }
}

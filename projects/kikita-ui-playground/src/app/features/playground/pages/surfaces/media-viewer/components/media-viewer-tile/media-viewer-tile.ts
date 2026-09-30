import { Component, input, output } from '@angular/core';

/** Shows one photo as a cover button that asks the parent to open the viewer. */
@Component({
  selector: 'app-media-viewer-tile',
  templateUrl: './media-viewer-tile.html',
  styleUrl: './media-viewer-tile.scss',
})
export class MediaViewerTile {
  /** Image source shown as the tile cover. */
  readonly src = input.required<string>();

  /** Accessible name of the cover button. */
  readonly label = input.required<string>();

  /** Emits when the cover button is activated. */
  readonly opened = output<void>();
}

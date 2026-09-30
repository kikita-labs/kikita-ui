import { Component } from '@angular/core';

import { KuiTextDirective } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

import {
  MediaViewerDefaultExample,
  MediaViewerGridExample,
  MediaViewerOptionExamples,
  MediaViewerSelectExample,
  MediaViewerStateExamples,
} from './components';

/** Shows the Media Viewer opener from a default trigger, a photo grid, options, and photo states. */
@Component({
  selector: 'app-media-viewer',
  imports: [
    MediaViewerDefaultExample,
    MediaViewerGridExample,
    MediaViewerOptionExamples,
    MediaViewerSelectExample,
    MediaViewerStateExamples,
    PlaygroundExampleCard,
    KuiTextDirective,
    TranslocoPipe,
  ],
  templateUrl: './media-viewer.html',
  styleUrl: './media-viewer.scss',
})
export class MediaViewer {}

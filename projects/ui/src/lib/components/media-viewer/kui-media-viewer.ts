import { inject } from '@angular/core';

import type { Observable } from 'rxjs';

import { KuiDialog } from '../dialog/kui-dialog.service';
import { KuiMediaViewerDialog } from './kui-media-viewer.component';
import type { KuiMediaViewerData } from './kui-media-viewer.types';

/**
 * Returns a function that opens a fullscreen photo lightbox, on top of {@link KuiDialog}.
 * Must be called in an injection context (component/directive constructor or field initializer).
 *
 * Photos only -- video is out of scope. Grid layout, multi-select, and any per-tile checkbox are
 * the consumer's own composition around this opener, not part of its API: it only ever renders
 * the fullscreen lightbox.
 *
 * @example
 * ```typescript
 * private readonly openViewer = kuiMediaViewer();
 *
 * protected openPhotoAt(index: number): void {
 *   this.openViewer({ items: this.photos(), index });
 * }
 * ```
 */
export function kuiMediaViewer(): (data: KuiMediaViewerData) => Observable<void | undefined> {
  const service = inject(KuiDialog);

  return (data: KuiMediaViewerData) =>
    service.open(KuiMediaViewerDialog, {
      data,
      size: 'fullscreen',
      dismissable: true,
      closable: false,
    });
}

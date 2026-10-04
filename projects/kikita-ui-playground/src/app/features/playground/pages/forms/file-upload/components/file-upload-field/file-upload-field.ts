import { Component, signal } from '@angular/core';

import { KuiField, KuiFileUpload } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';
import type { KuiUploadFile } from '@kikita-labs/ui';

/** Shows File Upload as projected Field content with consumer-owned required feedback. */
@Component({
  selector: 'app-file-upload-field',
  imports: [KuiField, KuiFileUpload, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './file-upload-field.html',
})
export class FileUploadField {
  protected readonly files = signal<readonly KuiUploadFile[]>([]);
}

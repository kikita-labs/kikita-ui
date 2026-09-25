import { Component } from '@angular/core';

import { KuiFileUploadComponent, KuiTextDirective } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Presents the unconfigured default and every File Upload variant/mode pair. */
@Component({
  selector: 'app-file-upload-selection',
  imports: [KuiFileUploadComponent, KuiTextDirective, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './file-upload-selection.html',
  styleUrl: './file-upload-selection.scss',
})
export class FileUploadSelection {}

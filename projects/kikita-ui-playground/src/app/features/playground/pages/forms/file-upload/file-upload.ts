import { Component } from '@angular/core';

import { KuiTextDirective } from '@kikita-labs/ui';

import { TranslocoPipe } from '@jsverse/transloco';

import {
  FileUploadField,
  FileUploadSelection,
  FileUploadSizes,
  FileUploadStates,
  FileUploadValidation,
} from './components';

/** Shows the File Upload defaults, variations, validation, and controlled file states. */
@Component({
  selector: 'app-file-upload',
  imports: [
    FileUploadField,
    FileUploadSelection,
    FileUploadSizes,
    FileUploadStates,
    FileUploadValidation,
    KuiTextDirective,
    TranslocoPipe,
  ],
  templateUrl: './file-upload.html',
  styleUrl: './file-upload.scss',
})
export class FileUpload {}

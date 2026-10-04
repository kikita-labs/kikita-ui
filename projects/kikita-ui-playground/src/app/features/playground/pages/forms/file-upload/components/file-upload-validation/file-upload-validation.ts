import { Component, computed, signal } from '@angular/core';

import { KuiButton, KuiFileUpload } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';
import type { KuiUploadFile } from '@kikita-labs/ui';

/** Exposes picker validation, literal MIME matching, and single-file replacement. */
@Component({
  selector: 'app-file-upload-validation',
  imports: [KuiButton, KuiFileUpload, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './file-upload-validation.html',
  styleUrl: './file-upload-validation.scss',
})
export class FileUploadValidation {
  protected readonly acceptedTypes: readonly string[] = ['image/png'];

  protected readonly files = signal<readonly KuiUploadFile[]>([]);

  protected readonly singleFiles = signal<readonly KuiUploadFile[]>([]);

  protected readonly hasPendingFile = computed(() =>
    this.files().some((file) => file.status === 'pending'),
  );

  protected readonly hasUploadingFile = computed(() =>
    this.files().some((file) => file.status === 'uploading'),
  );

  protected startUpload(): void {
    this.files.update((current) => {
      const pending = current.find((file) => file.status === 'pending');
      if (!pending) return current;

      return current.map((file) =>
        file.id === pending.id ? { ...file, status: 'uploading', progress: 35 } : file,
      );
    });
  }

  protected finishUpload(): void {
    this.files.update((current) =>
      current.map((file) =>
        file.status === 'uploading' ? { ...file, status: 'success', progress: 100 } : file,
      ),
    );
  }
}

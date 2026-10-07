import { afterNextRender, Component, DestroyRef, inject, signal } from '@angular/core';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { KuiFileUpload, KuiText } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import type { KuiUploadFile } from '@kikita-labs/ui';

import { createFileUploadDemoEntry } from '../../helpers';

/** Compares dedicated File Upload sizes and native disabled picker states. */
@Component({
  selector: 'app-file-upload-sizes',
  imports: [KuiFileUpload, KuiText, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './file-upload-sizes.html',
  styleUrl: './file-upload-sizes.scss',
})
export class FileUploadSizes {
  private readonly destroyRef = inject(DestroyRef);

  private readonly transloco = inject(TranslocoService);

  protected readonly files = signal<readonly KuiUploadFile[]>([]);

  constructor() {
    afterNextRender(() => {
      let seeded = false;

      this.transloco
        .selectTranslate('errors.network', {}, { scope: 'file-upload' })
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((message) => {
          if (!seeded) {
            this.files.set([
              createFileUploadDemoEntry(
                'size-report',
                'size-report.pdf',
                'application/pdf',
                5_400,
                'success',
              ),
              createFileUploadDemoEntry(
                'disabled-retry',
                'disabled-retry.zip',
                'application/zip',
                4_800,
                'error',
                { errorMsg: message },
              ),
            ]);
            seeded = true;
            return;
          }

          this.files.update((current) =>
            current.map((file) =>
              file.id === 'disabled-retry' && file.status === 'error'
                ? { ...file, errorMsg: message }
                : file,
            ),
          );
        });
    });
  }

  protected onRetry(entry: KuiUploadFile): void {
    this.files.update((current) =>
      current.map((file) =>
        file.id === entry.id
          ? { ...file, status: 'uploading', progress: 35, errorMsg: undefined }
          : file,
      ),
    );
  }
}

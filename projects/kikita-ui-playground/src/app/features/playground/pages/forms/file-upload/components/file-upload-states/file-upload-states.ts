import { afterNextRender, Component, DestroyRef, inject, signal } from '@angular/core';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { KuiFileUpload } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import type { KuiUploadFile } from '@kikita-labs/ui';

import { createFileUploadStateEntries } from '../../helpers';

/** Shows all consumer-owned File Upload row states with deterministic seeded files. */
@Component({
  selector: 'app-file-upload-states',
  imports: [KuiFileUpload, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './file-upload-states.html',
})
export class FileUploadStates {
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
            this.files.set(createFileUploadStateEntries(message));
            seeded = true;
            return;
          }

          this.files.update((current) =>
            current.map((file) =>
              file.id === 'state-archive' && file.status === 'error'
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

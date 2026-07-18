import type { ElementRef, WritableSignal } from '@angular/core';
import {
  Component,
  DestroyRef,
  effect,
  inject,
  signal,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';

import { KuiButtonDirective, KuiFieldComponent, KuiFileUploadComponent } from '@kikita-labs/ui';

import type { KuiUploadFile } from '@kikita-labs/ui';

import { PlaygroundPanelComponent } from '../../shared/panel/panel.component';

const DROPZONE_ACCEPT: readonly string[] = ['image/png', 'image/jpeg'];
const DROPZONE_MAX_SIZE = 10 * 1024 * 1024;
const COMPACT_MAX_SIZE = 5 * 1024 * 1024;

const TINY_GIF_BASE64 = 'R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';

function tinyImageFile(name: string): File {
  const binary = atob(TINY_GIF_BASE64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new File([bytes], name, { type: 'image/gif' });
}

function staticFile(name: string, type: string): File {
  return new File([], name, { type });
}

function staticEntry(
  id: string,
  file: File,
  size: number,
  status: KuiUploadFile['status'],
  extra: Partial<KuiUploadFile> = {},
): KuiUploadFile {
  return { id, file, name: file.name, size, type: file.type, status, ...extra };
}

const ITEM_STATE_FILES: readonly KuiUploadFile[] = [
  staticEntry('demo-uploading', tinyImageFile('photo.png'), 2_100_000, 'uploading', {
    progress: 68,
  }),
  staticEntry('demo-success', staticFile('report.pdf', 'application/pdf'), 540_000, 'success'),
  staticEntry(
    'demo-error',
    staticFile('invalid.exe', 'application/x-msdownload'),
    12_000,
    'error',
    {
      errorMsg: 'Invalid file type',
    },
  ),
  staticEntry(
    'demo-pending',
    staticFile('archive-2026.zip', 'application/zip'),
    14_800_000,
    'pending',
  ),
];

const SIZE_DEMO_FILE: readonly KuiUploadFile[] = [
  staticEntry('size-demo', staticFile('report.pdf', 'application/pdf'), 540_000, 'success'),
];

@Component({
  selector: 'app-file-upload-page',
  templateUrl: './file-upload.page.html',
  styleUrl: './file-upload.page.scss',
  encapsulation: ViewEncapsulation.None,
  imports: [
    KuiFileUploadComponent,
    KuiFieldComponent,
    KuiButtonDirective,
    PlaygroundPanelComponent,
  ],
})
export class FileUploadPage {
  protected readonly dropzoneAccept = DROPZONE_ACCEPT;
  protected readonly dropzoneMaxSize = DROPZONE_MAX_SIZE;
  protected readonly compactMaxSize = COMPACT_MAX_SIZE;

  protected readonly dropzoneFiles = signal<readonly KuiUploadFile[]>([]);
  protected readonly compactFiles = signal<readonly KuiUploadFile[]>([]);
  protected readonly singleFiles = signal<readonly KuiUploadFile[]>([]);
  protected readonly statesFiles = signal<readonly KuiUploadFile[]>([]);
  protected readonly avatarFiles = signal<readonly KuiUploadFile[]>([]);
  protected readonly docFiles = signal<readonly KuiUploadFile[]>([]);

  protected readonly itemStateFiles = ITEM_STATE_FILES;
  protected readonly sizeSmFiles = SIZE_DEMO_FILE;
  protected readonly sizeMdFiles = SIZE_DEMO_FILE;
  protected readonly sizeLgFiles = SIZE_DEMO_FILE;
  protected readonly themeFiles = SIZE_DEMO_FILE;
  protected readonly mobileFiles = ITEM_STATE_FILES.slice(1, 2);

  private readonly dzStatesHost = viewChild<ElementRef<HTMLElement>>('dzStatesHost');
  private readonly intervals = new Map<string, ReturnType<typeof setInterval>>();

  constructor() {
    effect(() => this.beginPendingUploads(this.dropzoneFiles(), this.dropzoneFiles));
    effect(() => this.beginPendingUploads(this.compactFiles(), this.compactFiles));
    effect(() => this.beginPendingUploads(this.singleFiles(), this.singleFiles));

    inject(DestroyRef).onDestroy(() => {
      for (const interval of this.intervals.values()) clearInterval(interval);
      this.intervals.clear();
    });
  }

  protected onRetry(
    entry: KuiUploadFile,
    files: WritableSignal<readonly KuiUploadFile[]>,
    accept?: readonly string[],
    maxSize?: number,
  ): void {
    // Retry restarts the upload transport, not client-side validation — a file that still fails
    // accept/maxSize can't be fixed by retrying, so leave it in its error state.
    const stillWrongType = !!accept?.length && !accept.includes(entry.type);
    const stillTooLarge = maxSize !== undefined && entry.size > maxSize;
    if (stillWrongType || stillTooLarge) return;

    files.update((list) =>
      list.map((f) => (f.id === entry.id ? { ...f, status: 'pending', errorMsg: undefined } : f)),
    );
  }

  protected simulateDrag(kind: 'valid' | 'invalid' | 'leave'): void {
    const zone = this.dzStatesHost()?.nativeElement.querySelector<HTMLElement>(
      '.kui-file-upload-dropzone',
    );
    if (!zone) return;

    // A real browser drag pairs every dragenter with a dragleave; these isolated demo clicks
    // don't, so force the component's internal drag counter back to 0 before each gesture.
    for (let i = 0; i < 3; i++) {
      zone.dispatchEvent(new DragEvent('dragleave', { bubbles: true }));
    }
    if (kind === 'leave') return;

    const dt = new DataTransfer();
    const file =
      kind === 'valid'
        ? new File([], 'photo.png', { type: 'image/png' })
        : staticFile('script.exe', 'application/x-msdownload');
    dt.items.add(file);
    zone.dispatchEvent(
      new DragEvent('dragenter', { dataTransfer: dt, bubbles: true, cancelable: true }),
    );
  }

  private beginPendingUploads(
    files: readonly KuiUploadFile[],
    target: WritableSignal<readonly KuiUploadFile[]>,
  ): void {
    for (const f of files) {
      if (f.status === 'pending' && !this.intervals.has(f.id)) {
        this.beginUpload(f, target);
      }
    }
  }

  private beginUpload(
    entry: KuiUploadFile,
    target: WritableSignal<readonly KuiUploadFile[]>,
  ): void {
    target.update((list) =>
      list.map((f) => (f.id === entry.id ? { ...f, status: 'uploading', progress: 0 } : f)),
    );

    const interval = setInterval(() => {
      let done = false;
      target.update((list) =>
        list.map((f) => {
          if (f.id !== entry.id) return f;
          const next = Math.min(100, (f.progress ?? 0) + 8 + Math.random() * 14);
          if (next >= 100) {
            done = true;
            return { ...f, progress: 100, status: 'success' };
          }
          return { ...f, progress: next };
        }),
      );
      if (done) {
        clearInterval(interval);
        this.intervals.delete(entry.id);
      }
    }, 220);
    this.intervals.set(entry.id, interval);
  }
}

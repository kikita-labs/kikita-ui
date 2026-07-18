import {
  Component,
  DestroyRef,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';

import { KuiSize } from '../../types';
import {
  KUI_CHECK_D,
  KUI_CIRCLE_ALERT_CIRCLE,
  KUI_CIRCLE_ALERT_DOT,
  KUI_CIRCLE_ALERT_LINE,
  KUI_CLOUD_UPLOAD_D,
  KUI_FILE_D,
  KUI_PLUS_MINI_D,
  KUI_X_D,
} from '../../utils/kui-chrome-icon-paths.util';
import { KuiButtonDirective } from '../button';
import { KuiFieldActionDirective } from '../field';
import { KuiProgressComponent } from '../progress';
import { KuiUploadFile, KuiUploadFileStatus } from './kui-upload-file.interface';

let nextInstanceId = 0;

/** Visual layout of `kui-file-upload`. */
export type KuiFileUploadVariant = 'dropzone' | 'compact';

/** Selection behavior of `kui-file-upload`. `single` replaces the current file on re-selection. */
export type KuiFileUploadMode = 'single' | 'multiple';

/** Drag-over state of the `dropzone` variant's drop target. */
type KuiFileUploadDragState = 'none' | 'over' | 'invalid';

interface KuiFileKind {
  readonly label: string;
  readonly cat: 'pdf' | 'doc' | 'zip' | 'other';
}

function formatBytes(bytes: number): string {
  if (bytes >= 1_000_000) {
    return `${(bytes / 1_000_000).toFixed(1)} MB`;
  }
  return `${Math.round(bytes / 1_000)} KB`;
}

function detectKind(name: string): KuiFileKind | null {
  const parts = name.split('.');
  if (parts.length < 2) return null;
  const ext = parts.pop()!.toLowerCase();
  if (ext === 'pdf') return { label: 'PDF', cat: 'pdf' };
  if (ext === 'doc' || ext === 'docx') return { label: 'DOC', cat: 'doc' };
  if (ext === 'zip' || ext === 'rar' || ext === '7z') return { label: 'ZIP', cat: 'zip' };
  return { label: ext.slice(0, 4).toUpperCase(), cat: 'other' };
}

/**
 * File picker with an optional drag-and-drop dropzone, a file list with per-item progress and
 * error state, and client-side `accept`/`maxSize`/`maxCount` validation.
 *
 * `kui-file-upload` is a controlled component: it never performs network transport itself. New
 * selections are appended to the two-way `files` model as `pending` (or `error`, when validation
 * fails). The consumer drives the actual upload by writing `uploading`/`success`/`error` and
 * `progress` back onto the same entries, and restarts a failed one in response to `(retry)`.
 *
 * @example
 * ```html
 * <kui-file-upload
 *   acceptLabel="PNG, JPG up to 10 MB"
 *   [accept]="['image/png', 'image/jpeg']"
 *   [maxSize]="10 * 1024 * 1024"
 *   [maxCount]="5"
 *   [(files)]="files"
 *   (retry)="onRetry($event)"
 * />
 * ```
 */
@Component({
  selector: 'kui-file-upload',
  templateUrl: './kui-file-upload.component.html',
  imports: [KuiButtonDirective, KuiFieldActionDirective, KuiProgressComponent],
  host: {
    class: 'kui-file-upload',
    '[attr.data-kui-size]': 'size()',
    '[attr.data-kui-variant]': 'variant()',
    '[attr.data-kui-disabled]': 'disabled() ? "" : null',
  },
  encapsulation: ViewEncapsulation.None,
})
/** Provides a drag-and-drop file upload surface with native file input semantics. */
export class KuiFileUploadComponent {
  protected readonly _cloudUploadD = KUI_CLOUD_UPLOAD_D;
  protected readonly _plusMiniD = KUI_PLUS_MINI_D;
  protected readonly _circleAlertCircle = KUI_CIRCLE_ALERT_CIRCLE;
  protected readonly _circleAlertLine = KUI_CIRCLE_ALERT_LINE;
  protected readonly _circleAlertDot = KUI_CIRCLE_ALERT_DOT;
  protected readonly _checkD = KUI_CHECK_D;
  protected readonly _fileD = KUI_FILE_D;
  protected readonly _xD = KUI_X_D;

  /** Full drag-and-drop dropzone, or a compact button-only trigger. Defaults to dropzone. */
  readonly variant = input<KuiFileUploadVariant>('dropzone');

  /** Whether re-selecting replaces the current file (`single`) or appends (`multiple`). */
  readonly mode = input<KuiFileUploadMode>('multiple');

  /** Allowed MIME types. Omit to accept any file type. */
  readonly accept = input<readonly string[] | undefined>();

  /** Format/limit hint text rendered under the dropzone or compact trigger. */
  readonly acceptLabel = input<string | undefined>();

  /** Maximum file size in bytes. Omit for no size limit. */
  readonly maxSize = input<number | undefined>();

  /** Maximum number of files (`multiple` mode only). Omit for no count limit. */
  readonly maxCount = input<number | undefined>();

  /** Row height and thumbnail size. Only `sm`/`md`/`lg` have dedicated styling. */
  readonly size = input<KuiSize>('md');

  /** Disables the dropzone/trigger and stops it from reacting to drag/click/keyboard. */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Controlled list of selected files with their status/progress. Supports two-way binding. */
  readonly files = model<readonly KuiUploadFile[]>([]);

  /** Emits the file entry when its retry action is activated. Does not change `files` itself. */
  readonly retry = output<KuiUploadFile>();

  protected readonly dragState = signal<KuiFileUploadDragState>('none');
  protected readonly formError = signal<string | null>(null);
  protected readonly hasFiles = computed(() => this.files().length > 0);

  protected readonly dropzoneAriaLabel = computed(() => {
    const base = 'Upload file. Drag and drop or click to browse.';
    const hint = this.acceptLabel();
    return hint ? `${base} ${hint}` : base;
  });

  protected readonly acceptAttr = computed(() => this.accept()?.join(',') ?? null);

  private readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');
  private readonly instanceId = nextInstanceId++;
  private idSeq = 0;
  private dragCounter = 0;
  private readonly previewUrls = new Map<string, string>();

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      for (const url of this.previewUrls.values()) this.revokeUrl(url);
      this.previewUrls.clear();
    });
  }

  protected isImage(entry: KuiUploadFile): boolean {
    return entry.type.startsWith('image/');
  }

  protected kind(entry: KuiUploadFile): KuiFileKind | null {
    return detectKind(entry.name);
  }

  protected sizeLabel(entry: KuiUploadFile): string {
    return formatBytes(entry.size);
  }

  protected progressPct(entry: KuiUploadFile): number {
    return Math.round(Math.max(0, Math.min(100, entry.progress ?? 0)));
  }

  protected previewUrl(entry: KuiUploadFile): string | null {
    if (!this.isImage(entry)) return null;

    let url = this.previewUrls.get(entry.id);
    if (!url && typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
      url = URL.createObjectURL(entry.file);
      this.previewUrls.set(entry.id, url);
    }
    return url ?? null;
  }

  protected onZoneClick(): void {
    if (!this.disabled()) this.openPicker();
  }

  protected onTriggerClick(event: Event): void {
    event.stopPropagation();
    if (!this.disabled()) this.openPicker();
  }

  protected onZoneKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    if (!this.disabled()) this.openPicker();
  }

  protected onInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.addFiles(input.files);
    input.value = '';
  }

  protected onDragEnter(event: DragEvent): void {
    if (this.disabled()) return;
    event.preventDefault();
    this.dragCounter++;
    this.dragState.set(this.isDragValid(event) ? 'over' : 'invalid');
  }

  protected onDragOver(event: DragEvent): void {
    if (this.disabled()) return;
    event.preventDefault();
  }

  protected onDragLeave(event: DragEvent): void {
    if (this.disabled()) return;
    event.preventDefault();
    this.dragCounter = Math.max(0, this.dragCounter - 1);
    if (this.dragCounter === 0) this.dragState.set('none');
  }

  protected onDrop(event: DragEvent): void {
    if (this.disabled()) return;
    event.preventDefault();
    this.dragCounter = 0;
    this.dragState.set('none');
    this.addFiles(event.dataTransfer?.files ?? null);
  }

  protected onItemKeydown(event: KeyboardEvent, entry: KuiUploadFile): void {
    if (event.key !== 'Delete' && event.key !== 'Backspace') return;
    event.preventDefault();
    this.removeFile(entry);
  }

  protected removeFile(entry: KuiUploadFile): void {
    const url = this.previewUrls.get(entry.id);
    if (url) {
      this.revokeUrl(url);
      this.previewUrls.delete(entry.id);
    }
    this.files.set(this.files().filter((f) => f.id !== entry.id));
    this.formError.set(null);
  }

  protected onRetryClick(entry: KuiUploadFile, event: Event): void {
    event.stopPropagation();
    this.retry.emit(entry);
  }

  private openPicker(): void {
    this.fileInput()?.nativeElement.click();
  }

  private revokeUrl(url: string): void {
    if (typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function') {
      URL.revokeObjectURL(url);
    }
  }

  private isDragValid(event: DragEvent): boolean {
    const accepted = this.accept();
    if (!accepted || !accepted.length) return true;

    const items = event.dataTransfer?.items;
    if (!items) return true;

    for (const item of Array.from(items)) {
      if (item.kind === 'file' && item.type && !accepted.includes(item.type)) return false;
    }
    return true;
  }

  private nextId(): string {
    return `kui-file-upload-${this.instanceId}-${this.idSeq++}`;
  }

  private buildEntry(file: File): KuiUploadFile {
    const accepted = this.accept();
    const maxSizeVal = this.maxSize();

    let status: KuiUploadFileStatus = 'pending';
    let errorMsg: string | undefined;

    if (accepted && accepted.length && !accepted.includes(file.type)) {
      status = 'error';
      errorMsg = 'Invalid file type';
    } else if (maxSizeVal !== undefined && file.size > maxSizeVal) {
      status = 'error';
      errorMsg = `Exceeds max size (max ${formatBytes(maxSizeVal)})`;
    }

    return {
      id: this.nextId(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      status,
      errorMsg,
    };
  }

  private addFiles(fileList: FileList | null | undefined): void {
    const picked = fileList ? Array.from(fileList) : [];
    if (!picked.length) return;

    if (this.mode() === 'single') {
      this.formError.set(null);
      this.files.set([this.buildEntry(picked[0])]);
      return;
    }

    const maxCountVal = this.maxCount();
    const next = [...this.files()];
    let error: string | null = null;

    for (const file of picked) {
      if (maxCountVal !== undefined && next.length >= maxCountVal) {
        error = `Maximum ${maxCountVal} files`;
        break;
      }
      next.push(this.buildEntry(file));
    }

    this.formError.set(error);
    this.files.set(next);
  }
}

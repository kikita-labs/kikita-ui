import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { KuiFileUploadComponent } from './kui-file-upload.component';
import { KuiFileUploadMode, KuiFileUploadVariant } from './kui-file-upload.component';
import { KuiUploadFile } from './kui-upload-file.interface';

function makeFile(name: string, type: string, size: number): File {
  return new File([new Uint8Array(size)], name, { type });
}

function fileListOf(...files: File[]): FileList {
  const list: Partial<FileList> & { [index: number]: File } = { length: files.length };
  files.forEach((file, i) => (list[i] = file));
  list.item = (i: number) => files[i] ?? null;
  return list as FileList;
}

@Component({
  imports: [KuiFileUploadComponent],
  template: `
    <kui-file-upload
      [variant]="variant()"
      [mode]="mode()"
      [accept]="accept()"
      [maxSize]="maxSize()"
      [maxCount]="maxCount()"
      [disabled]="disabled()"
      [(files)]="files"
      (retry)="onRetry($event)"
    />
  `,
})
class FileUploadHost {
  readonly variant = signal<KuiFileUploadVariant>('dropzone');
  readonly mode = signal<KuiFileUploadMode>('multiple');
  readonly accept = signal<readonly string[] | undefined>(undefined);
  readonly maxSize = signal<number | undefined>(undefined);
  readonly maxCount = signal<number | undefined>(undefined);
  readonly disabled = signal(false);
  readonly files = signal<readonly KuiUploadFile[]>([]);
  readonly retried: KuiUploadFile[] = [];

  onRetry(entry: KuiUploadFile): void {
    this.retried.push(entry);
  }
}

describe('KuiFileUploadComponent', () => {
  let fixture: ComponentFixture<FileUploadHost>;
  let host: FileUploadHost;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [FileUploadHost] });
    fixture = TestBed.createComponent(FileUploadHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  function dropzone(): HTMLElement {
    return fixture.nativeElement.querySelector('.kui-file-upload-dropzone');
  }

  function nativeInput(): HTMLInputElement {
    return fixture.nativeElement.querySelector('.kui-file-upload-sr-input');
  }

  function items(): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.kui-file-upload-item'));
  }

  function selectFiles(...files: File[]): void {
    const input = nativeInput();
    Object.defineProperty(input, 'files', { value: fileListOf(...files), configurable: true });
    input.dispatchEvent(new Event('change'));
    fixture.detectChanges();
  }

  it('renders a role=button dropzone with an accessible name by default', () => {
    const zone = dropzone();
    expect(zone.getAttribute('role')).toBe('button');
    expect(zone.getAttribute('aria-label')).toContain('Upload file');
  });

  it('adds a picked file as a pending entry', () => {
    selectFiles(makeFile('report.pdf', 'application/pdf', 1000));

    expect(host.files().length).toBe(1);
    expect(host.files()[0].status).toBe('pending');
    expect(host.files()[0].name).toBe('report.pdf');
    expect(items().length).toBe(1);
  });

  it('rejects a file whose type is not in accept and marks it as error', () => {
    host.accept.set(['image/png']);
    fixture.detectChanges();

    selectFiles(makeFile('script.exe', 'application/x-msdownload', 1000));

    expect(host.files().length).toBe(1);
    expect(host.files()[0].status).toBe('error');
    expect(host.files()[0].errorMsg).toBe('Invalid file type');
  });

  it('rejects a file over maxSize and marks it as error', () => {
    host.maxSize.set(100);
    fixture.detectChanges();

    selectFiles(makeFile('big.zip', 'application/zip', 1000));

    expect(host.files()[0].status).toBe('error');
    expect(host.files()[0].errorMsg).toContain('Exceeds max size');
  });

  it('stops adding once maxCount is reached and surfaces a form error', () => {
    host.maxCount.set(1);
    fixture.detectChanges();

    selectFiles(makeFile('a.txt', 'text/plain', 10), makeFile('b.txt', 'text/plain', 10));

    expect(host.files().length).toBe(1);
    expect(
      fixture.nativeElement.querySelector('.kui-file-upload-form-error')?.textContent,
    ).toContain('Maximum 1 files');
  });

  it('single mode replaces the previous file on re-selection', () => {
    host.mode.set('single');
    fixture.detectChanges();

    selectFiles(makeFile('first.txt', 'text/plain', 10));
    expect(host.files().length).toBe(1);
    expect(host.files()[0].name).toBe('first.txt');

    selectFiles(makeFile('second.txt', 'text/plain', 10));
    expect(host.files().length).toBe(1);
    expect(host.files()[0].name).toBe('second.txt');
  });

  it('remove button removes the entry from the model', () => {
    selectFiles(makeFile('a.txt', 'text/plain', 10));
    fixture.detectChanges();

    items()[0].querySelector<HTMLButtonElement>('.kui-file-upload-item-actions button')!.click();
    fixture.detectChanges();

    expect(host.files().length).toBe(0);
  });

  it('Delete key on a focused item removes it', () => {
    selectFiles(makeFile('a.txt', 'text/plain', 10));
    fixture.detectChanges();

    items()[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete' }));
    fixture.detectChanges();

    expect(host.files().length).toBe(0);
  });

  it('retry button emits the entry without mutating the model', () => {
    host.files.set([
      {
        id: 'f1',
        file: makeFile('a.txt', 'text/plain', 10),
        name: 'a.txt',
        size: 10,
        type: 'text/plain',
        status: 'error',
        errorMsg: 'Invalid file type',
      },
    ]);
    fixture.detectChanges();

    (
      fixture.nativeElement.querySelector('.kui-file-upload-item-retry') as HTMLButtonElement
    ).click();
    fixture.detectChanges();

    expect(host.retried.length).toBe(1);
    expect(host.retried[0].id).toBe('f1');
    expect(host.files()[0].status).toBe('error');
  });

  it('Enter on the dropzone opens the native picker', () => {
    const input = nativeInput();
    const clickSpy = vi.spyOn(input, 'click');

    dropzone().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

    expect(clickSpy).toHaveBeenCalled();
  });

  it('disabled dropzone ignores click and is out of the tab order', () => {
    host.disabled.set(true);
    fixture.detectChanges();

    const input = nativeInput();
    const clickSpy = vi.spyOn(input, 'click');

    expect(dropzone().tabIndex).toBe(-1);
    dropzone().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(clickSpy).not.toHaveBeenCalled();
  });

  it('drag enter/leave toggles data-kui-drag on the dropzone', () => {
    // jsdom has no DragEvent constructor; a plain Event carries preventDefault(), which is all
    // the component reads off it when dataTransfer is absent.
    const zone = dropzone();

    zone.dispatchEvent(new Event('dragenter', { cancelable: true }));
    fixture.detectChanges();
    expect(zone.getAttribute('data-kui-drag')).toBe('over');

    zone.dispatchEvent(new Event('dragleave', { cancelable: true }));
    fixture.detectChanges();
    expect(zone.getAttribute('data-kui-drag')).toBe('none');
  });

  it('compact variant renders a trigger button and no dropzone', () => {
    host.variant.set('compact');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.kui-file-upload-dropzone')).toBeNull();
    expect(fixture.nativeElement.querySelector('.kui-file-upload-compact-trigger')).toBeTruthy();
  });
});

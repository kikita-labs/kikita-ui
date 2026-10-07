import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { describe, expect, it } from 'vitest';

import { KuiI18n } from '../../i18n/kui-i18n';
import { provideKikitaUi } from '../../root';
import { KuiFileUpload } from './kui-file-upload';
import type { KuiUploadFile } from './kui-upload-file.interface';

function entry(status: KuiUploadFile['status'], extra: Partial<KuiUploadFile> = {}): KuiUploadFile {
  return {
    id: status,
    file: new File(['x'], 'report.txt', { type: 'text/plain' }),
    name: 'report.txt',
    size: 2_500_000,
    type: 'text/plain',
    status,
    progress: 40,
    ...extra,
  };
}

@Component({
  imports: [KuiFileUpload],
  template: `<kui-file-upload [files]="files()" [maxSize]="1000000" [messages]="messages()" />`,
})
class Host {
  readonly files = signal<readonly KuiUploadFile[]>([
    entry('uploading'),
    entry('error', { errorKind: 'size', errorMsg: 'stale text' }),
    entry('success', { size: 340_000 }),
  ]);
  readonly messages = signal<{ done?: string } | undefined>(undefined);
}

function setup(options: Parameters<typeof provideKikitaUi>[0] = {}) {
  TestBed.configureTestingModule({ providers: [provideKikitaUi(options)] });
  const fixture = TestBed.createComponent(Host);
  fixture.detectChanges();

  return { fixture, root: fixture.nativeElement as HTMLElement };
}

describe('KuiFileUpload messages and locale', () => {
  it('formats sizes and progress with the locale and names rows from the messages', () => {
    const { root } = setup({ locale: 'en-US' });
    const text = root.textContent ?? '';

    expect(text).toContain('2.5 MB');
    expect(text).toContain('340 kB');
    expect(text).toContain('40%');
    expect(root.querySelector('[aria-label="Uploading report.txt"]')).not.toBeNull();
    expect(root.querySelector('[aria-label="Remove report.txt"]')).not.toBeNull();
  });

  it('shows a size error in the active language and follows a language change', () => {
    const { fixture, root } = setup({ locale: 'en-US' });

    expect(root.textContent).toContain('Exceeds max size (max 1.0 MB)');
    expect(root.textContent).not.toContain('stale text');

    TestBed.inject(KuiI18n).setMessages({
      fileUpload: { tooLarge: ({ max }) => `Too big, limit ${max}` },
    });
    fixture.detectChanges();

    expect(root.textContent).toContain('Too big, limit 1.0 MB');
  });

  it('uses the decimal separator of the locale', () => {
    const { root } = setup({ locale: 'de-DE' });

    expect(root.textContent).toContain('2,5 MB');
  });

  it('lets the instance messages input win', () => {
    const { fixture, root } = setup({ messages: { fileUpload: { done: 'Finished' } } });

    expect(root.textContent).toContain('Finished');

    fixture.componentInstance.messages.set({ done: 'Complete' });
    fixture.detectChanges();

    expect(root.textContent).toContain('Complete');
  });
});

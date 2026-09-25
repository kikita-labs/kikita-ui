import type { KuiUploadFile } from '@kikita-labs/ui';

import { createFileUploadDemoEntry } from './file-upload-demo-file.helper';

function createPreviewEntry(): KuiUploadFile {
  const file = new File(
    [
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" fill="#8b5cf6"/><circle cx="20" cy="20" r="9" fill="#fff"/></svg>',
    ],
    'preview.svg',
    { type: 'image/svg+xml' },
  );

  return {
    id: 'state-preview',
    file,
    name: file.name,
    size: file.size,
    type: file.type,
    status: 'uploading',
    progress: 68,
  };
}

/** Creates deterministic status and file-kind examples after hydration. */
export function createFileUploadStateEntries(networkError: string): readonly KuiUploadFile[] {
  return [
    createPreviewEntry(),
    createFileUploadDemoEntry('state-pdf', 'report.pdf', 'application/pdf', 5_400, 'success'),
    createFileUploadDemoEntry(
      'state-docx',
      'handbook.docx',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      3_200,
      'pending',
    ),
    createFileUploadDemoEntry('state-archive', 'archive.zip', 'application/zip', 4_800, 'error', {
      errorMsg: networkError,
    }),
    createFileUploadDemoEntry('state-other', 'notes.txt', 'text/plain', 1_100, 'success'),
    createFileUploadDemoEntry('state-generic', 'LICENSE', 'text/plain', 900, 'pending'),
  ];
}

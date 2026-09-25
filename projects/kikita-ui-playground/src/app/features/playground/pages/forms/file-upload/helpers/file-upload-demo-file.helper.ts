import type { KuiUploadFile, KuiUploadFileStatus } from '@kikita-labs/ui';

/** Creates a native browser file and its matching File Upload row after hydration. */
export function createFileUploadDemoEntry(
  id: string,
  name: string,
  type: string,
  byteLength: number,
  status: KuiUploadFileStatus,
  details: Partial<Pick<KuiUploadFile, 'progress' | 'errorMsg'>> = {},
): KuiUploadFile {
  const file = new File([new Uint8Array(byteLength)], name, { type });

  return {
    id,
    file,
    name: file.name,
    size: file.size,
    type: file.type,
    status,
    ...details,
  };
}

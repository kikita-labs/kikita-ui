import { describe, expect, it, vi } from 'vitest';

import { KuiDialogRef } from './kui-dialog-ref';

describe('KuiDialogRef', () => {
  it('emits and completes when the dialog closes', () => {
    const ref = new KuiDialogRef<string>();
    const next = vi.fn();
    const complete = vi.fn();

    ref.afterClosed().subscribe({ next, complete });
    ref._complete('saved');

    expect(next).toHaveBeenCalledWith('saved');
    expect(complete).toHaveBeenCalledOnce();
  });
});

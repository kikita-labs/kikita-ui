import { describe, expect, it, vi } from 'vitest';

import { KuiDrawerRef } from './kui-drawer-ref';

describe('KuiDrawerRef', () => {
  it('emits and completes when the drawer closes', () => {
    const ref = new KuiDrawerRef<string>();
    const next = vi.fn();
    const complete = vi.fn();

    ref.afterClosed().subscribe({ next, complete });
    ref._complete('saved');

    expect(next).toHaveBeenCalledWith('saved');
    expect(complete).toHaveBeenCalledOnce();
  });
});

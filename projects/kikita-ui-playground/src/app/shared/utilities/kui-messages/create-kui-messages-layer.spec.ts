import type { KuiMessageContext } from '@kikita-labs/ui';
import { describe, expect, it } from 'vitest';

import { createKuiMessagesLayer } from './create-kui-messages-layer';

const context: KuiMessageContext = {
  locale: 'en-US',
  formatNumber: (value) => `#${value}`,
  plural: (count, forms) => (count === 1 ? (forms.one ?? forms.other) : forms.other),
};

describe('createKuiMessagesLayer', () => {
  it('returns an empty layer for a missing catalogue', () => {
    expect(createKuiMessagesLayer(undefined)).toEqual({});
  });

  it('keeps plain strings for messages that are strings in the library', () => {
    const layer = createKuiMessagesLayer({ pagination: { next: 'Forward' } });

    expect(layer.pagination?.next).toBe('Forward');
  });

  it('builds a function for messages that depend on values and formats numbers', () => {
    const layer = createKuiMessagesLayer({
      pagination: { summary: '{start}-{end} / {total}' },
    });
    const summary = layer.pagination?.summary as (p: unknown, c: KuiMessageContext) => string;

    expect(summary({ start: 1, end: 10, total: 48 }, context)).toBe('#1-#10 / #48');
  });

  it('leaves an unknown placeholder untouched and passes strings as they are', () => {
    const layer = createKuiMessagesLayer({ select: { removeItem: 'Drop {label} {missing}' } });
    const remove = layer.select?.removeItem as (p: unknown, c: KuiMessageContext) => string;

    expect(remove({ label: 'Tag' }, context)).toBe('Drop Tag {missing}');
  });

  it('selects plural variants by a numeric parameter', () => {
    const layer = createKuiMessagesLayer({
      fileUpload: {
        tooMany: { $select: 'max', one: 'Up to {max} file', other: 'Up to {max} files' },
      },
    });
    const tooMany = layer.fileUpload?.tooMany as (p: unknown, c: KuiMessageContext) => string;

    expect(tooMany({ max: 1 }, context)).toBe('Up to #1 file');
    expect(tooMany({ max: 3 }, context)).toBe('Up to #3 files');
  });

  it('selects variants by a boolean parameter', () => {
    const layer = createKuiMessagesLayer({
      pagination: { page: { $select: 'current', true: 'Page {page}, now', false: 'Page {page}' } },
    });
    const page = layer.pagination?.page as (p: unknown, c: KuiMessageContext) => string;

    expect(page({ page: 2, current: true }, context)).toBe('Page #2, now');
    expect(page({ page: 3, current: false }, context)).toBe('Page #3');
  });

  it('ignores groups and keys the library does not have', () => {
    const layer = createKuiMessagesLayer({
      unknownGroup: { a: 'x' },
      pagination: { unknownKey: 'y', next: 'Forward' },
    });

    expect(layer).toEqual({ pagination: { next: 'Forward' } });
  });
});

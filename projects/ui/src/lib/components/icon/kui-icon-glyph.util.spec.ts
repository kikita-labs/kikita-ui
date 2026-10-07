import type { KuiIconGlyph } from './kui-icon-glyph.type';
import { inspectKuiIconGlyph, pickKuiGlyph } from './kui-icon-glyph.util';

const CROSS: KuiIconGlyph = {
  node: [
    ['path', { d: 'M18 6 6 18' }],
    ['path', { d: 'm6 6 12 12' }],
  ],
};

describe('inspectKuiIconGlyph', () => {
  it('accepts allowed elements and defaults the view box to the 24 grid', () => {
    const { glyph, reason } = inspectKuiIconGlyph(CROSS);

    expect(reason).toBeUndefined();
    expect(glyph?.viewBox).toBe('0 0 24 24');
    expect(glyph?.nodes.map((node) => node.tag)).toEqual(['path', 'path']);
    expect(glyph?.nodes[0].attrs).toEqual({ d: 'M18 6 6 18' });
  });

  it('accepts the Lucide icon-node layout, including numbers and ignored children', () => {
    const lucide = {
      name: 'circle-check',
      size: 24,
      node: [
        ['circle', { cx: 12, cy: 12, r: 10 }],
        ['path', { d: 'm9 12 2 2 4-4' }, [['path', { d: 'ignored' }]]],
      ],
    };

    const { glyph } = inspectKuiIconGlyph(lucide);

    expect(glyph?.nodes[0].attrs).toEqual({ cx: '12', cy: '12', r: '10' });
    expect(glyph?.nodes).toHaveLength(2);
  });

  it('keeps a custom view box', () => {
    expect(inspectKuiIconGlyph({ ...CROSS, viewBox: '0 0 16 16' }).glyph?.viewBox).toBe(
      '0 0 16 16',
    );
  });

  it.each([
    ['null', null],
    ['a string', '<svg></svg>'],
    ['no node', {}],
    ['an empty node list', { node: [] }],
    ['a node that is not a tuple', { node: ['path'] }],
    ['an unsupported element', { node: [['script', { d: 'x' }]] }],
    ['a group', { node: [['g', {}]] }],
    ['an element without attributes', { node: [['path']] }],
    ['a malformed view box', { node: [['path', { d: 'M0 0' }]], viewBox: '0 0 big 24' }],
  ])('rejects %s with a reason', (_label, value) => {
    const inspection = inspectKuiIconGlyph(value);

    expect(inspection.glyph).toBeUndefined();
    expect(inspection.reason).toEqual(expect.any(String));
  });

  it('drops every attribute outside the allowlist', () => {
    const { glyph } = inspectKuiIconGlyph({
      node: [
        [
          'path',
          {
            d: 'M0 0',
            onload: 'alert(1)',
            onclick: 'alert(1)',
            style: 'stroke-width: 9',
            class: 'x',
            id: 'y',
            href: 'https://example.test',
            'xlink:href': 'https://example.test',
            'stroke-width': 9,
            'vector-effect': 'non-scaling-stroke',
          },
        ],
      ],
    });

    expect(glyph?.nodes[0].attrs).toEqual({ d: 'M0 0' });
  });

  it('drops values that reference resources or contain markup', () => {
    const { glyph } = inspectKuiIconGlyph({
      node: [
        [
          'path',
          {
            d: 'M0 0',
            fill: 'url(https://example.test/paint.svg#a)',
            stroke: 'URL (#a)',
            transform: '<script>',
            opacity: 'javascript:alert(1)',
          },
        ],
      ],
    });

    expect(glyph?.nodes[0].attrs).toEqual({ d: 'M0 0' });
  });

  it('drops oversized and non-scalar values', () => {
    const { glyph } = inspectKuiIconGlyph({
      node: [['path', { d: 'M'.repeat(9000), cx: { toString: () => '1' }, r: 3 }]],
    });

    expect(glyph?.nodes[0].attrs).toEqual({ r: '3' });
  });

  it('returns the same inspection for the same object', () => {
    expect(inspectKuiIconGlyph(CROSS)).toBe(inspectKuiIconGlyph(CROSS));
  });
});

describe('pickKuiGlyph', () => {
  const fallback: KuiIconGlyph = { node: [['path', { d: 'M0 0' }]] };
  const first: KuiIconGlyph = { node: [['path', { d: 'M1 1' }]] };
  const second: KuiIconGlyph = { node: [['path', { d: 'M2 2' }]] };

  afterEach(() => vi.restoreAllMocks());

  it('prefers the first valid candidate, then the fallback', () => {
    expect(pickKuiGlyph([first, second], fallback)).toBe(first);
    expect(pickKuiGlyph([undefined, second], fallback)).toBe(second);
    expect(pickKuiGlyph([undefined, undefined], fallback)).toBe(fallback);
  });

  it('skips an invalid candidate and warns once in development mode', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const broken = { node: [['script', {}]] } as unknown as KuiIconGlyph;

    expect(pickKuiGlyph([broken, second], fallback)).toBe(second);
    expect(pickKuiGlyph([broken, second], fallback)).toBe(second);

    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain('invalid icon glyph');
  });
});

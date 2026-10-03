import { parseKuiSvgToGlyph } from './kui-icon-svg-parse.util';

describe('parseKuiSvgToGlyph', () => {
  it('reads a Lucide-style file: every allowed element kind, with the view box', () => {
    const glyph = parseKuiSvgToGlyph(`<!-- c -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
  <rect x="3" y="4" width="18" height="18" rx="2"/>
  <circle cx="12" cy="12" r="10"></circle>
  <line x1="1" y1="2" x2="3" y2="4"/>
  <polyline points="1,2 3,4"/>
  <ellipse cx="1" cy="2" rx="3" ry="4"/>
  <path d="M0 0" fill="currentColor"/>
</svg>`);

    expect(glyph?.viewBox).toBe('0 0 24 24');
    expect(glyph?.node.map((node) => node[0])).toEqual([
      'rect',
      'circle',
      'line',
      'polyline',
      'ellipse',
      'path',
    ]);
    expect(glyph?.node[5][1]).toEqual({ d: 'M0 0', fill: 'currentColor' });
  });

  it('accepts single-quoted attributes and defaults the view box to the 24 grid', () => {
    const glyph = parseKuiSvgToGlyph("<svg><path d='M1 1'/></svg>");

    expect(glyph?.viewBox).toBe('0 0 24 24');
    expect(glyph?.node).toEqual([['path', { d: 'M1 1' }]]);
  });

  it.each([
    ['not svg', '<div><path d="M0 0"/></div>'],
    ['no closing tag', '<svg><path d="M0 0"/>'],
    ['empty', '<svg></svg>'],
    ['script', '<svg><script>alert(1)</script></svg>'],
    ['group', '<svg><g><path d="M0 0"/></g></svg>'],
    ['use', '<svg><use href="https://example.test/x.svg#a"/></svg>'],
    ['image', '<svg><image href="https://example.test/x.png"/></svg>'],
    ['style', '<svg><style>path{fill:red}</style><path d="M0 0"/></svg>'],
    ['foreignObject', '<svg><foreignObject><body onload="x"/></foreignObject></svg>'],
    ['text between elements', '<svg><path d="M0 0"/>hi</svg>'],
    ['CDATA', '<svg><![CDATA[<path d="M0 0"/>]]></svg>'],
    ['a stray bracket', '<svg><path d="M0 0>"/></svg>'],
    ['a bad view box', '<svg viewBox="0 0 x 24"><path d="M0 0"/></svg>'],
  ])('rejects %s', (_label, markup) => {
    expect(parseKuiSvgToGlyph(markup)).toBeUndefined();
  });

  it('drops event handlers, styles, links and references but keeps the element', () => {
    const glyph = parseKuiSvgToGlyph(
      `<svg><path d="M0 0" onclick="x()" style="fill:red" class="a" href="https://example.test" fill="url(#p)" stroke="currentColor"/></svg>`,
    );

    expect(glyph?.node).toEqual([['path', { d: 'M0 0', stroke: 'currentColor' }]]);
  });

  it('refuses oversized input', () => {
    expect(parseKuiSvgToGlyph(`<svg><path d="${'M'.repeat(70_000)}"/></svg>`)).toBeUndefined();
  });
});

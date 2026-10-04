import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { KuiGlyph } from './kui-glyph';
import type { KuiIconGlyph } from './kui-icon-glyph.type';

@Component({
  imports: [KuiGlyph],
  template: `<svg width="16" height="16" [kuiGlyph]="glyph()" [kuiGlyphStroke]="stroke()"></svg>`,
})
class GlyphHost {
  readonly glyph = signal<KuiIconGlyph | undefined>({
    node: [
      ['circle', { cx: 12, cy: 12, r: 10 }],
      ['path', { d: 'm9 12 2 2 4-4' }],
    ],
  });
  readonly stroke = signal<number | undefined>(1.6);
}

function render() {
  const fixture = TestBed.createComponent(GlyphHost);
  fixture.detectChanges();

  return {
    fixture,
    svg: fixture.nativeElement.querySelector('svg') as SVGSVGElement,
  };
}

describe('KuiGlyph', () => {
  it('renders the glyph as an inline svg that follows currentColor and is hidden from assistive technology', () => {
    const { svg } = render();

    expect(svg.classList.contains('kui-glyph')).toBe(true);
    expect(svg.getAttribute('viewBox')).toBe('0 0 24 24');
    expect(svg.getAttribute('fill')).toBe('none');
    expect(svg.getAttribute('stroke')).toBe('currentColor');
    expect(svg.getAttribute('stroke-linecap')).toBe('round');
    expect(svg.getAttribute('aria-hidden')).toBe('true');
    expect(svg.getAttribute('focusable')).toBe('false');
    expect(Array.from(svg.children).map((child) => child.tagName.toLowerCase())).toEqual([
      'circle',
      'path',
    ]);
    expect(svg.querySelector('circle')?.getAttribute('r')).toBe('10');
  });

  it('keeps stroke width out of the markup and passes the call-site default as a private property', () => {
    const { svg } = render();

    expect(svg.hasAttribute('stroke-width')).toBe(false);
    expect(svg.style.getPropertyValue('--_kui-glyph-stroke')).toBe('1.6');
    expect(svg.querySelector('path')?.hasAttribute('stroke-width')).toBe(false);
  });

  it('never renders attributes or elements outside the allowlist', () => {
    const { fixture, svg } = render();

    fixture.componentInstance.glyph.set({
      node: [
        [
          'path',
          { d: 'M0 0', onload: 'alert(1)', style: 'color:red', href: 'x', 'stroke-width': 9 },
        ],
        ['script', { d: 'x' }],
      ],
    });
    fixture.detectChanges();

    // A glyph with an unsupported element is invalid as a whole.
    expect(svg.children).toHaveLength(0);

    fixture.componentInstance.glyph.set({
      node: [
        [
          'path',
          { d: 'M0 0', onload: 'alert(1)', style: 'color:red', href: 'x', 'stroke-width': 9 },
        ],
      ],
    });
    fixture.detectChanges();

    const path = svg.querySelector('path') as SVGPathElement;

    expect(path.getAttribute('d')).toBe('M0 0');
    expect(path.getAttributeNames()).toEqual(['d']);
  });

  it('renders an empty svg for a missing glyph and updates when the glyph changes', () => {
    const { fixture, svg } = render();

    fixture.componentInstance.glyph.set(undefined);
    fixture.detectChanges();

    expect(svg.children).toHaveLength(0);
    expect(svg.getAttribute('viewBox')).toBe('0 0 24 24');

    fixture.componentInstance.glyph.set({
      viewBox: '0 0 16 16',
      node: [['path', { d: 'M3 8h10' }]],
    });
    fixture.detectChanges();

    expect(svg.getAttribute('viewBox')).toBe('0 0 16 16');
    expect(svg.querySelector('path')?.getAttribute('d')).toBe('M3 8h10');
  });
});

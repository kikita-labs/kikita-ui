import type { Renderer2 } from '@angular/core';
import { RendererStyleFlags2 } from '@angular/core';

import type { KuiIconGlyph } from './kui-icon-glyph.type';
import { inspectKuiIconGlyph, KUI_GLYPH_DEFAULT_VIEW_BOX } from './kui-icon-glyph.util';

/** Size and default line weight of a glyph created by {@link createKuiGlyphElement}. */
export interface KuiGlyphDomOptions {
  /** Width and height in pixels. */
  readonly size: number;

  /** Stroke width used when no `--kui-icon-stroke-width` token is set. */
  readonly strokeWidth: number;
}

/**
 * @internal Creates the same `<svg>` that `svg[kuiGlyph]` renders, for call sites that build DOM
 * imperatively (a directive that appends a button, for example).
 *
 * Only call it in the browser: appending nodes during server rendering would change the template
 * shape before hydration. The caller owns the element and must replace it when the glyph changes.
 */
export function createKuiGlyphElement(
  renderer: Renderer2,
  glyph: KuiIconGlyph,
  options: KuiGlyphDomOptions,
): SVGElement {
  const inspection = inspectKuiIconGlyph(glyph);
  const svg = renderer.createElement('svg', 'svg') as SVGElement;

  renderer.addClass(svg, 'kui-glyph');
  renderer.setAttribute(svg, 'viewBox', inspection.glyph?.viewBox ?? KUI_GLYPH_DEFAULT_VIEW_BOX);
  renderer.setAttribute(svg, 'width', String(options.size));
  renderer.setAttribute(svg, 'height', String(options.size));
  renderer.setAttribute(svg, 'fill', 'none');
  renderer.setAttribute(svg, 'stroke', 'currentColor');
  renderer.setAttribute(svg, 'stroke-linecap', 'round');
  renderer.setAttribute(svg, 'stroke-linejoin', 'round');
  renderer.setAttribute(svg, 'aria-hidden', 'true');
  renderer.setAttribute(svg, 'focusable', 'false');
  renderer.setStyle(
    svg,
    '--_kui-glyph-stroke',
    String(options.strokeWidth),
    RendererStyleFlags2.DashCase,
  );

  for (const node of inspection.glyph?.nodes ?? []) {
    const element = renderer.createElement(node.tag, 'svg') as SVGElement;

    for (const [name, value] of Object.entries(node.attrs)) {
      renderer.setAttribute(element, name, value);
    }

    renderer.appendChild(svg, element);
  }

  return svg;
}

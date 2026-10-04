import { Component, computed, input, ViewEncapsulation } from '@angular/core';

import type { KuiIconGlyph } from './kui-icon-glyph.type';
import { inspectKuiIconGlyph, KUI_GLYPH_DEFAULT_VIEW_BOX } from './kui-icon-glyph.util';

/**
 * @internal Draws a validated glyph as a real inline `<svg>`.
 *
 * The template lists every allowed element and attribute explicitly, so glyph data can never add
 * an element, handler or reference of its own. It uses no `innerHTML` and no sanitizer bypass, and
 * it renders synchronously, so the server HTML already contains the icon and hydration reuses it.
 *
 * Stroke width is CSS-driven: `--kui-icon-stroke-width` wins, then the site default given by
 * `kuiGlyphStroke`, then `2`. `--kui-icon-vector-effect: non-scaling-stroke` keeps the line width
 * constant at any icon size.
 */
@Component({
  selector: 'svg[kuiGlyph]',
  templateUrl: './kui-glyph.component.html',
  host: {
    class: 'kui-glyph',
    fill: 'none',
    stroke: 'currentColor',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'aria-hidden': 'true',
    focusable: 'false',
    '[attr.viewBox]': 'viewBox()',
    '[style.--_kui-glyph-stroke]': 'strokeWidth()',
  },
  encapsulation: ViewEncapsulation.None,
})
export class KuiGlyph {
  /** Glyph to draw. An invalid or missing glyph renders an empty `<svg>`. */
  readonly glyph = input<KuiIconGlyph | undefined>(undefined, { alias: 'kuiGlyph' });

  /** Stroke width this call site uses when no `--kui-icon-stroke-width` token is set. */
  readonly strokeWidth = input<number | undefined>(undefined, { alias: 'kuiGlyphStroke' });

  private readonly inspection = computed(() => inspectKuiIconGlyph(this.glyph()));

  protected readonly nodes = computed(() => this.inspection().glyph?.nodes ?? []);

  protected readonly viewBox = computed(
    () => this.inspection().glyph?.viewBox ?? KUI_GLYPH_DEFAULT_VIEW_BOX,
  );
}

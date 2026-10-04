import { Component, inject, ViewEncapsulation } from '@angular/core';

import { KuiDefaults } from '../../providers/kui-defaults';
import { injectKuiGlyph } from '../icon/inject-kui-glyph';
import { KUI_GLYPH_CHEVRON_RIGHT } from '../icon/kui-chrome-glyphs';
import { KuiGlyph } from '../icon/kui-glyph';

/**
 * Decorative chevron separator between crumbs inside a `[kuiBreadcrumbs]` trail.
 * Renders as `aria-hidden` and is never read by assistive technology.
 *
 * @example
 * ```html
 * <li><a kuiBreadcrumbItem href="/components">Components</a></li>
 * <li kuiBreadcrumbSeparator></li>
 * <li><span kuiBreadcrumbItem current>Icon Button</span></li>
 * ```
 */
@Component({
  imports: [KuiGlyph],
  selector: 'li[kuiBreadcrumbSeparator]',
  template: `
    <svg width="14" height="14" [kuiGlyph]="separatorGlyph()" [kuiGlyphStroke]="1.5"></svg>
  `,
  host: {
    class: 'kui-breadcrumb-sep',
    'aria-hidden': 'true',
  },
  encapsulation: ViewEncapsulation.None,
})
/** Renders the default separator between breadcrumb items. */
export class KuiBreadcrumbSeparator {
  private readonly breadcrumbsDefaults = inject(KuiDefaults).get('breadcrumbs');

  protected readonly separatorGlyph = injectKuiGlyph({
    role: 'separator',
    slot: () => this.breadcrumbsDefaults()?.separatorIcon,
    fallback: KUI_GLYPH_CHEVRON_RIGHT,
  });
}

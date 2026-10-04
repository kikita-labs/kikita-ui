import { Component, inject, ViewEncapsulation } from '@angular/core';

import { KuiDefaults } from '../../providers/kui-defaults';
import { injectKuiGlyph } from '../icon/inject-kui-glyph';
import { KUI_GLYPH_EXTERNAL_LINK } from '../icon/kui-chrome-glyphs';
import { KuiGlyph } from '../icon/kui-glyph';

/**
 * @internal Static chrome glyph `[kuiLink]` inserts into its `iconEnd` slot when `external`
 * resolves to `true` and no explicit `iconEnd` is set. Fixed library chrome, not a
 * consumer-chosen icon -- drawn from synchronous icon data rather than through `kui-icon`, so it never
 * depends on the network or a consumer's icon registry.
 */
@Component({
  imports: [KuiGlyph],
  selector: 'kui-link-external-icon',
  template: `<svg [kuiGlyph]="glyph()" [kuiGlyphStroke]="2"></svg>`,
  host: { class: 'kui-link__icon-end', 'aria-hidden': 'true' },
  encapsulation: ViewEncapsulation.None,
})
export class KuiLinkExternalIcon {
  private readonly linkDefaults = inject(KuiDefaults).get('link');

  protected readonly glyph = injectKuiGlyph({
    role: 'externalLink',
    slot: () => this.linkDefaults()?.externalIcon,
    fallback: KUI_GLYPH_EXTERNAL_LINK,
  });
}

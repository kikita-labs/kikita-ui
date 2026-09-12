import { Component, ViewEncapsulation } from '@angular/core';

import { KUI_EXTERNAL_LINK_D } from '../../utils/kui-chrome-icon-paths.util';

/**
 * @internal Static chrome glyph `[kuiLink]` inserts into its `iconEnd` slot when `external`
 * resolves to `true` and no explicit `iconEnd` is set. Fixed library chrome, not a
 * consumer-chosen icon -- rendered as inline SVG rather than through `kui-icon`, so it never
 * depends on the network or a consumer's icon registry.
 */
@Component({
  selector: 'kui-link-external-icon',
  template: `
    <svg viewBox="0 0 24 24" fill="none">
      @for (d of paths; track d) {
        <path
          [attr.d]="d"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      }
    </svg>
  `,
  host: { class: 'kui-link__icon-end', 'aria-hidden': 'true' },
  encapsulation: ViewEncapsulation.None,
})
export class KuiLinkExternalIconComponent {
  protected readonly paths = KUI_EXTERNAL_LINK_D;
}

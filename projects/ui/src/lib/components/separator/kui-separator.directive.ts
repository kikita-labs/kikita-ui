import { Directive, input } from '@angular/core';

import { KuiSeparatorAppearance } from './kui-separator-appearance.type';
import { KuiSeparatorOrientation } from './kui-separator-orientation.type';
import { KuiSeparatorSpacing } from './kui-separator-spacing.type';

/** Applies Kikita UI separator styling to a native horizontal rule. */
@Directive({
  selector: 'hr[kuiSeparator]',
  host: {
    class: 'kui-separator',
    '[attr.data-kui-appearance]': 'appearance()',
    '[attr.data-kui-orientation]': 'orientation()',
    '[attr.data-kui-spacing]': 'spacing()',
    '[attr.aria-orientation]': 'orientation() === "vertical" ? "vertical" : null',
  },
})
export class KuiSeparatorDirective {
  /** Visual separator emphasis. */
  readonly appearance = input<KuiSeparatorAppearance>('default');

  /** Separator direction. */
  readonly orientation = input<KuiSeparatorOrientation>('horizontal');

  /** Outer spacing around the separator line. */
  readonly spacing = input<KuiSeparatorSpacing>('sm');
}

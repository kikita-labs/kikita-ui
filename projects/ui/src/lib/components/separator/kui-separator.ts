import { computed, Directive, inject, input } from '@angular/core';

import { KuiDefaults } from '../../providers/kui-defaults';
import type { KuiSeparatorAppearance } from './kui-separator-appearance.type';
import type { KuiSeparatorOrientation } from './kui-separator-orientation.type';
import type { KuiSeparatorSpacing } from './kui-separator-spacing.type';

/** Applies Kikita UI separator styling to a native horizontal rule. */
@Directive({
  selector: 'hr[kuiSeparator]',
  host: {
    class: 'kui-separator',
    '[attr.data-kui-appearance]': 'effectiveAppearance()',
    '[attr.data-kui-orientation]': 'effectiveOrientation()',
    '[attr.data-kui-spacing]': 'effectiveSpacing()',
    '[attr.aria-orientation]': 'effectiveOrientation() === "vertical" ? "vertical" : null',
  },
})
export class KuiSeparator {
  /** Visual separator emphasis. Defaults to `defaults.separator.appearance`, then `default`. */
  readonly appearance = input<KuiSeparatorAppearance | undefined>();

  /** Separator direction. Defaults to `defaults.separator.orientation`, then `horizontal`. */
  readonly orientation = input<KuiSeparatorOrientation | undefined>();

  /** Outer spacing around the separator line. Defaults to `defaults.separator.spacing`, then `sm`. */
  readonly spacing = input<KuiSeparatorSpacing | undefined>();

  private readonly separatorDefaults = inject(KuiDefaults).get('separator');

  protected readonly effectiveAppearance = computed<KuiSeparatorAppearance>(
    () => this.appearance() ?? this.separatorDefaults()?.appearance ?? 'default',
  );

  protected readonly effectiveOrientation = computed<KuiSeparatorOrientation>(
    () => this.orientation() ?? this.separatorDefaults()?.orientation ?? 'horizontal',
  );

  protected readonly effectiveSpacing = computed<KuiSeparatorSpacing>(
    () => this.spacing() ?? this.separatorDefaults()?.spacing ?? 'sm',
  );
}

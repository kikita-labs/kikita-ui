import { computed, Directive, inject, input } from '@angular/core';

import { KuiDefaults } from '../../providers/kui-defaults.service';
import { injectKuiRootSizeDefault } from '../../providers/kui-defaults.util';
import type { KuiSize } from '../../types';
import type { KuiBadgeAppearance } from './kui-badge-appearance.type';

/** Applies Kikita UI badge styling to inline status or metadata elements. */
@Directive({
  selector: '[kuiBadge]',
  host: {
    class: 'kui-badge',
    '[attr.data-kui-appearance]': 'appearance()',
    '[attr.data-kui-size]': 'effectiveSize()',
  },
})
export class KuiBadgeDirective {
  /** Visual badge treatment mapped to Kikita UI status tokens. */
  readonly appearance = input<KuiBadgeAppearance>('neutral');

  /** Badge size. Defaults to `defaults.badge.size`, then the global `defaults.size`, then md. */
  readonly size = input<KuiSize | undefined>();

  private readonly badgeDefaults = inject(KuiDefaults).get('badge');
  private readonly rootDefaultSize = injectKuiRootSizeDefault();

  protected readonly effectiveSize = computed(
    () => this.size() ?? this.badgeDefaults()?.size ?? this.rootDefaultSize() ?? 'md',
  );
}

import { Directive, computed, input } from '@angular/core';

import { KuiSize } from '../../types';
import { injectKuiRootSizeDefault } from '../../utils/kui-defaults.util';
import { KuiBadgeAppearance } from './kui-badge-appearance.type';

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

  /** Badge size mapped to Kikita UI text and spacing tokens. */
  readonly size = input<KuiSize | undefined>();

  private readonly rootDefaultSize = injectKuiRootSizeDefault();

  protected readonly effectiveSize = computed(() => this.size() ?? this.rootDefaultSize ?? 'md');
}

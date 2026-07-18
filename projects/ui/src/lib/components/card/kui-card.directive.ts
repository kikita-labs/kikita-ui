import { booleanAttribute, computed, Directive, input } from '@angular/core';

import type { KuiSize } from '../../types';
import { injectKuiRootSizeDefault } from '../../utils/kui-defaults.util';
import type { KuiCardAppearance } from './kui-card-appearance.type';

/** Applies Kikita UI card surface styling to semantic container elements. */
@Directive({
  selector: '[kuiCard]',
  host: {
    class: 'kui-card',
    '[attr.data-kui-appearance]': 'appearance()',
    '[attr.data-kui-size]': 'effectiveSize()',
    '[attr.data-kui-interactive]': 'interactive() ? "" : null',
  },
})
export class KuiCardDirective {
  /** Visual surface treatment. */
  readonly appearance = input<KuiCardAppearance>('surface');

  /** Card padding size. Defaults to md. */
  readonly size = input<KuiSize | undefined>();

  /** Enables hover and focus-visible affordances for clickable cards. */
  readonly interactive = input(false, { transform: booleanAttribute });

  private readonly rootDefaultSize = injectKuiRootSizeDefault();

  protected readonly effectiveSize = computed(() => this.size() ?? this.rootDefaultSize ?? 'md');
}

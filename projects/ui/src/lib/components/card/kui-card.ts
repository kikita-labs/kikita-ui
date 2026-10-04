import { booleanAttribute, computed, Directive, inject, input } from '@angular/core';

import { KuiDefaults } from '../../providers/kui-defaults';
import { injectKuiRootSizeDefault } from '../../providers/kui-defaults.util';
import type { KuiSize } from '../../types';
import type { KuiCardAppearance } from './kui-card-appearance.type';

/** Applies Kikita UI card surface styling to semantic container elements. */
@Directive({
  selector: '[kuiCard]',
  host: {
    class: 'kui-card',
    '[attr.data-kui-appearance]': 'effectiveAppearance()',
    '[attr.data-kui-size]': 'effectiveSize()',
    '[attr.data-kui-interactive]': 'interactive() ? "" : null',
  },
})
export class KuiCard {
  /** Visual surface treatment. Defaults to `defaults.card.appearance`, then `surface`. */
  readonly appearance = input<KuiCardAppearance | undefined>();

  /** Card padding size. Defaults to `defaults.card.size`, then the root size, then md. */
  readonly size = input<KuiSize | undefined>();

  /** Enables hover and focus-visible affordances for clickable cards. */
  readonly interactive = input(false, { transform: booleanAttribute });

  private readonly rootDefaultSize = injectKuiRootSizeDefault();

  private readonly cardDefaults = inject(KuiDefaults).get('card');

  protected readonly effectiveSize = computed(
    () => this.size() ?? this.cardDefaults()?.size ?? this.rootDefaultSize() ?? 'md',
  );
  protected readonly effectiveAppearance = computed(
    () => this.appearance() ?? this.cardDefaults()?.appearance ?? 'surface',
  );
}

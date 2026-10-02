import { Component, computed, inject, input, model, ViewEncapsulation } from '@angular/core';

import { KuiDefaults } from '../../providers/kui-defaults.service';
import type { KuiSize } from '../../types';
import { injectKuiRootSizeDefault } from '../../utils/kui-defaults.util';
import type { KuiAccordionContext } from './kui-accordion-context.token';
import { KUI_ACCORDION_CONTEXT } from './kui-accordion-context.token';

/** Visual style of the accordion container. */
export type KuiAccordionAppearance = 'default' | 'bordered' | 'ghost';

/** Toggle mode: only one item open at a time (exclusive) or many (multi). */
export type KuiAccordionMode = 'exclusive' | 'multi';

/**
 * Accordion container. Manages expanded state and coordinates child items.
 * Projects `kui-accordion-item` children.
 *
 * @example
 * ```html
 * <kui-accordion mode="exclusive" appearance="default" size="md">
 *   <kui-accordion-item header="General">Content A</kui-accordion-item>
 *   <kui-accordion-item header="Notifications">Content B</kui-accordion-item>
 * </kui-accordion>
 * ```
 */
@Component({
  selector: 'kui-accordion',
  template: `<ng-content />`,
  host: {
    class: 'kui-accordion',
    '[attr.data-kui-appearance]': 'effectiveAppearance()',
    '[attr.data-kui-size]': 'effectiveSize()',
    '[attr.data-kui-mode]': 'effectiveMode()',
  },
  providers: [
    {
      provide: KUI_ACCORDION_CONTEXT,
      useFactory: () => inject(KuiAccordionComponent),
    },
  ],
  encapsulation: ViewEncapsulation.None,
})
export class KuiAccordionComponent implements KuiAccordionContext {
  /** Toggle mode for the accordion. Defaults to `defaults.accordion.mode`, then `exclusive`. */
  readonly mode = input<KuiAccordionMode | undefined>();

  /** Visual appearance of the accordion. Defaults to `defaults.accordion.appearance`, then `default`. */
  readonly appearance = input<KuiAccordionAppearance | undefined>();

  /** Trigger height and font size. Defaults to `defaults.accordion.size`, then the root size, then `md`. */
  readonly size = input<KuiSize | undefined>();

  /**
   * IDs of currently expanded items. Supports two-way binding.
   * Mutations are reflected via `expandedItemsChange`.
   */
  readonly expandedItems = model<string[]>([]);

  private readonly rootDefaultSize = injectKuiRootSizeDefault();
  private readonly accordionDefaults = inject(KuiDefaults).get('accordion');

  protected readonly effectiveSize = computed(
    () => this.size() ?? this.accordionDefaults()?.size ?? this.rootDefaultSize() ?? 'md',
  );
  protected readonly effectiveMode = computed(
    () => this.mode() ?? this.accordionDefaults()?.mode ?? 'exclusive',
  );
  protected readonly effectiveAppearance = computed(
    () => this.appearance() ?? this.accordionDefaults()?.appearance ?? 'default',
  );

  /** @internal */
  toggle(id: string): void {
    if (this.effectiveMode() === 'exclusive') {
      const isOpen = this.expandedItems().includes(id);
      this.expandedItems.set(isOpen ? [] : [id]);
    } else {
      const current = this.expandedItems();
      const isOpen = current.includes(id);
      this.expandedItems.set(isOpen ? current.filter((x) => x !== id) : [...current, id]);
    }
  }
}

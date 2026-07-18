import { Component, ViewEncapsulation, computed, inject, model } from '@angular/core';

import { KuiSize } from '../../types';
import { injectKuiRootSizeDefault } from '../../utils/kui-defaults.util';
import { KUI_ACCORDION_CONTEXT, KuiAccordionContext } from './kui-accordion-context.token';

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
    '[attr.data-kui-appearance]': 'appearance()',
    '[attr.data-kui-size]': 'effectiveSize()',
    '[attr.data-kui-mode]': 'mode()',
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
  /** Toggle mode for the accordion. */
  readonly mode = model<KuiAccordionMode>('exclusive');

  /** Visual appearance of the accordion. */
  readonly appearance = model<KuiAccordionAppearance>('default');

  /** Trigger height and font size. */
  readonly size = model<KuiSize | undefined>();

  /**
   * IDs of currently expanded items. Supports two-way binding.
   * Mutations are reflected via `expandedItemsChange`.
   */
  readonly expandedItems = model<string[]>([]);

  private readonly rootDefaultSize = injectKuiRootSizeDefault();

  protected readonly effectiveSize = computed(() => this.size() ?? this.rootDefaultSize ?? 'md');

  /** @internal */
  toggle(id: string): void {
    if (this.mode() === 'exclusive') {
      const isOpen = this.expandedItems().includes(id);
      this.expandedItems.set(isOpen ? [] : [id]);
    } else {
      const current = this.expandedItems();
      const isOpen = current.includes(id);
      this.expandedItems.set(isOpen ? current.filter((x) => x !== id) : [...current, id]);
    }
  }
}

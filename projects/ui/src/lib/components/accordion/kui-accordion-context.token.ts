import { InjectionToken, Signal } from '@angular/core';

/** Shared context provided by KuiAccordionComponent to item children. */
export interface KuiAccordionContext {
  readonly expandedItems: Signal<string[]>;
  toggle(id: string): void;
}

export const KUI_ACCORDION_CONTEXT = new InjectionToken<KuiAccordionContext>('KuiAccordionContext');

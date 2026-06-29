import { InjectionToken, Signal } from '@angular/core';

/** Shared context provided by KuiAccordionComponent to item children. */
export interface KuiAccordionContext {
  readonly expandedItems: Signal<string[]>;
  toggle(id: string): void;
}

/** Injection token used by accordion items to access their parent accordion state. */
export const KUI_ACCORDION_CONTEXT = new InjectionToken<KuiAccordionContext>('KuiAccordionContext');

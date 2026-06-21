import { InjectionToken, Signal } from '@angular/core';

/** Shared context injected by KuiTabsComponent into child tab and panel directives. */
export interface KuiTabsContext {
  readonly selected: Signal<string>;
  select(value: string): void;
}

export const KUI_TABS_CONTEXT = new InjectionToken<KuiTabsContext>('KuiTabsContext');

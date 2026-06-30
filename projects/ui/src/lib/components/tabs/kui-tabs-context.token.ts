import { InjectionToken, Signal } from '@angular/core';

/** Shared context injected by KuiTabsComponent into child tab and panel directives. */
export interface KuiTabsContext {
  readonly selected: Signal<string>;
  readonly controlsPanels: Signal<boolean>;
  select(value: string): void;
  tabId(value: string): string;
  panelId(value: string): string;
}

/** Injection token used by tab and panel directives to access their parent tabs state. */
export const KUI_TABS_CONTEXT = new InjectionToken<KuiTabsContext>('KuiTabsContext');

import { InjectionToken, Signal } from '@angular/core';

/** Shared context injected by KuiSegmentedComponent into child segment directives. */
export interface KuiSegmentedContext {
  readonly selected: Signal<string>;
  select(value: string): void;
}

export const KUI_SEGMENTED_CONTEXT = new InjectionToken<KuiSegmentedContext>(
  'KuiSegmentedContext',
);

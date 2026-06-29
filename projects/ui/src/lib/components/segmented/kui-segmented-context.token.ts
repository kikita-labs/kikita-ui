import { InjectionToken, Signal } from '@angular/core';

/** Shared context injected by KuiSegmentedComponent into child segment directives. */
export interface KuiSegmentedContext {
  readonly selected: Signal<string>;
  select(value: string): void;
}

/** Injection token used by `kuiSegment` to access its parent segmented control. */
export const KUI_SEGMENTED_CONTEXT = new InjectionToken<KuiSegmentedContext>('KuiSegmentedContext');

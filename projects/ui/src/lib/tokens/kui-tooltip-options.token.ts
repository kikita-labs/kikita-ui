import type { Provider } from '@angular/core';
import { inject, InjectionToken } from '@angular/core';

import type { KuiTooltipTrigger } from '../components/tooltip/kui-tooltip-trigger.type';
import { KuiTooltipTriggerType } from '../components/tooltip/kui-tooltip-trigger.type';

/** Default options for `kuiTooltip` instances when local inputs are omitted. */
export interface KuiTooltipOptions {
  /** Default interaction mode for tooltip triggers. */
  readonly triggerType?: KuiTooltipTrigger;
}

/** Injection token for app-wide and scoped `kuiTooltip` defaults. */
export const KUI_TOOLTIP_OPTIONS = new InjectionToken<KuiTooltipOptions>('KUI_TOOLTIP_OPTIONS', {
  providedIn: 'root',
  factory: () => ({ triggerType: KuiTooltipTriggerType.Auto }),
});

/**
 * Provides scoped defaults for descendant `kuiTooltip` directives.
 *
 * Options are merged with the nearest parent tooltip options so a scoped override can add one
 * setting without resetting future tooltip defaults configured higher in the injector tree.
 */
export function kuiProvideTooltipOptions(options: KuiTooltipOptions): Provider {
  return {
    provide: KUI_TOOLTIP_OPTIONS,
    useFactory: () => ({
      ...inject(KUI_TOOLTIP_OPTIONS, { optional: true, skipSelf: true }),
      ...options,
    }),
  };
}

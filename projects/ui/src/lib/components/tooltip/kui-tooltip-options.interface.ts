import type { KuiTooltipPlacement } from './kui-tooltip-placement.type';
import type { KuiTooltipTrigger } from './kui-tooltip-trigger.type';

/** Defaults for `kuiTooltip`, set under the `tooltip` key of the component defaults. */
export interface KuiTooltipOptions {
  /** Default interaction mode for tooltip triggers. Defaults to adaptive `auto` behavior. */
  readonly triggerType?: KuiTooltipTrigger;

  /** Preferred side of the trigger. */
  readonly placement?: KuiTooltipPlacement;

  /** Gap in px between the trigger and the tooltip. */
  readonly offset?: number;
}

import type { KuiTooltipPlacement } from '../components/tooltip/kui-tooltip-placement.type';
import type { KuiTooltipTrigger } from '../components/tooltip/kui-tooltip-trigger.type';

/** Defaults for `kuiTooltip`, set under the `tooltip` key of the component defaults. */
export interface KuiTooltipOptions {
  /** Default interaction mode for tooltip triggers. Defaults to adaptive `auto` behavior. */
  readonly triggerType?: KuiTooltipTrigger;

  /** Preferred side of the trigger. */
  readonly placement?: KuiTooltipPlacement;
}

import type { KuiOverlayPositionOptions } from '../../types/kui-overlay-options.interface';
import type { KuiPopoverAlign, KuiPopoverTriggerType } from './kui-popover.types';

/** Defaults for `kui-popover`, set under the `popover` key of the component defaults. */
export interface KuiPopoverOptions extends KuiOverlayPositionOptions {
  /** Alignment along the anchor edge. */
  readonly align?: KuiPopoverAlign;

  /** Shows the arrow caret pointing to the anchor. */
  readonly arrow?: boolean;

  /** Whether the popover opens on `click` or on `hover`. */
  readonly triggerType?: KuiPopoverTriggerType;

  /** Delay in ms before a hover popover closes after the pointer leaves. */
  readonly hoverDelay?: number;
}

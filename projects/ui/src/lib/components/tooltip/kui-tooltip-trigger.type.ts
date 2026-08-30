/** Interaction modes supported by `kuiTooltip`. */
export enum KuiTooltipTriggerType {
  /** Use hover/focus for mouse users and tap for touch users. */
  Auto = 'auto',
  /** Show on mouse hover and keyboard focus; do not show on touch taps. */
  Hover = 'hover',
  /** Toggle on click or keyboard activation on every input device. */
  Click = 'click',
  /** Disable the tooltip, including its keyboard and touch behavior. */
  None = 'none',
}

/** String values accepted by the `triggerType` template input. */
export type KuiTooltipTrigger = `${KuiTooltipTriggerType}` | KuiTooltipTriggerType;

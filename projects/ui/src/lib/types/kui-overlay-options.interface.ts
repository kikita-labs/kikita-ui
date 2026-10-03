/** Side of an anchor an overlay opens on. */
export type KuiOverlayPlacement = 'top' | 'bottom' | 'left' | 'right';

/** Positioning defaults shared by anchored overlays. */
export interface KuiOverlayPositionOptions {
  /** Preferred side of the anchor. The overlay flips to the opposite side when it does not fit. */
  readonly placement?: KuiOverlayPlacement;

  /** Gap in px between the anchor and the overlay panel. */
  readonly offset?: number;
}

/** OKLCH color components used by the Kikita UI theme generator. */
export interface KuiOklchColor {
  /** Perceptual lightness from 0 to 1. */
  readonly lightness: number;

  /** Perceptual chroma. */
  readonly chroma: number;

  /** Hue angle in degrees. */
  readonly hue: number;

  /** Optional alpha from 0 to 1. */
  readonly alpha?: number;
}

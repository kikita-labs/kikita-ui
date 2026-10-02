import type { KuiButtonAppearance } from '../components/button/kui-button-appearance.type';
import type { KuiButtonShape } from '../components/button/kui-button-shape.type';
import type { KuiSize } from '../types';

/** Defaults shared by button-like primitives when local inputs are omitted. */
export interface KuiButtonBaseOptions {
  /** Default surface shape. */
  readonly shape?: KuiButtonShape;

  /** Default semantic color intent. Use `null` for each shape's neutral/default appearance. */
  readonly appearance?: KuiButtonAppearance | null;

  /** Default button size. Takes precedence over the global `defaults.size`. */
  readonly size?: KuiSize;
}

/** Defaults for `button[kuiButton]`, set under the `button` key of the component defaults. */
export interface KuiButtonOptions extends KuiButtonBaseOptions {}

/** Defaults for `button[kuiIconButton]`, set under the `iconButton` key of the component defaults. */
export interface KuiIconButtonOptions extends KuiButtonBaseOptions {}

/**
 * Defaults for button-like primitives.
 *
 * @deprecated Use {@link KuiButtonBaseOptions}. Planned removal in 3.0.
 */
export type KuiButtonPrimitiveOptions = KuiButtonBaseOptions;

/**
 * Shape accepted by the deprecated `kuiProvideButtonOptions`.
 *
 * @deprecated Set `button` and `iconButton` through `kuiProvideDefaults`. Planned removal in 3.0.
 */
export interface KuiButtonProviderOptions {
  /** Defaults for `button[kuiButton]`. */
  readonly button?: KuiButtonBaseOptions;

  /** Defaults for `button[kuiIconButton]`. */
  readonly iconButton?: KuiButtonBaseOptions;
}

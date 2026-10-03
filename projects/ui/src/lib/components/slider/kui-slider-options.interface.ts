import type { KuiSliderSize } from './kui-slider.directive';
import type { KuiSliderColor } from './kui-slider.directive';

/** Defaults for `input[type=range][kuiSlider]`, set under the `slider` key of the component defaults. */
export interface KuiSliderOptions {
  /** Component size. Takes precedence over the global `defaults.size`. */
  readonly size?: KuiSliderSize;

  /** Default colour role. */
  readonly color?: KuiSliderColor;
}

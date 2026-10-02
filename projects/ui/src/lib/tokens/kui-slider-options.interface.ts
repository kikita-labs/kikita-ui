import type { KuiSliderSize } from '../components/slider/kui-slider.directive';
import type { KuiSliderColor } from '../components/slider/kui-slider.directive';

/** Defaults for `input[type=range][kuiSlider]`, set under the `slider` key of the component defaults. */
export interface KuiSliderOptions {
  /** Component size. Takes precedence over the global `defaults.size`. */
  readonly size?: KuiSliderSize;

  /** Default colour role. */
  readonly color?: KuiSliderColor;
}

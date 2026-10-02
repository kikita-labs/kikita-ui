import type { KuiSeparatorAppearance } from '../components/separator/kui-separator-appearance.type';
import type { KuiSeparatorOrientation } from '../components/separator/kui-separator-orientation.type';
import type { KuiSeparatorSpacing } from '../components/separator/kui-separator-spacing.type';

/** Defaults for `hr[kuiSeparator]`, set under the `separator` key of the component defaults. */
export interface KuiSeparatorOptions {
  /** Default appearance. */
  readonly appearance?: KuiSeparatorAppearance;

  /** Default orientation. */
  readonly orientation?: KuiSeparatorOrientation;

  /** Default spacing around the separator. */
  readonly spacing?: KuiSeparatorSpacing;
}

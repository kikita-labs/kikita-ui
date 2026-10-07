import type { KuiThemeContrast } from './kui-theme-contrast.type';
import type { KuiThemeSeeds } from './kui-theme-seeds.interface';

/** Options accepted by the Kikita UI theme provider. */
export interface KuiThemeOptions {
  /** Seed values used to generate the theme. */
  readonly seeds: KuiThemeSeeds;

  /** Contrast mode of control borders. Defaults to `strict`. */
  readonly contrast?: KuiThemeContrast;
}

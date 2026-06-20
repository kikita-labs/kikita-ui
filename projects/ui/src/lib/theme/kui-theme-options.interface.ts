import { KuiThemeSeeds } from './kui-theme-seeds.interface';

/** Options accepted by the Kikita UI theme provider. */
export interface KuiThemeOptions {
  /** Seed values used to generate the theme. */
  readonly seeds: KuiThemeSeeds;
}

import { KuiDensity } from '../types';

/** Seed values used to generate a full Kikita UI theme. */
export interface KuiThemeSeeds {
  /** Base colors used by the theme generator to derive palettes and semantic tokens. */
  readonly color: KuiThemeColorSeeds;

  /** Base radius in pixels used to derive radius tokens. */
  readonly radius: number;

  /** Default density used by components when no local override exists. */
  readonly density: KuiDensity;
}

/** Minimal color seeds required for a balanced light/dark theme. */
export interface KuiThemeColorSeeds {
  /** Primary brand and action color seed. */
  readonly primary: string;

  /** Low-chroma neutral seed used for surfaces, borders, and text. */
  readonly neutral: string;

  /** Positive state color seed. */
  readonly success: string;

  /** Warning or caution state color seed. */
  readonly warning: string;

  /** Error and destructive action color seed. */
  readonly danger: string;

  /** Informational state color seed. */
  readonly info?: string;
}

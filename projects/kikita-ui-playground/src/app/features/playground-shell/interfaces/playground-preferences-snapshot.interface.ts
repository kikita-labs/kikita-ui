import type { PlaygroundLanguage } from '@features/playground-shell/types';
import type { KuiThemeColorSeeds, KuiThemeContrast, KuiThemeMode } from '@kikita-labs/ui';

/** The header and palette settings that the playground keeps between visits. */
export interface PlaygroundPreferencesSnapshot {
  /** Light or dark color mode. */
  readonly themeMode: KuiThemeMode;

  /** Seed colors edited in the palette popover. */
  readonly seedColors: KuiThemeColorSeeds;

  /** Contrast profile chosen in the palette popover. */
  readonly contrast: KuiThemeContrast;

  /** Interface language. */
  readonly language: PlaygroundLanguage;
}

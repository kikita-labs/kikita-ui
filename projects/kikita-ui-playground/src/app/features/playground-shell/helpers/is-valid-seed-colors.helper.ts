import { createKuiTheme, DEFAULT_KUI_THEME, type KuiThemeColorSeeds } from '@kikita-labs/ui';

/** Tells whether the library theme generator accepts the given seed colors. */
export function isValidSeedColors(colors: KuiThemeColorSeeds): boolean {
  try {
    createKuiTheme({ seeds: { ...DEFAULT_KUI_THEME.seeds, color: colors } });

    return true;
  } catch {
    return false;
  }
}

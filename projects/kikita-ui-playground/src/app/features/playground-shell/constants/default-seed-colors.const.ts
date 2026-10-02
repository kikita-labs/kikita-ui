import type { KuiThemeColorSeeds } from '@kikita-labs/ui';

/** Seed colors shown by the playground theme editor. */
export const DEFAULT_PLAYGROUND_SEED_COLORS = {
  primary: '#5b4fe0',
  neutral: '#8f8a80',
  success: '#267e4f',
  warning: '#9a7b2c',
  danger: '#c4443f',
  info: '#23709b',
} as const satisfies KuiThemeColorSeeds;

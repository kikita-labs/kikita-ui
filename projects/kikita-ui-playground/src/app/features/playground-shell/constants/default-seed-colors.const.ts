import type { KuiThemeColorSeeds } from '@kikita-labs/ui';

/** Seed colors shown by the playground theme editor. */
export const DEFAULT_PLAYGROUND_SEED_COLORS = {
  primary: '#5b4fe0',
  neutral: '#8f8a80',
  success: '#3f9463',
  warning: '#9a7b2c',
  danger: '#c4443f',
  info: '#3782ad',
} as const satisfies KuiThemeColorSeeds;

import { DEFAULT_PLAYGROUND_SEED_COLORS } from './default-seed-colors.const';

/** Name of a seed color edited in the playground theme editor. */
export type PlaygroundSeedName = keyof typeof DEFAULT_PLAYGROUND_SEED_COLORS;

/** Names of the seed colors, in the order the theme editor lists them. */
export const PLAYGROUND_SEED_NAMES = Object.keys(
  DEFAULT_PLAYGROUND_SEED_COLORS,
) as readonly PlaygroundSeedName[];

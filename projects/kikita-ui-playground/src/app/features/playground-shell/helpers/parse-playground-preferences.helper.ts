import {
  PLAYGROUND_SEED_NAMES,
  type PlaygroundSeedName,
} from '@features/playground-shell/constants';
import type { PlaygroundPreferencesSnapshot } from '@features/playground-shell/interfaces';
import type { KuiThemeColorSeeds } from '@kikita-labs/ui';

import { isValidSeedColors } from './is-valid-seed-colors.helper';

type MutableSnapshot = {
  -readonly [K in keyof PlaygroundPreferencesSnapshot]?: PlaygroundPreferencesSnapshot[K];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isSeedColors(
  value: Partial<Record<PlaygroundSeedName, unknown>>,
): value is KuiThemeColorSeeds {
  return PLAYGROUND_SEED_NAMES.every((name) => typeof value[name] === 'string');
}

function parseSeedColors(value: unknown): KuiThemeColorSeeds | null {
  if (!isRecord(value)) return null;

  const colors = Object.fromEntries(PLAYGROUND_SEED_NAMES.map((name) => [name, value[name]]));

  return isSeedColors(colors) && isValidSeedColors(colors) ? colors : null;
}

/**
 * Reads stored playground settings. Each field is validated on its own, so one stale or hand-edited
 * value is dropped without losing the others. Anything unreadable yields an empty object.
 */
export function parsePlaygroundPreferences(
  raw: string | null,
): Partial<PlaygroundPreferencesSnapshot> {
  if (!raw) return {};

  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return {};
  }
  if (!isRecord(value)) return {};

  const result: MutableSnapshot = {};
  const { themeMode, contrast, language } = value;

  if (themeMode === 'light' || themeMode === 'dark') result.themeMode = themeMode;
  if (contrast === 'strict' || contrast === 'soft') result.contrast = contrast;
  if (language === 'en' || language === 'ru') result.language = language;

  const seedColors = parseSeedColors(value['seedColors']);
  if (seedColors) result.seedColors = seedColors;

  return result;
}

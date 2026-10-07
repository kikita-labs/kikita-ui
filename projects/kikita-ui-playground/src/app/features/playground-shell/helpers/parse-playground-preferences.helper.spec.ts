import { DEFAULT_PLAYGROUND_SEED_COLORS } from '@features/playground-shell/constants';

import { parsePlaygroundPreferences } from './parse-playground-preferences.helper';

describe('parsePlaygroundPreferences', () => {
  it('returns nothing for missing or unreadable input', () => {
    expect(parsePlaygroundPreferences(null)).toEqual({});
    expect(parsePlaygroundPreferences('')).toEqual({});
    expect(parsePlaygroundPreferences('{not json')).toEqual({});
    expect(parsePlaygroundPreferences('42')).toEqual({});
    expect(parsePlaygroundPreferences('null')).toEqual({});
  });

  it('reads a complete snapshot', () => {
    const snapshot = {
      themeMode: 'light',
      seedColors: { ...DEFAULT_PLAYGROUND_SEED_COLORS, primary: '#e4572e' },
      contrast: 'soft',
      language: 'ru',
    };

    expect(parsePlaygroundPreferences(JSON.stringify(snapshot))).toEqual(snapshot);
  });

  it('drops a field that is not valid without losing the others', () => {
    const parsed = parsePlaygroundPreferences(
      JSON.stringify({
        themeMode: 'sepia',
        contrast: 'extreme',
        language: 'ru',
        seedColors: { ...DEFAULT_PLAYGROUND_SEED_COLORS, primary: 'not a color' },
      }),
    );

    expect(parsed).toEqual({ language: 'ru' });
  });

  it('drops seed colors that miss a seed', () => {
    const incomplete = Object.fromEntries(
      Object.entries(DEFAULT_PLAYGROUND_SEED_COLORS).filter(([name]) => name !== 'info'),
    );

    expect(parsePlaygroundPreferences(JSON.stringify({ seedColors: incomplete }))).toEqual({});
  });
});

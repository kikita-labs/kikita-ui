import { DEFAULT_PLAYGROUND_SEED_COLORS } from '@features/playground-shell/constants';

import { isValidSeedColors } from './is-valid-seed-colors.helper';

describe('isValidSeedColors', () => {
  it('accepts the default seed colors', () => {
    expect(isValidSeedColors(DEFAULT_PLAYGROUND_SEED_COLORS)).toBe(true);
  });

  it('rejects a color the theme generator cannot parse', () => {
    expect(isValidSeedColors({ ...DEFAULT_PLAYGROUND_SEED_COLORS, primary: 'not a color' })).toBe(
      false,
    );
  });
});

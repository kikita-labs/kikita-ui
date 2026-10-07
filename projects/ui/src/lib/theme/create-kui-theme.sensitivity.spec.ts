import { createKuiTheme, createKuiThemeVariableMap } from './create-kui-theme';
import { DEFAULT_KUI_THEME } from './default-kui-theme.const';
import type { KuiThemeOptions } from './kui-theme-options.interface';
import type { KuiThemeColorSeeds } from './kui-theme-seeds.interface';

type SeedScale = 'primary' | 'neutral' | 'success' | 'warning' | 'danger' | 'info';

const SCALES: readonly SeedScale[] = ['primary', 'neutral', 'success', 'warning', 'danger', 'info'];
const SCALE_PATTERN = new RegExp(`^--kui-(seed-)?(${SCALES.join('|')})(-\\d+)?$`);

interface SeedChange {
  readonly color?: Partial<KuiThemeColorSeeds>;
  readonly radius?: number;
  readonly density?: KuiThemeOptions['seeds']['density'];
}

function themeWith(change: SeedChange): KuiThemeOptions {
  const { seeds } = DEFAULT_KUI_THEME;

  return {
    seeds: {
      color: { ...seeds.color, ...change.color },
      radius: change.radius ?? seeds.radius,
      density: change.density ?? seeds.density,
    },
  };
}

function flatMaps(options: KuiThemeOptions): Record<'light' | 'dark', Record<string, string>> {
  const theme = createKuiTheme(options);

  return {
    light: { ...createKuiThemeVariableMap(theme, 'light') },
    dark: { ...createKuiThemeVariableMap(theme, 'dark') },
  };
}

/** Names of the variables whose value differs between two themes, in either mode. */
function changedVariables(before: KuiThemeOptions, after: KuiThemeOptions): Set<string> {
  const a = flatMaps(before);
  const b = flatMaps(after);
  const changed = new Set<string>();

  for (const mode of ['light', 'dark'] as const) {
    for (const name of new Set([...Object.keys(a[mode]), ...Object.keys(b[mode])])) {
      if (a[mode][name] !== b[mode][name]) {
        changed.add(name);
      }
    }
  }

  return changed;
}

const NEUTRAL_ROLES = [
  '--kui-color-bg',
  '--kui-color-surface-sunken',
  '--kui-color-border',
  '--kui-color-border-strong',
  '--kui-color-text',
  '--kui-color-text-secondary',
  '--kui-color-skeleton-bg',
  '--kui-color-scrollbar-thumb',
] as const;

/**
 * Seed sensitivity contract for the colour system: a seed changes exactly the variables derived
 * from it and nothing else.
 */
describe('createKuiTheme seed sensitivity', () => {
  it.each(SCALES.filter((scale) => scale !== 'neutral'))(
    'changing the %s seed leaves every other scale untouched',
    (scale) => {
      const changed = changedVariables(
        DEFAULT_KUI_THEME,
        themeWith({ color: { [scale]: 'oklch(0.6 0.15 200)' } }),
      );
      const otherScaleVariables = [...changed].filter((name) => {
        const match = SCALE_PATTERN.exec(name);
        return match !== null && match[2] !== scale;
      });

      expect(otherScaleVariables).toEqual([]);
      expect(changed.has(`--kui-seed-${scale}`)).toBe(true);
      expect(changed.has(`--kui-${scale}-6`)).toBe(true);
    },
  );

  it('changing the radius changes radius variables and no colour variable', () => {
    const changed = changedVariables(DEFAULT_KUI_THEME, themeWith({ radius: 16 }));

    expect([...changed].filter((name) => !name.startsWith('--kui-radius-'))).toEqual([]);
    expect(changed.size).toBeGreaterThan(0);
  });

  it('changing the density changes no colour variable', () => {
    const changed = changedVariables(DEFAULT_KUI_THEME, themeWith({ density: 'compact' }));

    expect([...changed].filter((name) => /color|-seed-|palette/.test(name))).toEqual([]);
  });

  it('changing the neutral seed changes its own twelve steps and seed variable', () => {
    const changed = changedVariables(
      DEFAULT_KUI_THEME,
      themeWith({ color: { neutral: 'oklch(0.5 0.03 250)' } }),
    );

    expect(changed.has('--kui-seed-neutral')).toBe(true);
    expect(changed.has('--kui-neutral-6')).toBe(true);
  });

  it('changing the neutral seed changes every neutral role in both modes', () => {
    const before = flatMaps(DEFAULT_KUI_THEME);
    const after = flatMaps(themeWith({ color: { neutral: 'oklch(0.5 0.03 250)' } }));

    const resolve = (variables: Record<string, string>, name: string): string => {
      const value = variables[name];
      const reference = /^var\((--[\w-]+)\)$/.exec(value);
      return reference ? resolve(variables, reference[1]) : value;
    };

    for (const mode of ['light', 'dark'] as const) {
      for (const role of NEUTRAL_ROLES) {
        expect(resolve(after[mode], role), `${mode} ${role}`).not.toBe(resolve(before[mode], role));
      }
    }
  });
});

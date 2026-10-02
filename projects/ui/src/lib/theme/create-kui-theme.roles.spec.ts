import { createKuiTheme } from './create-kui-theme';
import { DEFAULT_KUI_THEME } from './default-kui-theme.const';
import type { KuiThemeOptions } from './kui-theme-options.interface';

const WHITE = 'oklch(1 0 0)';
const NEAR_BLACK = 'oklch(0.15 0 0)';

function withPrimary(primary: string): KuiThemeOptions {
  const { seeds } = DEFAULT_KUI_THEME;
  return { seeds: { ...seeds, color: { ...seeds.color, primary } } };
}

describe('createKuiTheme solid fill roles', () => {
  const theme = createKuiTheme(DEFAULT_KUI_THEME);

  it('chooses white or near-black text by measured contrast on each default fill', () => {
    const expected = {
      primary: [WHITE, NEAR_BLACK],
      success: [WHITE, NEAR_BLACK],
      warning: [NEAR_BLACK, NEAR_BLACK],
      danger: [WHITE, NEAR_BLACK],
      info: [NEAR_BLACK, NEAR_BLACK],
    } as const;

    for (const [accent, [light, dark]] of Object.entries(expected)) {
      expect(theme.light[`--kui-color-${accent}-on-fill`], `light ${accent}`).toBe(light);
      expect(theme.dark[`--kui-color-${accent}-on-fill`], `dark ${accent}`).toBe(dark);
    }
  });

  it('moves hover and active away from the text colour', () => {
    expect(theme.light['--kui-color-primary-fill-away']).toBe('oklch(0 0 0)');
    expect(theme.light['--kui-color-warning-fill-away']).toBe(WHITE);
    expect(theme.dark['--kui-color-primary-fill-away']).toBe(WHITE);
    expect(theme.light['--kui-color-primary-fill-hover']).toBe(
      'color-mix(in oklab, var(--kui-color-primary-fill) 82%, var(--kui-color-primary-fill-away))',
    );
    expect(theme.light['--kui-color-primary-fill-active']).toBe(
      'color-mix(in oklab, var(--kui-color-primary-fill) 64%, var(--kui-color-primary-fill-away))',
    );
    expect(theme.dark['--kui-color-primary-fill-hover']).toBe(
      'color-mix(in oklab, var(--kui-color-primary-fill) 72%, var(--kui-color-primary-fill-away))',
    );
    expect(theme.dark['--kui-color-primary-fill-active']).toBe(
      'color-mix(in oklab, var(--kui-color-primary-fill) 92%, oklch(0 0 0))',
    );
  });

  it('reads the seed at step 6 in light mode and the fixed-tone step 5 in dark mode', () => {
    expect(theme.light['--kui-color-primary-fill']).toBe('var(--kui-primary-6)');
    expect(theme.dark['--kui-color-primary-fill']).toBe('var(--kui-primary-5)');
  });

  it('corrects a mid-lightness seed that neither text colour reaches 4.5:1 on', () => {
    const corrected = createKuiTheme(withPrimary('oklch(0.575 0.05 30)'));

    expect(corrected.paletteVariables['--kui-primary-6']).toBe('oklch(0.575 0.05 30)');
    expect(corrected.light['--kui-color-primary-fill']).toMatch(/^oklch\(/);
    expect(corrected.light['--kui-color-primary-fill']).not.toBe('oklch(0.575 0.05 30)');
  });

  it('uses the accent fill as an indicator only when it reaches 3:1 on light surfaces', () => {
    expect(theme.light['--kui-color-primary-indicator']).toBe('var(--kui-color-primary-fill)');
    expect(theme.light['--kui-color-warning-indicator']).toBe('var(--kui-warning-7)');

    for (const accent of ['primary', 'success', 'warning', 'danger', 'info']) {
      expect(theme.dark[`--kui-color-${accent}-indicator`]).toBe(`var(--kui-color-${accent}-fill)`);
    }
  });

  it('defines text roles that read the soft-text steps', () => {
    expect(theme.light['--kui-color-danger-text']).toBe('var(--kui-danger-8)');
    expect(theme.dark['--kui-color-danger-text']).toBe('var(--kui-danger-4)');
  });
});

describe('createKuiTheme neutral scales', () => {
  const theme = createKuiTheme(DEFAULT_KUI_THEME);

  it('emits one twelve-step scale per mode with the documented lightness', () => {
    const lightness = (value: string): number => Number(/^oklch\(([\d.]+) /.exec(value)?.[1]);
    const light = Array.from({ length: 12 }, (_, i) =>
      lightness(theme.light[`--kui-neutral-${i + 1}`]),
    );
    const dark = Array.from({ length: 12 }, (_, i) =>
      lightness(theme.dark[`--kui-neutral-${i + 1}`]),
    );

    expect(light).toEqual([1, 0.97, 0.95, 0.92, 0.88, 0.78, 0.75, 0.7, 0.66, 0.6, 0.46, 0.18]);
    expect(dark).toEqual([0.08, 0.1, 0.14, 0.18, 0.22, 0.27, 0.32, 0.35, 0.42, 0.52, 0.6, 0.93]);
    expect(theme.light['--kui-neutral-1']).toBe('oklch(1 0 80)');
  });

  it('keeps the neutral scales out of the shared palette variables', () => {
    expect(Object.keys(theme.paletteVariables).filter((name) => name.includes('neutral'))).toEqual(
      [],
    );
    expect(theme.palettes.neutral).toHaveLength(12);
    expect(theme.palettes.neutral[1]).toBe(theme.light['--kui-neutral-2']);
  });

  it('tints every step with the neutral seed hue and chroma', () => {
    const cold = createKuiTheme({
      seeds: {
        ...DEFAULT_KUI_THEME.seeds,
        color: { ...DEFAULT_KUI_THEME.seeds.color, neutral: 'oklch(0.5 0.03 250)' },
      },
    });

    expect(cold.light['--kui-neutral-12']).toBe('oklch(0.18 0.03 250)');
    expect(cold.dark['--kui-neutral-1']).toBe('oklch(0.08 0.03 250)');
    expect(cold.light['--kui-neutral-1']).toBe('oklch(1 0 250)');
  });

  it('maps every neutral role to a step of the scale of its mode', () => {
    expect(theme.light['--kui-color-text']).toBe('var(--kui-neutral-12)');
    expect(theme.dark['--kui-color-text']).toBe('var(--kui-neutral-12)');
    expect(theme.light['--kui-color-border-control']).toBe('var(--kui-neutral-10)');
    expect(theme.light['--kui-color-border-control-hover']).toBe('var(--kui-neutral-11)');
    expect(theme.dark['--kui-color-border-control-hover']).toBe('var(--kui-neutral-11)');
    expect(theme.light['--kui-color-text-placeholder']).toBe('var(--kui-neutral-11)');
    expect(theme.light['--kui-color-neutral-fill']).toBe('var(--kui-neutral-11)');
    expect(theme.dark['--kui-color-neutral-fill']).toBe('var(--kui-neutral-7)');
  });

  it('defines the shared overlay and focus roles', () => {
    for (const mode of [theme.light, theme.dark]) {
      expect(mode['--kui-color-on-scrim']).toBe(WHITE);
      expect(mode['--kui-color-neutral-on-fill']).toBe(WHITE);
      expect(mode['--kui-color-focus']).toBe('var(--kui-color-primary-indicator)');
    }
  });
});

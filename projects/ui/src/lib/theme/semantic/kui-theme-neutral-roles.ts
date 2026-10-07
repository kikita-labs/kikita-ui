import type { KuiThemeContrast } from '../kui-theme-contrast.type';
import type { KuiThemeMode } from '../kui-theme-mode.type';
import type { KuiCssVariableMap } from '../kui-theme-tokens.interface';
import { KUI_CONTRAST_PROFILES } from './kui-theme-contrast-profiles';

/**
 * Neutral step read by each neutral role: [light, dark]. This is the reference table. The
 * contrast profiles in `kui-theme-contrast-profiles.ts` override single roles of it.
 *
 * Control borders (`border-control`) are the boundary of an interactive control, so they meet 3:1
 * (WCAG 1.4.11) in the reference table.
 */
export const NEUTRAL_ROLE_STEPS = {
  surface: [1, 3],
  'surface-elevated': [1, 4],
  bg: [2, 2],
  'surface-sunken': [3, 1],
  'skeleton-highlight': [3, 6],
  'border-subtle': [4, 4],
  'skeleton-bg': [4, 4],
  border: [5, 5],
  'scrollbar-thumb': [6, 7],
  'border-strong': [7, 7],
  'text-disabled': [8, 8],
  'scrollbar-thumb-hover': [9, 9],
  'scrollbar-thumb-active': [10, 10],
  'border-control': [10, 10],
  'border-control-hover': [11, 11],
  'text-secondary': [11, 11],
  'text-placeholder': [11, 11],
  text: [12, 12],
  'neutral-fill': [11, 7],
} as const satisfies Record<string, readonly [number, number]>;

/** Name of a neutral role. */
export type KuiNeutralRole = keyof typeof NEUTRAL_ROLE_STEPS;

/** The neutral step per mode that a role reads under one contrast profile. */
export type KuiNeutralRoleSteps = Readonly<Record<KuiNeutralRole, readonly [number, number]>>;

/** The step table of one contrast profile: the reference table with the profile's overrides applied. */
export function resolveNeutralRoleSteps(contrast: KuiThemeContrast): KuiNeutralRoleSteps {
  return { ...NEUTRAL_ROLE_STEPS, ...KUI_CONTRAST_PROFILES[contrast].steps };
}

/** The neutral role variables of one mode under one contrast profile. */
export function createNeutralRoleVariables(
  mode: KuiThemeMode,
  contrast: KuiThemeContrast,
): Record<`--kui-${string}`, string> {
  const modeIndex = mode === 'light' ? 0 : 1;
  const variables: Record<`--kui-${string}`, string> = {};

  for (const [role, steps] of Object.entries(resolveNeutralRoleSteps(contrast))) {
    variables[`--kui-color-${role}`] = `var(--kui-neutral-${steps[modeIndex]})`;
  }

  return variables;
}

/** The neutral role variables of both modes under one contrast profile. */
function createNeutralRoleVariablesByMode(
  contrast: KuiThemeContrast,
): Record<KuiThemeMode, Record<`--kui-${string}`, string>> {
  return {
    light: createNeutralRoleVariables('light', contrast),
    dark: createNeutralRoleVariables('dark', contrast),
  };
}

/**
 * The variables that differ between two contrast profiles, for both modes. The key set is the union
 * over both modes so that a light rule never leaks a value into dark mode that the dark rule would
 * not override.
 */
export function createContrastDelta(
  from: KuiThemeContrast,
  to: KuiThemeContrast,
): Record<KuiThemeMode, KuiCssVariableMap> {
  const before = createNeutralRoleVariablesByMode(from);
  const after = createNeutralRoleVariablesByMode(to);
  const changed = new Set<`--kui-${string}`>();

  for (const mode of ['light', 'dark'] as const) {
    for (const name of Object.keys(after[mode]) as `--kui-${string}`[]) {
      if (after[mode][name] !== before[mode][name]) changed.add(name);
    }
  }

  const pick = (mode: KuiThemeMode): KuiCssVariableMap =>
    Object.fromEntries([...changed].map((name) => [name, after[mode][name]]));

  return { light: pick('light'), dark: pick('dark') };
}

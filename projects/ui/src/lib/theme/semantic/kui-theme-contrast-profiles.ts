import type { KuiThemeContrast } from '../kui-theme-contrast.type';
import type { KuiNeutralRole } from './kui-theme-neutral-roles';

/** One contrast profile: which neutral roles it re-points and when the browser selects it by itself. */
export interface KuiContrastProfile {
  /**
   * Neutral step overrides per role, `[light, dark]`. Roles that are not listed keep the reference
   * table of `kui-theme-neutral-roles.ts`.
   */
  readonly steps: Readonly<Partial<Record<KuiNeutralRole, readonly [number, number]>>>;

  /**
   * Media query condition (without `@media`) under which the profile applies on its own, when no
   * `data-kui-contrast` attribute is present. Omit for profiles that are only chosen explicitly.
   */
  readonly media?: string;
}

/**
 * All contrast profiles. To add a mode, add its name to `KuiThemeContrast` and an entry here; the
 * theme generator, the CSS output and the playground switch pick it up from this record.
 */
export const KUI_CONTRAST_PROFILES: Readonly<Record<KuiThemeContrast, KuiContrastProfile>> = {
  /** The reference table: control borders meet 3:1 against the surface (WCAG 1.4.11). */
  strict: {
    steps: {},
    media: '(prefers-contrast: more)',
  },
  /** Control borders drop to quieter neutral steps, below 3:1. Text, focus and fills are unchanged. */
  soft: {
    steps: {
      'border-control': [6, 6],
      'border-control-hover': [8, 8],
    },
  },
};

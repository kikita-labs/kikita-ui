import type { Signal } from '@angular/core';
import { computed, inject } from '@angular/core';

import { KuiDefaults } from '../../providers/kui-defaults';
import type { KuiIconGlyph } from './kui-icon-glyph.type';
import { pickKuiGlyph } from './kui-icon-glyph.util';
import type { KuiIconRole } from './kui-icons-options.interface';

/** Inputs of {@link injectKuiGlyph}. */
export interface KuiGlyphLookup {
  /** Shared role to fall back to when the component has no override of its own. */
  readonly role: KuiIconRole;

  /** Reads the component-level override; runs inside `computed`, so signals are tracked. */
  readonly slot?: () => KuiIconGlyph | undefined;

  /** Built-in glyph used when neither the slot nor the role is set (or valid). */
  readonly fallback: KuiIconGlyph;
}

/**
 * @internal Resolves one structural icon as a signal, following
 * `component slot > shared role > built-in glyph`.
 *
 * Must run in an injection context. The result follows the nearest `KuiDefaults` level and updates
 * when a default changes.
 */
export function injectKuiGlyph(lookup: KuiGlyphLookup): Signal<KuiIconGlyph> {
  const icons = inject(KuiDefaults).get('icons');

  return computed(() => pickKuiGlyph([lookup.slot?.(), icons()?.[lookup.role]], lookup.fallback));
}

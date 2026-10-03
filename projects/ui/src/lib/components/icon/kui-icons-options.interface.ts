import type { KuiIconGlyph } from './kui-icon-glyph.type';

/**
 * Structural icons shared by the whole library, set under the `icons` key of the component defaults.
 *
 * Each property is a role, named for what the icon does rather than for its shape: one cross can be
 * `close` on a dialog, `remove` on a chip and `clear` in a field. A role changes every component that
 * has no more specific override; a component-level key such as `defaults.select.chevronIcon` wins
 * over the role, and the built-in glyph is the last resort.
 *
 * ```text
 * defaults.<component>.<slot>Icon > defaults.icons.<role> > built-in glyph
 * ```
 *
 * These are not the icons you pass to `kui-icon` by name; they never go through the icon registry,
 * so a registered icon called `close` cannot replace them. Direction-neutral names are used on
 * purpose: `previous` and `next` stay correct if a layout is ever mirrored.
 */
export interface KuiIconsOptions {
  /** Closes a dialog, drawer, media viewer, toast or alert. */
  readonly close?: KuiIconGlyph;

  /** Removes an item, for example a chip or an uploaded file. */
  readonly remove?: KuiIconGlyph;

  /** Clears the value of a field. */
  readonly clear?: KuiIconGlyph;

  /** Opens the options of a select, combobox, date picker, time picker or color input. */
  readonly pickerChevron?: KuiIconGlyph;

  /** Goes to the previous page, month, slide or tab group. */
  readonly previous?: KuiIconGlyph;

  /** Goes to the next page, month, slide or tab group. */
  readonly next?: KuiIconGlyph;

  /** Goes to the first page. */
  readonly first?: KuiIconGlyph;

  /** Goes to the last page. */
  readonly last?: KuiIconGlyph;

  /** Expands or collapses an accordion item or a tree node. Rotation is done in CSS. */
  readonly disclosure?: KuiIconGlyph;

  /** Separates breadcrumb items. */
  readonly separator?: KuiIconGlyph;

  /** Marks a completed step or a finished upload. */
  readonly check?: KuiIconGlyph;

  /** Informational status of an alert or toast. */
  readonly statusInfo?: KuiIconGlyph;

  /** Success status of an alert or toast. */
  readonly statusSuccess?: KuiIconGlyph;

  /** Warning status of an alert, toast or confirm dialog. */
  readonly statusWarning?: KuiIconGlyph;

  /** Danger status of an alert or toast. */
  readonly statusDanger?: KuiIconGlyph;

  /** Marks an external link. */
  readonly externalLink?: KuiIconGlyph;
}

/** Name of one structural icon role. */
export type KuiIconRole = keyof KuiIconsOptions;

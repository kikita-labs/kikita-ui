# Changelog

All notable changes to `@kikita-labs/ui` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this
project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html) once it reaches
1.0.0. Before 1.0.0, minor versions may include breaking changes.

## [Unreleased]

### Fixed

- `kui-field`: control no longer collapses into the label row (leaving a phantom empty
  control-row track below it) when rendered without a `label`/`[kuiLabel]`. `.kui-field__label`
  and `.kui-field__control` now have explicit `grid-row` placement instead of relying on
  DOM-order auto-placement.
- `kui-command-palette`: dialog no longer stretches to fill the full available backdrop height
  (`.kui-command-backdrop` was missing `align-items`, defaulting to `stretch`), which left a
  large block of dead space below the footer whenever the result list was shorter than
  `max-block-size: 78vh`. Backdrop now uses `align-items: flex-start` so the dialog sizes to its
  own content. `.kui-command__list` was also switched from `flex: 1 1 auto` to `flex: 0 1 auto`
  so it hugs its content and only scrolls once content exceeds its own max height.

## [0.1.0] - 2026-07-08

### Added

- `kui-calendar`: inline month-grid date picker. Single/range selection, month/year/decade
  navigation, keyboard support, `minDate`/`maxDate`/`disabledDates`, `size` (`md`/`sm`), `flat`
  variant for nesting inside popover chrome, optional footer, and header/footer overrides via
  `[kuiCalendarHeader]`/`[kuiCalendarFooter]` content projection. `viewDate` two-way model and
  `showPrevNav`/`showNextNav` support driving linked calendar pairs.
- `input[kuiDatePicker]`: text-input directive (`dd.MM.yyyy` mask) pairing with `kui-calendar`
  in a `kui-dropdown` popover through a shared `value` signal. `minDate`/`maxDate`, `clearable`,
  `disabled`/`readonly`, Signal Forms `FormValueControl` contract. Known gap: `range` mode and
  a mobile bottom-sheet variant are not implemented yet.
- `KUI_LOCALE` injection token and `kuiProvideLocale()`: resolves month/weekday names and the
  first day of the week from `Intl`, no bundled locale data. Defaults to `navigator.language`.
- `kuiFieldAffix`, `kuiFieldAffixIcon`, `kuiFieldAction` directives: typed, documented
  replacements for the previously bare `.kui-field-affix` / `.kui-field-affix-icon` /
  `.kui-field-action` CSS class hooks used for custom prefix/suffix/action markup inside
  `.kui-input-group`.
- `kui-dropdown`: `panelRole` input (`'listbox' | 'dialog' | 'grid' | null`, default
  `'listbox'`) and `panelWidth` input (`'anchor' | 'content'`, default `'anchor'`) for panels
  with non-listbox content and/or their own intrinsic width (e.g. `kui-calendar`).

### Fixed

- `kui-dropdown` panels can no longer render taller than the viewport with no way to reach the
  overflow ("shrinks" while content spills outside it). The panel's effective `max-height` is
  now always `min(maxHeight, calc(100vh - margin))`, scrolling internally instead of clipping.
  Applies to every consumer (select, combobox, menu, date picker) with no per-instance opt-in.
- `kui-dropdown` now closes itself if its anchor scrolls fully out of the viewport, instead of
  rendering detached from a trigger the user can no longer see.
- `kui-dropdown`'s internal scroll (e.g. scrolling a tall calendar/listbox) no longer resets to
  the top mid-scroll. The document-capture scroll listener used to reposition the overlay
  reacted to the panel's own internal scroll events (capture-phase listeners receive scroll
  from descendants even though scroll doesn't bubble), racing with the browser's scroll commit.
- `.kui-input-group > .kui-input` now matches its sibling affixes' `line-height` (was inheriting
  the base `.kui-input` line-height, making the input taller than adjacent prefix/suffix text
  and misaligning them vertically).

## [0.0.9] and earlier

Not tracked in this file. See `git log` for history up to `efd5a45`.

[Unreleased]: https://github.com/kikita-labs/kikita-ui/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/kikita-labs/kikita-ui/releases/tag/v0.1.0

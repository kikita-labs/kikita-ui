# Changelog

All notable changes to `@kikita-labs/ui` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this
project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html) once it reaches
1.0.0. Before 1.0.0, minor versions may include breaking changes.

## [Unreleased]

### Added

- `kui-menu`: `placement` input (`'top' | 'bottom' | 'left' | 'right'`, default `'bottom'`),
  matching `kui-popover`'s placement model. Previously menus only ever opened below/above the
  trigger (flipping vertically); `left`/`right` were not possible. `menuAlign` now also applies
  to `left`/`right` placement (vertical start/end alignment along the trigger edge) in addition
  to its existing `top`/`bottom` meaning (horizontal alignment).
- `kui-calendar`: `--kui-calendar-width` CSS custom property (default `296px`). The calendar
  previously had a hardcoded width with no way to override it — e.g. to make a date picker's
  popover narrower or wider than the default.
- `kui-dropdown`: `width` input (any CSS width, e.g. `'320px'`). Overrides `panelWidth` entirely
  so any consumer (`kuiSelect`, `kuiCombobox`, a date picker, ...) can make its dropdown a
  specific width regardless of the trigger, not just the fixed `'anchor'`/`'content'`/`'auto'`
  sizing strategies.
- `input[kuiColorInput]`: now sets `spellcheck="false"`, `autocomplete="off"`,
  `autocorrect="off"`, and `autocapitalize="off"` on the native input itself, matching how
  `input[kuiSelect]` already sets its own ARIA attributes — consumers no longer need to add
  `spellcheck="false"` by hand to stop browsers spellcheck-underlining hex/oklch values.
- `kui-color-input`'s picker preset swatches are now labeled by the semantic seed role they
  match (Primary/Neutral/Success/Warning/Danger/Info), via `title` (native tooltip) and a more
  descriptive `aria-label` — previously they were unlabeled color swatches with no indication
  of which theme seed each corresponded to.

### Fixed

- Docs: clarified that `kui-dropdown`'s `panelWidth` is a plain input consumers already control
  directly in their own template (e.g. switching a date picker's `kui-dropdown` to
  `panelWidth="anchor"`), and that doing so alone doesn't shrink `kui-calendar` itself (it has a
  fixed width) — use the new `--kui-calendar-width` custom property for that.
- `kui-dropdown`/`kui-menu`: a panel clamped smaller for lack of room (e.g. DevTools docked open)
  never grew back once more room appeared (e.g. closing DevTools), only re-measuring on scroll.
  The viewport-resize watch used `ResizeObserver` on `document.documentElement`, which tracks
  that element's content box, not the viewport — shrinking/growing the viewport doesn't reliably
  change it when page content doesn't fill the viewport. Switched to a `window.resize` listener.
- `kui-popover`: a `hover`-triggered popover reopened itself immediately after closing (visually
  stuck open/focused until the pointer left and re-entered the trigger). Closing any popover
  focused its trigger for keyboard/click accessibility, but for `hover` triggers that focus call
  itself fired `focusin` on the trigger, which the hover trigger directive treats as "reopen".
  Focus restoration on close is now skipped for `triggerType="hover"`.
- Removed `NgZone`/`runOutsideAngular`/`zone.run` from `kui-dropdown`, `kui-menu`, `kui-popover`,
  and the shared `kui-floating-panel.util` dismissal helper — dead weight under
  `provideZonelessChangeDetection()`, where zone.js isn't loaded and these calls were inert
  shims. Signal writes drive change detection directly now.

## [0.1.1] - 2026-07-10

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
- `kui-color-input`: picker popover is now viewport-safe and no longer a separate,
  independently-maintained CDK overlay. `input[kuiColorInput]` now opens its picker through a
  dynamically-created `kui-dropdown` instance (`panelWidth="auto"`, a new mode sized purely by
  content, ignoring the trigger's width) instead of its own hand-rolled
  `Overlay`/`FlexibleConnectedPositionStrategy`/`DomPortal` plumbing, so it inherits the same
  positioning, dismissal, and viewport-safety behavior as every other floating panel in the
  library rather than reinventing (and separately bugging out) the same logic.
- `kui-dropdown` / `kui-menu`: both panels could still render taller than the actual room
  available in the direction they opened, even after being clamped to `calc(100vh - margin)` --
  that cap is against the *whole* viewport, not the space left between the anchor and the
  screen edge on the side the panel flipped to. Panels now measure their real rendered position
  and shrink `max-height` further whenever they'd still overflow. This clamp, and the panel's
  position, now also re-run on window resize (via a `ResizeObserver` on `document.documentElement`,
  not a raw `window.resize` listener) and on scroll that only shifts the anchor without changing
  which side the panel is flipped to (previously only a `positionChanges`-triggered reposition
  re-ran the clamp, so scrolling open more room without a flip left a panel stuck smaller than it
  needed to be).
- `kui-menu` had no viewport-safety at all before this change (no max-height, no scrolling) --
  a long menu could render off-screen with no way to reach the rest of it. It now behaves like
  `kui-dropdown` in this regard, via `--kui-menu-viewport-margin`.
- Extracted the positioning/dismissal/viewport-clamp logic shared by `kui-dropdown` and
  `kui-menu` into `kui-floating-panel.util.ts` instead of each maintaining its own copy (and
  independently accumulating the same class of bugs, as above).
- `kuiMenuFor`: opening a menu via keyboard (Enter/Space on the trigger, or ArrowDown/ArrowUp)
  now moves focus onto the first/last item, matching `input[kuiSelect]`. Previously Enter/Space
  only toggled the menu open with focus left on the trigger, so arrow keys did nothing until the
  user tabbed in manually. A mouse click still opens without stealing focus onto an item.
- `input[kuiDatePicker]`: pressing ArrowDown while the calendar popover is already open now
  moves focus onto the day grid (its roving `tabindex="0"` cell) instead of doing nothing.
  ArrowLeft/Right still move the text caret, which is correct and unchanged.
- `kui-command-palette`: arrow-key navigation now scrolls the newly-active item into view.
  Unlike `kui-select`/`kui-menu`, the active item here is a CSS class on a roving index (focus
  stays on the search input the whole time), so there was no native `focus()`-triggered
  auto-scroll to rely on -- navigating to an item below the visible list left it selected but
  invisible with no indication where it went.

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

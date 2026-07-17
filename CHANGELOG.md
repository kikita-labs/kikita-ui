# Changelog

All notable changes to `@kikita-labs/ui` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this
project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html) once it reaches
1.0.0. Before 1.0.0, minor versions may include breaking changes.

## [Unreleased]

## [0.6.2] - 2026-07-17

### Fixed

- `kuiButton`'s `iconStart`/`iconEnd` and `kuiIconButton`'s `icon` (added in 0.6.0) crashed the
  whole page under SSR/prerendering with `TypeError: e.hasAttribute is not a function`. Unlike
  `loading`, which is rarely `true` on first render, these are ordinarily static template
  attributes, so both server and client ran the same constructor-time Renderer2 DOM mutation
  (wrapping content, inserting the icon component) on first render. Angular's hydration
  reconciliation matches server DOM against the _compiled template_, not against whatever a
  directive mutates at runtime, so the server-rendered (already-wrapped) markup didn't match what
  the client's hydration pass expected, and it crashed. Both directives now skip this mutation
  entirely on the server (same `isPlatformBrowser` guard already used by `kuiNumberInput` for the
  same class of issue in 0.4.5) and apply it on the client only, after hydration completes. The
  icon/wrapper is absent from the initial server-rendered HTML and appears once client JS runs.

## [0.6.1] - 2026-07-17

### Fixed

- `[kuiFieldAffix]` clipped the descenders of letters like `g`/`p`/`y` because its line box
  (`line-height: 1`) was shorter than the font's actual glyph metrics while `overflow: hidden`
  clipped anything outside it. Its line-height now matches `.kui-input` (`1.3`).
- `[kuiFieldAffix]` never actually ellipsized overflowing text: `text-overflow: ellipsis` has no
  effect on flex containers, but the rule used `display: inline-flex`. Switched to
  `inline-block`, which is a valid `text-overflow` context; the now-unnecessary
  `align-items: center` on the flex-only rule was also removed.
- `.kui-input-group` had no `overflow: hidden`, so when a `[kuiFieldAffix]`'s own clipped width
  plus the input's minimum width exceeded the group's width, the affix visually spilled past the
  group's border instead of being clipped by it.

## [0.6.0] - 2026-07-17

### Added

- `kuiButton` now supports `iconStart` and `iconEnd` inputs that render a `kui-icon` resolved by
  name before/after the button's projected content, so consumers no longer have to hand-project
  `kui-icon` for the common case of a registered icon.
- `kuiIconButton` now supports an `icon` input that renders a `kui-icon` resolved by name as the
  button's content, for the same reason. Manually projecting `kui-icon` (for a `source` or `src`
  icon, for example) still works and is unaffected.

### Fixed

- `kui-icon` ignored its `size` input for any icon resolved by `name` (including the default
  Lucide resolver added in 0.5.0), rendering at the resolved SVG's own `width`/`height` attributes
  instead (for example 24x24 for every Lucide icon). The resolved markup is inserted via
  `[innerHTML]`, so Angular's template compiler never sees it and never stamps the component's
  view-encapsulation content attribute onto it; the scoped selector meant to size it
  (`.kui-icon__svg :where(svg)`) could therefore never match that node. The rule now uses
  `::ng-deep` to reach the injected SVG regardless of encapsulation, and `.kui-icon__svg` and
  `:host` now reset their default flex/grid-item minimum size to `0` so the icon can shrink below
  the resolved SVG's intrinsic size instead of flooring at it.

## [0.5.0] - 2026-07-17

### Added

- `kui-icon` now resolves unregistered names against a default Lucide icon set via
  `provideKikitaUi()`, lazily fetched from the jsDelivr CDN by name -- no icon package install
  required. Disable with `provideKikitaUi({ icons: false })`.
- `provideKuiIcons()` now accepts an async resolver function (`KuiIconResolver`) in addition to a
  static registry, so a custom icon set (or a different icon library entirely) can back
  `kui-icon` globally or scoped to a specific component's `providers`.
- `KikitaUiOptions.icons` (`'lucide' | false`) controls the default icon resolver.

### Changed

- `.kui-checkbox`'s checked/indeterminate marks are now Lucide's `check`/`minus` glyphs rendered
  as a `currentColor` CSS mask, replacing the previous hand-drawn border-corner checkmark and
  border-dash indeterminate mark. Native `<input>` elements can't have DOM children, so this uses
  `mask-image` instead of an embedded SVG.
- Library-internal chrome icons (chevrons, clear/close buttons, status glyphs, folder/file
  icons, etc.) across accordion, breadcrumbs, calendar, color-input, combobox, command-palette,
  date-picker, dialog, file-upload, select, stepper, tabs, toast, and tree now use real Lucide
  path data instead of hand-drawn approximations. These stay static inline SVG (not routed
  through the icon resolver), so internal chrome never depends on the network.

### Fixed

- `kui-toast`'s close button rendered its icon squeezed to half width -- the native `<button>`'s
  user-agent padding was never reset, and `box-sizing: border-box` (common in consumer app
  resets) shrank the content box below the icon's size. `.kui-toast-close` now resets
  `padding: 0`.
- Several internal "x" icons (select/combobox/date-picker clear buttons, stepper error state,
  toast close/danger) rendered with one diagonal stroke missing after being redrawn from two
  independent path segments joined into a single `d` attribute -- the second segment's relative
  `m` command was computed from the first segment's end point instead of from the origin, moving
  it outside the viewBox. Each now renders as two separate `<path>` elements, matching Lucide's
  own markup.
- `.kui-checkbox`/`.kui-radio` mark could render with an uneven 1px gap on one side (an odd pixel
  remainder can't split evenly no matter the centering method). Mark/dot size is now rounded to
  an even pixel count derived from the control's own size token, guaranteeing a symmetric gap
  regardless of the size variant.

## [0.4.6] - 2026-07-16

### Fixed

- `kui-command-palette` label highlights no longer introduce a visual gap
  between matched and unmatched label text.

## [0.4.5] - 2026-07-16

### Fixed

- `input[kuiNumberInput]` no longer mutates DOM during server rendering. The
  server output keeps the native `input[type=number]` in the template position
  so Angular hydration can match it, then the browser enhances it with the
  `.kui-number-input` wrapper and step buttons after hydration.
- `kui-tabs` line indicators now stay above the tab-list edge while hovered tab
  backgrounds render underneath, so the baseline is not visually cut out.
- `button[kuiTab][hasError]` reuses pre-rendered error affordances during
  hydration instead of appending duplicate error dots and screen-reader text.

### Added

- `kui-tabs` now supports the boolean `inverted` input. Horizontal tabs render
  panels above the tab list with the indicator on top; vertical tabs render
  panels before the tab list with the indicator on the start edge.

## [0.4.4] - 2026-07-16

### Fixed

- `th[kuiTh]`'s sortable header button no longer nests a duplicate `<button>` inside
  itself after Angular hydration. A hydrated client directive instance re-ran its
  one-time DOM-wrapping logic against DOM a server-side instance had already
  wrapped; it now detects and reuses an existing `.kui-th__sort-button` instead of
  wrapping it again. Fixes an axe `nested-interactive` violation on every sortable
  table under SSR/prerendering.
- `input[kuiNumberInput]`'s imperative DOM wrapping (container + step buttons via
  `Renderer2`) is a known SSR/hydration incompatibility in this release:
  Angular's hydration node-matching can mismatch the directive's host against
  the wrapper it built, leaving a stale server-rendered input nested inside a
  second, client-built wrapper with no accessible label. Consumers using SSR
  should skip hydration for views containing `kuiNumberInput` in 0.4.4.

## [0.4.3] - 2026-07-16

### Changed

- Package now publishes to the public `registry.npmjs.org` instead of
  `npm.pkg.github.com`, under the MIT license. GitHub Packages required an
  authenticated `npm install` for every consumer regardless of repository
  visibility, which blocked anonymous `npm i @kikita-labs/ui`.

### Fixed

- `provideKikitaUi({ scrollbars: 'styled' })` no longer throws during server
  rendering. Its `ENVIRONMENT_INITIALIZER` unconditionally wrote to
  `document.documentElement.dataset`, which crashed Angular's build-time route
  extraction/prerender pass (that pass provides a `DOCUMENT` without a real
  `documentElement`). Now guarded with `isPlatformBrowser()`, matching the
  existing guard pattern in `kui-toast.service.ts`.

## [0.4.2] - 2026-07-15

### Fixed

- `kuiDropdownFor`: opening the panel (mouse or keyboard) now always moves focus onto the first
  selectable option, per the ARIA APG listbox popup pattern -- previously `tabindex="-1"` options
  were unreachable by keyboard after a mouse-opened panel (axe `scrollable-region-focusable`).
- `kui-dropdown` panel now gets an `aria-label` borrowed from the trigger's own accessible name
  when it has none of its own (axe `aria-input-field-name`).
- `kui-field`: added a keydown fallback (ArrowDown/ArrowUp/Enter/Space open + focus first/last
  option) for dropdowns wired without `kuiSelect`/`kuiCombobox` (e.g. a plain `input[kuiInput]` +
  `kui-dropdown` pair) -- that combination had no keyboard support at all before, only mouse-click
  open.

## [0.4.1] - 2026-07-15

### Fixed

- `kui-scroll` docs example now includes `tabindex="0"` so scrollable regions stay
  keyboard-focusable (axe `scrollable-region-focusable`).
- `kui-drawer` panel now renders as `<div role="dialog">` instead of `<aside>`, whose
  implicit role does not permit `role="dialog"` (axe `aria-allowed-role`).
- `.kui-dialog-body` text now uses the primary text color instead of the secondary tone, and
  `soft`-shape button text was darkened one palette stop, fixing color contrast below 4.5:1 on
  dialog body copy and soft buttons (axe `color-contrast`).

## [0.4.0] - 2026-07-15

### Added

- Typography primitive: semantic role classes, text tone utilities, generated `--kui-type-*` /
  `--kui-font-weight-*` theme tokens, and the `kuiText` directive.

### Changed

- `kuiButton` loading state now keeps the original content in layout, fades it out, and centers
  the spinner over the button so button size does not shift while loading.

### Fixed

- `kui-field hideErrors` now hides explicit and projected error messages while keeping invalid
  state.
- `kuiButton` text no longer clips descenders like `g` and `p`.

## [0.3.1] - 2026-07-12

### Fixed

- `kui-color-input`'s copy-value button used a non-existent `data-kui-appearance="ghost"`
  attribute (the real API is `data-kui-shape`), so it silently rendered as a solid button
  patched with hardcoded `color`/`padding-inline` overrides to fake the ghost look. Now uses
  `data-kui-shape="ghost"` and the overrides are gone.
- `kuiTooltip` (and `kui-color-input`'s internal swatch/trigger/preset/copy tooltips) could
  pop open on programmatic focus -- e.g. a `kui-popover` auto-focusing its first focusable
  child on open -- even though the user never hovered or tabbed to the element. Tooltips on
  focus now require `:focus-visible`.
- `sticky` on `th[kuiTh]` and `tr[kuiThGroup]` had no effect when used as a bare boolean
  attribute (`<th kuiTh sticky>`) because the input lacked a `booleanAttribute` transform, so
  the attribute's `""` string value was falsy. Both now use `input(false, { transform:
booleanAttribute })`.

## [0.3.0] - 2026-07-11

### Added

- `kuiButton` gains a `loading` input: shows a `kuiLoader` spinner before the button content,
  sets `aria-busy="true"`, and behaves like `disabled` (blocks clicks, removed from tab order).

### Fixed

- `kui-loader` no longer collapses into an oval when its flex container shrinks it (e.g. a
  wrapped, multi-line `kuiButton` label); it now sets `flex-shrink: 0`.

## [0.2.0] - 2026-07-11

### Changed

- **Breaking:** `data-kui-density` no longer affects control height. Height is controlled only
  by `data-kui-size` (`--kui-control-height-*`); density now rebinds `--kui-btn-px`/
  `--kui-input-px` only. `--kui-btn-height-compact`, `--kui-btn-height-regular`, and
  `--kui-btn-height-comfortable` are removed; `--kui-btn-height` now resolves to
  `--kui-control-height-md` unconditionally.
- Fixed: `kuiButton`, `kuiIconButton`, `kui-segmented`, and `kui-tabs` now match `kui-input`
  height (40px) at the default `md` size instead of falling back to the density-driven 32px.

## [0.1.5] - 2026-07-11

### Changed

- **Breaking:** `kuiButton` and `kuiIconButton` now expose independent `shape` (`solid`, `soft`,
  `outline`, `ghost`) and semantic `appearance` (`primary`, `danger`, `success`, `warning`)
  inputs. Existing `appearance="soft|outline|ghost"` usages must move those values to `shape`.
  Every shape can now be combined with every semantic appearance.
- Segmented control padding now defaults to `2px` instead of `4px`.

## [0.1.4] - 2026-07-11

### Added

- `kui-file-upload`: file picker with a drag-and-drop `dropzone` variant or a `compact`
  button-trigger variant, `single`/`multiple` selection mode, client-side `accept`/`maxSize`/
  `maxCount` validation, image thumbnail previews, and a file list with pending/uploading/success/
  error rows. Controlled via a two-way `files` model and a `(retry)` output; no upload transport is
  built in.
- `kui-tree`: hierarchical navigation/selection list with `display` and `checkable` modes,
  indeterminate checkbox cascading, lazy-loaded children via `loadChildren`, and roving-tabindex
  keyboard navigation (arrow keys, Home/End, type-ahead).

### Fixed

- `button[kuiButton] appearance="outline"` (and `[kuiIconButton] appearance="outline"`) now uses
  the neutral `--kui-color-border`/`--kui-color-text` tokens for its border and label, matching
  the Claude Design Button spec. It previously resolved `--kui-btn-outline-border`/
  `--kui-btn-outline-fg` to `--kui-color-primary-fill`, rendering outline buttons with a colored
  brand border/text instead of a neutral one.
- `.kui-checkbox` now styles the native `:indeterminate` state (a dash mark), which was previously
  unstyled and rendered as a plain unchecked box.

## [0.1.3] - 2026-07-10

### Fixed

- `kuiTooltip`: fixed a regression from the CDK Overlay migration in 0.1.2 that pinned every
  tooltip to the top-left corner of the viewport instead of its anchor.

## [0.1.2] - 2026-07-10

### Changed

- Tooltips now render through CDK Overlay instead of appending DOM nodes to `body`, so they layer
  correctly above CDK popover/dropdown surfaces and share the same overlay stack behavior.

### Fixed

- `kui-popover`: click and hover triggers can reopen immediately while the close animation is
  still running, fixing fast close/reopen interactions.
- `kui-popover`: `[trapFocus]="true"` now applies a real CDK focus trap and focuses the first
  focusable element when opened.
- `kui-menu`: pressing ArrowDown/ArrowUp after opening a menu with the mouse now moves focus to
  the first/last item instead of leaving focus on the trigger.
- `kui-dropdown`, `kui-menu`, `kui-popover`, `input[kuiColorInput]`, and `input[kuiSlider]` no
  longer rely on direct `window` access for viewport or pointer tracking, improving SSR safety.
- `input[kuiColorInput]`: generated swatches and copy action use Kikita tooltips instead of
  native `title` tooltips.

## [0.1.1] - 2026-07-10

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

### Changed

- Removed `NgZone`/`runOutsideAngular`/`zone.run` from `kui-dropdown`, `kui-menu`, `kui-popover`,
  and the shared `kui-floating-panel.util` dismissal helper — dead weight under
  `provideZonelessChangeDetection()`, where zone.js isn't loaded and these calls were inert
  shims. Signal writes drive change detection directly now.

### Fixed

- Docs: clarified that `kui-dropdown`'s `panelWidth` is a plain input consumers already control
  directly in their own template (e.g. switching a date picker's `kui-dropdown` to
  `panelWidth="anchor"`), and that doing so alone doesn't shrink `kui-calendar` itself (it has a
  fixed width) — use the new `--kui-calendar-width` custom property for that.
- `kui-popover`: a `hover`-triggered popover reopened itself immediately after closing (visually
  stuck open/focused until the pointer left and re-entered the trigger). Closing any popover
  focused its trigger for keyboard/click accessibility, but for `hover` triggers that focus call
  itself fired `focusin` on the trigger, which the hover trigger directive treats as "reopen".
  Focus restoration on close is now skipped for `triggerType="hover"`.
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
  that cap is against the _whole_ viewport, not the space left between the anchor and the
  screen edge on the side the panel flipped to. Panels now measure their real rendered position
  and shrink `max-height` further whenever they'd still overflow. This clamp, and the panel's
  position, now also re-run on window resize (via a `window.resize` listener — a `ResizeObserver`
  on `document.documentElement` was tried first, but that only tracks the element's content box,
  not the viewport, so it silently never fires when page content is shorter than the viewport)
  and on scroll that only shifts the anchor without changing which side the panel is flipped to
  (previously only a `positionChanges`-triggered reposition re-ran the clamp, so scrolling open
  more room without a flip left a panel stuck smaller than it needed to be).
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

[Unreleased]: https://github.com/kikita-labs/kikita-ui/compare/v0.6.2...HEAD
[0.6.2]: https://github.com/kikita-labs/kikita-ui/compare/v0.6.1...v0.6.2
[0.6.1]: https://github.com/kikita-labs/kikita-ui/compare/v0.6.0...v0.6.1
[0.6.0]: https://github.com/kikita-labs/kikita-ui/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/kikita-labs/kikita-ui/compare/v0.4.6...v0.5.0
[0.4.6]: https://github.com/kikita-labs/kikita-ui/compare/v0.4.5...v0.4.6
[0.4.5]: https://github.com/kikita-labs/kikita-ui/compare/v0.4.4...v0.4.5
[0.4.4]: https://github.com/kikita-labs/kikita-ui/compare/v0.4.3...v0.4.4
[0.4.3]: https://github.com/kikita-labs/kikita-ui/compare/v0.4.2...v0.4.3
[0.4.0]: https://github.com/kikita-labs/kikita-ui/compare/v0.3.1...v0.4.0
[0.3.1]: https://github.com/kikita-labs/kikita-ui/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/kikita-labs/kikita-ui/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/kikita-labs/kikita-ui/compare/v0.1.5...v0.2.0
[0.1.5]: https://github.com/kikita-labs/kikita-ui/compare/v0.1.4...v0.1.5
[0.1.4]: https://github.com/kikita-labs/kikita-ui/releases/tag/v0.1.4
[0.1.3]: https://github.com/kikita-labs/kikita-ui/releases/tag/v0.1.3
[0.1.2]: https://github.com/kikita-labs/kikita-ui/releases/tag/v0.1.2
[0.1.1]: https://github.com/kikita-labs/kikita-ui/releases/tag/v0.1.1
[0.1.0]: https://github.com/kikita-labs/kikita-ui/releases/tag/v0.1.0

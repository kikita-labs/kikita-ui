# Component Roadmap

## Phase 1

- Theme foundation
- Typography (done as CSS role/tone utility classes plus `kuiText` directive)
- Icon abstraction (done as `kui-icon`; default Lucide resolver, registry/resolver overrides, named
  size presets, and numeric/CSS custom sizes)
- Button
- IconButton
- Field (affixes, field actions, input-group focus delegation, and rich messages covered from Claude spec 33)
- Input
- Group
- Playground component board

## Phase 2

- Signal Forms integration spike (native `kuiInput` + Angular `[formField]` proven)
- Textarea (done as `textarea[kuiTextarea]`)
- Checkbox (done as `input[type=checkbox][kuiCheckbox]`)
- Switch (done as `input[type=checkbox][kuiSwitch]`)
- Radio (done as `input[type=radio][kuiRadio]`)
- Badge (done as `[kuiBadge]`)
- Avatar (done as `kui-avatar` + `kui-avatar-group`)
- Loader (done as `[kuiLoader]`)
- Skeleton (done as `[kuiSkeleton]`)
- Empty State (done as `kui-empty-state` + projected icon/actions markers)
- Tooltip (done as `[kuiTooltip]`; adaptive touch tap trigger, configurable through DI and local `triggerType`)
- Card (done as `[kuiCard]`)
- Tabs (done as `kui-tabs`)
- Segmented (done as `kui-segmented`)
- Table primitives (done as `table[kuiTable]`; deeper static accessibility review completed, browser/AT review pending)

## Phase 3

- Select (done as `input[kuiSelect]` with `kui-dropdown` and `kuiOption`; multiple mode renders field-internal chips with collapsed `+N` overflow and supports `ng-template[kuiSelectValue]`)
- Dropdown (done as `kui-dropdown` + `[kuiDropdownFor]` + `[kuiOption]`; controlled `open` model;
  field auto-wiring via `contentChild`; pointer and keyboard option selection)
- Popover (done as `kui-popover` + `[kuiPopoverFor]`)
- Dialog (done as `kui-dialog` + dialog service)
- Confirm (done as `kuiConfirm()` on top of Dialog)
- Toast (done as toast provider/service + viewport; reactive persistence, ref updates, and service dismissal)
- Accordion (done as `kui-accordion`)
- Progress (done as `kui-progress`)
- Slider (done as `input[type=range][kuiSlider]`; `kui-field` id/ARIA/invalid wiring covered)
- Number input (done as `input[type=number][kuiNumberInput]`)
- Menu (done as `kui-menu` + `[kuiMenuFor]` + `button/a[kuiMenuItem]` + `hr[kuiSeparator]`; submenu, checkbox/radio items, and context-menu helper deferred per Claude brief)
- Separator (done as `hr[kuiSeparator]`; Menu uses the generic separator directly)
- Drawer (done as `kuiDrawer()` typed CDK overlay with side and size presets)
- Chip (done as `[kuiChip]` with a `removable` default remove button, plus `button[kuiChipRemove]`
  as the escape hatch for a fully custom remove control; Select multiselect uses
  `button[kuiChipRemove]` for selected values)
- Combobox (done as `input[kuiCombobox]` with projected `kui-dropdown`/`kuiOption`, search output, highlight pipe, free mode, and provider defaults)
- Command Palette (done as `kui-command-palette`; supports grouped commands, filtering with label highlights, loading skeleton rows, empty state, keyboard navigation, and CDK overlay focus trapping)
- Scrollbar (done as `.kui-scroll` CSS utility plus internal scroll-container styling for dropdown, dialog, drawer, and command palette)

## Phase 4

- Color Input (done as `input[kuiColorInput]` for the kikita-ui-docs theme playground seed editor; supports hex and OKLCH text entry, swatch preview, chevron trigger, Kikita popover picker, 2D lightness/chroma surface, hue slider, L/C/H inputs, seed presets, copy action, `kui-field` composition, sizes, disabled, readonly, invalid state, and last-valid-color behavior while invalid)
- Stepper (done as `kui-stepper` + `kui-step`; horizontal/vertical orientation, sm/md/lg sizes, compact dots-only mode, done/current/upcoming/disabled/error states derived from `currentIndex`, clickable done-step back navigation, optional non-linear forward jumps)
- Breadcrumbs (done as `ol[kuiBreadcrumbs]` + `a|span[kuiBreadcrumbItem]` + `li[kuiBreadcrumbSeparator]`; sm/md/lg sizes, link/plain-text/current crumb variants, leading icon slot, CSS-only truncate/ellipsis/first-last responsive building blocks with overflow-menu wiring left to the consumer)

## Phase 5

- Calendar (done as `kui-calendar`; single-date selection only as of this release -- `mode` and the `Date | KuiDateRange | null` union `value` were split out. Month/year/decade navigation, keyboard support, `minDate`/`maxDate`/`disabledDates`, `flat` variant, `viewDate`/`showPrevNav`/`showNextNav` for linked-pair layouts, `KUI_LOCALE`-driven month/weekday names via `Intl`; multi-date selection deferred, no concrete use case yet)
- Calendar Range (done as `kui-calendar-range`; split out of `kui-calendar`'s former `mode="range"`. Start/end pair selection with hover preview and reversed-range normalization, same month/year/decade navigation, keyboard support, `minDate`/`maxDate`/`disabledDates`, `flat` variant, `viewDate`/`showPrevNav`/`showNextNav`, `KUI_LOCALE`-driven locale as `kui-calendar`; not yet composed into a popover-based range picker)
- Date Picker (done as `input[kuiDatePicker]` + `kui-calendar` + `kui-dropdown`; `dd.MM.yyyy` text mask, `minDate`/`maxDate`, `clearable`, Signal Forms control contract. `input[kuiDatePicker]` now auto-discovers a sibling `kui-calendar` inside the same `kui-field` and auto-wires `value`/`viewDate` via `effect()`s -- manual `[value]`/`(valueChange)`/`[(viewDate)]` binding on the calendar is optional, kept working for backward compatibility. `minDate`/`maxDate` are not auto-forwarded, since `kui-calendar` declares them as plain inputs. Range mode (pairing with `kui-calendar-range`) and a mobile bottom-sheet popover variant are not implemented -- single-date only for now)

## Phase 6

- Tree (done as `kui-tree` + recursive internal `kui-tree-node`; `display` and `checkable` modes,
  indeterminate checkbox cascading, lazy-loaded children via `loadChildren`, roving-tabindex
  keyboard navigation with type-ahead; per-node `icon` is limited to the built-in `folder`/`file`
  glyphs -- a custom icon `TemplateRef` slot and virtualization are not implemented)

## Phase 7

- File Upload (done as `kui-file-upload`; `dropzone` and `compact` variants, `single`/`multiple`
  mode, client-side `accept`/`maxSize`/`maxCount` validation, drag-and-drop, image thumbnail
  previews, and a file list with pending/uploading/success/error rows. It is a controlled
  component -- no upload transport is built in; the consumer drives `status`/`progress` on the
  two-way `files` model and responds to `(retry)`. Built ahead of the original "wait for a real
  consumer" gate because a real consumer need now exists.)

## Phase 8

- Alert (done as `kui-alert`; inline notification companion to Toast, built from Claude Design spec
  `01 Alert.dc.html`. `neutral`/`info`/`success`/`warning`/`danger` appearances x `soft`/`outline`/
  `solid` shapes, `sm`/`md` sizes, optional icon reusing Toast's severity mapping and rendered as
  inline SVG from `kui-chrome-icon-paths.util` -- same synchronous, SSR-safe chrome pattern as
  Toast, not the async name-resolved `kui-icon` -- optional title/message, optional inline
  `kuiButton` ghost action, optional `kuiIconButton` ghost close (icon projected as inline SVG,
  not the `icon` input), `banner` full-width no-radius variant. `role="alert"`/`aria-live="assertive"`
  only for `danger`, `role="status"`/`aria-live="polite"` otherwise, always `aria-atomic="true"`,
  same pattern as Toast. Controlled component -- `(closed)` only notifies the consumer, it does not
  remove itself from the DOM. `[kuiAlertTitle]`/`[kuiAlertIcon]`/`[kuiAlertMessage]`/
  `[kuiAlertActions]` marker directives let a consumer project custom title/icon/message/action
  content instead of the plain-string inputs, the same shorthand-input-or-projected-content
  pattern `kui-empty-state` uses.)
- OTP Input (done as `kui-otp-input`; row of single-character cells for a one-time verification
  code/PIN, built from Claude Design spec `02 OTP Input.dc.html`. Composite component (not a
  directive) because it needs roving keyboard navigation, paste distribution, and coordinated
  per-cell value state -- each cell still renders the kit's own `input[kuiInput]` unmodified,
  only cell layout is overridden. `length` (default `6`), `size` (`xs`/`sm`/`md`/`lg`), `mask`
  (password-style cells), `integerOnly` (digits-only numeric keyboard vs. uppercased alphanumeric
  for backup codes), `loading` (disables cells + shows `Loader`), `invalid`/`disabled`/`readOnly`,
  `autoFocus`. Implements `FormValueControl<string>` for `[formField]` on `kui-otp-input` itself,
  the same pattern `kui-segmented` uses; `kui-field` wraps it for label/hint/error. No built-in
  success/error status icon after verification -- an intentional scope decision, since the
  component cannot know a server verification result on its own.)
- Pagination (done as `kui-pagination`; navigation between pages of a long list/table, built from
  Claude Design spec `03 Pagination.dc.html`. Composed entirely from existing primitives --
  `button[kuiButton]` for page numbers, `button[kuiIconButton]` for First/Prev/Next/Last,
  `input[kuiSelect]` for the rows-per-page picker -- plus a static non-interactive ellipsis, the
  one piece of markup with no kit primitive. `variant` (`full`/`compact`/`simple`), `size`
  (`xs`/`sm`/`md`/`lg`, same scale as `Button`), `totalPages` (required), `currentPage`/`pageSize`
  (two-way models), `siblingCount`/`boundaryCount` (MUI `usePagination` vocabulary), `totalItems`,
  `disabled`. Standalone sibling of `table[kuiTable]`, never nested inside it -- `kuiTable` is a
  directive on a bare `<table>` (whose only legal children are thead/tbody/tfoot/tr) with no
  slicing concept of its own, so the consuming page owns `currentPage`/`pageSize` and derives the
  table's page slice, the same composition Angular Material uses for `mat-paginator` +
  `mat-table`/`DataSource`; no DI link between the two components was added. Not a
  `FormValueControl` -- page-level navigation state, not a form field value, so it is never placed
  inside `kui-field`. Current page marked with `shape="solid" appearance="primary"` plus
  `aria-current="page"`, matching the Claude Design spec exactly. First/Prev/Next/Last render as
  static inline SVG chrome (`kui-chrome-icon-paths.util`), not `IconButton`'s network-dependent,
  name-resolved `icon` input -- the same as `kui-select`'s dropdown chevron and `kui-tabs`' scroll
  chevrons.)
- Time Picker (done as `input[kuiTimePicker]` + `kui-time-picker-panel`; new pattern (not among the
  43 pre-existing kit components), built from Claude Design spec `04 Time Picker.dc.html`. Composed
  entirely from existing primitives -- `Field`, `Input` (trigger), `Dropdown` (Tier 3, the same
  primitive `kuiDatePicker` uses), `Segmented` (AM/PM), `Button` (footer "Now"/"Done") -- plus
  hand-rolled `role="listbox"`/`role="option"` scrollable hour/minute/second columns, since the kit
  has no ready-made "wheel" primitive. `format` (`24h`/`12h`), `hourStep`/`minuteStep`/`secondStep`,
  `showSeconds`, `minTime`/`maxTime`, `disabledHours`/`disabledMinutes`/`disabledSeconds`,
  `clearable`, `disabled`/`readonly`/`invalid`,
  `value`/`(valueChange)` as `Date | null` (hours/minutes/seconds only) -- the same conventions
  `kuiDatePicker` already established. The directive auto-wires a sibling `kui-time-picker-panel`
  inside the same `kui-field`, mirroring `kuiDatePicker` + `kui-calendar` exactly. Selecting a
  column cell does not auto-close the panel (Enter/Escape/outside click/"Done" do); columns do not
  auto-scroll to the selected value on open (keyboard navigation does scroll). Range mode not
  implemented -- explicit design-brief scope cut.)

## Later

Do not build Charts until a real consumer needs it.

## Known Tech Debt

- ~~`kui-dropdown` injects `NgZone`...~~ Done 2026-07-10: removed `NgZone` from `kui-dropdown`,
  `kui-menu`, `kui-popover`, and the shared `wireFloatingPanelDismissal`/`kui-floating-panel.util`
  helper. Signal writes drive change detection directly now; no zone wrapping anywhere in the
  overlay/floating-panel primitives.

- Architecture hardening before `1.0.0`: internal coordination tokens for Accordion, Dropdown,
  Segmented, Stepper, Tabs, and Table were removed from public barrels. Keep `KUI_DIALOG_CONTEXT`
  and `KUI_DRAWER_CONTEXT` public because consumer-provided dialog/drawer content injects them for
  typed data and close callbacks. Public API freeze review on 2026-07-18 removed accidental
  internal Date Picker formatting helpers from the package root, kept default resolver/providers as
  intentional public extension points, and confirmed config/data `readonly` usage should protect
  library-owned immutable data without restricting consumer-owned mutable models.

- DI defaults audit before `1.0.0`: root `provideKikitaUi({ defaults.size })` now drives public
  size-enabled primitives when local size inputs are omitted. Components with narrower size unions
  apply only supported root values. `kui-icon` is excluded because its `size` is a raw CSS/icon
  size, not a Kikita control-size preset. `kuiProvideButtonOptions` is the only new
  component-specific default provider because button shape/appearance defaults are a repeated
  design-system decision. Field-control clearability is shared through `KuiFieldControlOptions`.
  Do not add provider defaults for every component input; evaluate future candidates from real
  consumer repetition first.

- ESLint is enabled for the library and playground. The gate fails on hard errors and reports
  warnings for current architecture/accessibility debt that needs focused follow-up before those
  rules can safely become blocking: selector edge cases on internal components, aliased public
  inputs, native-event output names, template keyboard/focus warnings, unused variables in tests,
  and expression-statement cleanup.

- Angular workspace package versions should be aligned before release hardening. `pnpm peers check`
  currently reports that `@angular/platform-server@22.0.7` wants
  `@angular/common`, `@angular/compiler`, `@angular/core`, and `@angular/platform-browser` at
  `22.0.7`, while the lockfile has `22.0.1` for those packages.

## Install DX

Angular schematic support is implemented and verified against a fresh Angular
consumer app:

- `ng add @kikita-labs/ui`
- add `node_modules/@kikita-labs/ui/styles/kikita-ui.css` to the consumer app
- add `provideKikitaUi()` to `app.config.ts`
- optionally scaffold default Ember theme seeds with `--theme`
- verified with a local tarball in a fresh Angular 22 app outside this workspace

Initial install documentation lives in `docs/install.md`.

Docs pages exist for implemented primitives through Scrollbar. A full static component audit has been run across implemented primitives for docs presence, JSDoc coverage, public style entrypoint coverage, Cyrillic leakage, overlay/CDK usage, and obvious SSR DOM access. Initial browser snapshot review has been run for Table, Select, Dialog, Popover, Dropdown, Toast, Accordion, Progress, Slider, Number Input, Combobox, and Scrollbar. Committed visual regression baselines now cover representative stable routes; assistive-technology review recording is still pending.

## Post-1.0 Feature Scope

These gaps are intentionally deferred from `1.0.0` because the current public APIs and docs do not
promise them:

- Date Picker range mode and mobile bottom-sheet popover. Ship `1.0.0` as single-date only.
- File Upload Signal Forms control contract. Ship `1.0.0` as a controlled component with two-way
  `files`; add forms integration when a consumer workflow requires it.
- Menu submenu, checkbox/radio items, and context-menu helper. Ship `1.0.0` with basic menu
  actions, grouping, separators, disabled/destructive states, and trigger positioning.
- Tree custom icon template slot and virtualization. Ship `1.0.0` with built-in file/folder/no-icon
  states and lazy loading, without virtual scrolling guarantees.
- Calendar multiple selection mode. Ship `1.0.0` with single/range modes only.

If one of these becomes a real consumer blocker before release, move that item back into a
pre-1.0 fix list and update `docs/state-coverage.md` with the changed decision.

## Consumer Migration Gate

Keep this as the final gate of the current plan. Do not integrate Kikita UI into
an existing Taiga UI surface until the package install flow, browser review, and
accessibility review are stable.

Before migrating `discord-bot` screens, Kikita UI should reach a coherent MVP:

- Phase 1 is published privately.
- Signal Forms direction is proven.
- Textarea, Checkbox, Switch, and Radio exist.
- Badge, Loader, and Card exist.
- Playground covers tokens, theme, states, forms, density, light/dark, and mobile checks.
- Public docs and JSDoc exist for exported primitives.
- Install DX is verified against a fresh Angular app.
- Browser and assistive-technology review is complete for overlay and table primitives.

Current primitive state coverage is tracked in `docs/state-coverage.md`.

After that, migrate one isolated low-risk screen first. Avoid mixed Taiga/Kikita
surfaces unless the screen is explicitly a migration sandbox.

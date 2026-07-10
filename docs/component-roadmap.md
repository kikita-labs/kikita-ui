# Component Roadmap

## Phase 1

- Theme foundation
- Icon abstraction
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
- Tooltip (done as `[kuiTooltip]`)
- Card (done as `[kuiCard]`)
- Tabs (done as `kui-tabs`)
- Segmented (done as `kui-segmented`)
- Table primitives (done as `table[kuiTable]`; deeper static accessibility review completed, browser/AT review pending)

## Phase 3

- Select (done as `input[kuiSelect]` with `kui-dropdown` and `kuiOption`; multiple mode renders field-internal chips with collapsed `+N` overflow and supports `ng-template[kuiSelectValue]`)
- Dropdown (done as `kui-dropdown` + `[kuiDropdownFor]` + `[kuiOption]`; field auto-wiring via `contentChild`)
- Popover (done as `kui-popover` + `[kuiPopoverFor]`)
- Dialog (done as `kui-dialog` + dialog service)
- Confirm (done as `kuiConfirm()` on top of Dialog)
- Toast (done as toast provider/service + viewport)
- Accordion (done as `kui-accordion`)
- Progress (done as `kui-progress`)
- Slider (done as `input[type=range][kuiSlider]`; `kui-field` id/ARIA/invalid wiring covered)
- Number input (done as `input[type=number][kuiNumberInput]`)
- Menu (done as `kui-menu` + `[kuiMenuFor]` + `button/a[kuiMenuItem]` + `hr[kuiSeparator]`; submenu, checkbox/radio items, and context-menu helper deferred per Claude brief)
- Separator (done as `hr[kuiSeparator]`; Menu uses the generic separator directly)
- Drawer (done as `kuiDrawer()` typed CDK overlay with side and size presets)
- Chip (done as `[kuiChip]` + `button[kuiChipRemove]`; Select multiselect uses it for selected values)
- Combobox (done as `input[kuiCombobox]` with projected `kui-dropdown`/`kuiOption`, search output, highlight pipe, free mode, and provider defaults)
- Command Palette (done as `kui-command-palette`; supports grouped commands, filtering with label highlights, loading skeleton rows, empty state, keyboard navigation, and CDK overlay focus trapping)
- Scrollbar (done as `.kui-scroll` CSS utility plus internal scroll-container styling for dropdown, dialog, drawer, and command palette)

## Phase 4

- Color Input (done as `input[kuiColorInput]` for the kikita-ui-docs theme playground seed editor; supports hex and OKLCH text entry, swatch preview, chevron trigger, Kikita popover picker, 2D lightness/chroma surface, hue slider, L/C/H inputs, seed presets, copy action, `kui-field` composition, sizes, disabled, readonly, invalid state, and last-valid-color behavior while invalid)
- Stepper (done as `kui-stepper` + `kui-step`; horizontal/vertical orientation, sm/md/lg sizes, compact dots-only mode, done/current/upcoming/disabled/error states derived from `currentIndex`, clickable done-step back navigation, optional non-linear forward jumps)
- Breadcrumbs (done as `ol[kuiBreadcrumbs]` + `a|span[kuiBreadcrumbItem]` + `li[kuiBreadcrumbSeparator]`; sm/md/lg sizes, link/plain-text/current crumb variants, leading icon slot, CSS-only truncate/ellipsis/first-last responsive building blocks with overflow-menu wiring left to the consumer)

## Phase 5

- Calendar (done as `kui-calendar`; single/range mode, month/year/decade navigation, keyboard support, `minDate`/`maxDate`/`disabledDates`, `flat` variant, `viewDate`/`showPrevNav`/`showNextNav` for linked-pair layouts, `KUI_LOCALE`-driven month/weekday names via `Intl`; `mode="multiple"` deferred, no concrete use case yet)
- Date Picker (done as `input[kuiDatePicker]` + `kui-calendar` + `kui-dropdown`; `dd.MM.yyyy` text mask, `minDate`/`maxDate`, `clearable`, Signal Forms control contract; `mode="range"` and a mobile bottom-sheet popover variant are not implemented — single-date only for now)

## Phase 6

- Tree (done as `kui-tree` + recursive internal `kui-tree-node`; `display` and `checkable` modes,
  indeterminate checkbox cascading, lazy-loaded children via `loadChildren`, roving-tabindex
  keyboard navigation with type-ahead; per-node `icon` is limited to the built-in `folder`/`file`
  glyphs — a custom icon `TemplateRef` slot and virtualization are not implemented)

## Later

Do not build Charts or File Upload until a real consumer needs them.

## Known Tech Debt

- ~~`kui-dropdown` injects `NgZone`...~~ Done 2026-07-10: removed `NgZone` from `kui-dropdown`,
  `kui-menu`, `kui-popover`, and the shared `wireFloatingPanelDismissal`/`kui-floating-panel.util`
  helper. Signal writes drive change detection directly now; no zone wrapping anywhere in the
  overlay/floating-panel primitives.

## Install DX

Angular schematic support is implemented and verified against a fresh Angular
consumer app:

- `ng add @kikita-labs/ui`
- add `node_modules/@kikita-labs/ui/styles/kikita-ui.css` to the consumer app
- add `provideKikitaUi()` to `app.config.ts`
- optionally scaffold default Ember theme seeds with `--theme`
- verified with a local tarball in a fresh Angular 22 app outside this workspace

Initial install documentation lives in `docs/install.md`.

Docs pages exist for implemented primitives through Scrollbar. A full static component audit has been run across implemented primitives for docs presence, JSDoc coverage, public style entrypoint coverage, Cyrillic leakage, overlay/CDK usage, and obvious SSR DOM access. Initial browser snapshot review has been run for Table, Select, Dialog, Popover, Dropdown, Toast, Accordion, Progress, Slider, Number Input, Combobox, and Scrollbar. Committed visual regression baselines and assistive-technology review are still pending.

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

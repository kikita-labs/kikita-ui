# Component Roadmap

## Phase 1

- Theme foundation
- Icon abstraction
- Button
- IconButton
- Field (affixes, field actions, and rich messages covered from Claude spec 33)
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
- Chip (done as `[kuiChip]` + `button[kuiChipRemove]`; Select multiselect and Combobox use it for selected values)
- Combobox (done as `kui-combobox`; supports `ng-template[kuiComboboxValue]`, CDK overlay positioning, multiple chips with collapsed `+N`, and provider defaults)

## Later

- Command palette
- Empty state

Do not build Datepicker, Calendar, Tree, Charts, or File Upload until a real consumer needs them.

## Install DX

Angular schematic support is implemented and verified against a fresh Angular
consumer app:

- `ng add @kikita-labs/ui`
- add `node_modules/@kikita-labs/ui/styles/kikita-ui.css` to the consumer app
- add `provideKikitaUi()` to `app.config.ts`
- optionally scaffold default Ember theme seeds with `--theme`
- verified with a local tarball in a fresh Angular 22 app outside this workspace

Initial install documentation lives in `docs/install.md`.

Docs pages exist for implemented primitives through Combobox. A full static component audit has been run across implemented primitives for docs presence, JSDoc coverage, public style entrypoint coverage, Cyrillic leakage, overlay/CDK usage, and obvious SSR DOM access. Initial browser snapshot review has been run for Table, Select, Dialog, Popover, Dropdown, Toast, Accordion, Progress, Slider, Number Input, and Combobox. Committed visual regression baselines and assistive-technology review are still pending.

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

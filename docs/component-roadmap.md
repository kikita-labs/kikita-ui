# Component Roadmap

## Phase 1

- Theme foundation
- Icon abstraction
- Button
- IconButton
- Field
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
- Loader (done as `[kuiLoader]`)
- Tooltip (done as `[kuiTooltip]`)
- Card (done as `[kuiCard]`)
- Tabs (done as `kui-tabs`)
- Segmented (done as `kui-segmented`)
- Table primitives (done as `table[kuiTable]`; deeper accessibility review still pending)

## Phase 3

- Select
- Dropdown
- Popover
- Dialog
- Confirm
- Toast
- Accordion
- Progress
- Slider
- Number input

## Later

- Avatar
- Menu
- Drawer
- Combobox
- Command palette
- Skeleton
- Empty state

Do not build Datepicker, Calendar, Tree, Charts, or File Upload until a real consumer needs them.

## Install DX

Add Angular schematic support before real consumer migration:

- `ng add @kikita-labs/ui`
- add the styles entrypoint to the consumer app
- add `provideKikitaUi()` to `app.config.ts`
- optionally scaffold a basic theme config
- verify on a fresh Angular app

Initial install documentation lives in `docs/install.md`.

## Consumer Migration Gate

Do not integrate Kikita UI into an existing Taiga UI surface immediately after Phase 1.

Before migrating `discord-bot` screens, Kikita UI should reach a coherent MVP:

- Phase 1 is published privately.
- Signal Forms direction is proven.
- Textarea, Checkbox, Switch, and Radio exist.
- Badge, Loader, and Card exist.
- Playground covers tokens, theme, states, forms, density, light/dark, and mobile checks.
- Public docs and JSDoc exist for exported primitives.

Current primitive state coverage is tracked in `docs/state-coverage.md`.

After that, migrate one isolated low-risk screen first. Avoid mixed Taiga/Kikita surfaces unless the screen is explicitly a migration sandbox.

Docs pages exist for all Phase 2 primitives. Accessibility review for Table, Tooltip, Tabs, and Segmented is still pending.

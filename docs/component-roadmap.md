# Component Roadmap

This register tracks current source scope and unresolved work. Presence in the
repository does not establish publication or a passing quality gate. See
[component docs](README.md), [release history](../CHANGELOG.md), and
[state coverage](state-coverage.md) for contracts and evidence.

## Implemented Source Scope

| Historical delivery phase | Scope documented in this repository                                                                                                                               |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1                         | Theme, typography, icons, buttons, field, input, group, playground                                                                                                |
| 2                         | Signal Forms spike; textarea, checkbox, switch, radio, badge, avatar, loader, skeleton, empty state, tooltip, card, tabs, segmented, table                        |
| 3                         | Select, dropdown, popover, dialog, confirm, toast, accordion, progress, slider, number input, menu, separator, drawer, chip, combobox, command palette, scrollbar |
| 4                         | Color input, stepper, breadcrumbs                                                                                                                                 |
| 5                         | Calendar, calendar range, single-date picker                                                                                                                      |
| 6                         | Tree                                                                                                                                                              |
| 7                         | Controlled file upload                                                                                                                                            |
| 8                         | Alert, OTP input, pagination, time picker, link, media viewer, carousel, splitter                                                                                 |
| 9                         | Line, bar, scatter/bubble, and donut charts; shared legend and tooltip infrastructure                                                                             |

Phase numbers preserve historical context, not a new execution queue. Detailed
contracts belong in the matching component documents. Historical implementation
narratives remain in Git history before the documentation reorganization.

Chart source now uses nominal SVG sizing, shape-specific loading skeletons, and
donut angle recomputation when slices are hidden. Earlier reports of observer
sizing, spinner loading, or frozen donut angles do not describe current source.
See [Chart](chart.md) for current behavior and remaining limits.

## Known Tech Debt

Command Palette retains consumer-owned required IDs. Development builds diagnose
invalid and duplicate IDs across groups; the identity contract and focus-reset
behavior are documented in [Command Palette](command-palette.md).

Scrollbar custom-track research is not a shipped replacement. A Chromium-only
prototype supports the article's CSS feature combination and falls back in
forced-colors, but `animation-range` is not Baseline and Firefox/WebKit still
need verification. Keep native scrollbar styling until a concrete approved
design need and the complete browser/accessibility matrix justify a separate
opt-in primitive; see [Scrollbar](scrollbar.md).

Inherited reports below are retained as investigation items. Dates describe the
original reports, not fresh validation of the current checkout. Reproduce before
fixing or closing them; record new evidence in state coverage.

- Committed visual-regression baselines for `/button`, `/field`, `/select`, `/dialog`, `/table`,
  and `/calendar` (`tests/e2e/visual.spec.ts`) are stale on `release/2.x` as of 2026-09-17 --
  `pnpm.cmd test:browser` fails all 24 desktop/mobile x light/dark combinations with page-height
  diffs (confirmed unrelated to the Chart work in this phase: reproduces identically with the
  Chart playground nav entry reverted). Needs its own investigation (likely accumulated layout
  drift from unrelated changes) and a baseline re-record, not a quick patch.

- `KuiTooltipDirective`'s hover/focus display mode is not fully WCAG 1.4.13 (Content on Hover or
  Focus) compliant: Escape does not dismiss the tooltip in hover/focus mode (only the touch-tap
  branch handles Escape, via `startTapDismissal`), and the tooltip surface is not hoverable
  (moving the pointer from the anchor onto the tooltip itself dismisses it instead of keeping it
  open). Found 2026-09-17 while integrating the chart component's tooltip (see the Chart known gaps); affects every existing `[kuiTooltip]`
  consumer in the kit, not only Chart. Deferred as its own fix -- needs its own test pass across
  hover/focus/touch modes before changing shared directive behavior.

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

## Deferred Feature Scope

These remain explicit scope limits, not automatic release blockers:

- Date Picker range mode and mobile bottom-sheet presentation.
- File Upload Signal Forms integration; upload transport remains consumer-owned.
- Menu submenus, checkbox/radio items, and context-menu helper.
- Tree custom icon template slot and virtualization.
- Calendar multiple-date selection; single and range selection are separate primitives.
- Chart long-label/dense-layout handling, scatter non-color distinguishability,
  configurable donut center/geometry, and visual/AT evidence; see [known gaps](chart.md#known-gaps).

Move an item into active delivery when a concrete consumer requirement warrants
it, and update the component contract and state coverage together.

## Consumer Verification

The initial installation and browser reviews are historical reports, not fresh
certification of this checkout. Follow [installation](install.md) and the
[release gate](release.md) to verify the exact built package in a fresh consumer.

The original Taiga UI migration pilot remains a separate consumer project.
Before migrating a screen, verify package installation, Signal Forms integration,
public docs, keyboard/overlay/table behavior, responsive layouts, and relevant
assistive-technology evidence for the version being installed. Start with one
isolated low-risk screen; avoid mixed surfaces outside an explicit migration
sandbox. This history does not make that consumer migration a v2 package release
requirement.

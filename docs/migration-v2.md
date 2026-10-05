# Migrating to Kikita UI 2.0

This guide covers every breaking change of 2.0.0: renamed exports, tokens, provider defaults, locale and
messages, icons, component behaviour and the Chart. The complete list, including additions and fixes, is
the 2.0.0 (currently `[Unreleased]`) section of [CHANGELOG.md](../CHANGELOG.md). The colour tokens that
changed have their own table in [Theming](theming.md#migrating-to-the-colour-roles) and the default
mechanism is described in [DI Defaults](di-defaults.md).

Work through it in this order: run the automatic migration, then provider defaults, locale, templates
and styles, and last the checks in [Verify the upgrade](#verify-the-upgrade).

## Automatic migration

Update the package, then run the migration that ships with it:

```bash
ng update @kikita-labs/ui
```

`ng update` runs `rename-symbols-v2` for every workspace that moves from 1.x to 2.x. To run it again,
or to run it after you installed the new version yourself:

```bash
ng update @kikita-labs/ui --migrate-only --from=1.8.0 --to=2.0.0
```

The migration reads every TypeScript file that imports from `@kikita-labs/ui` and renames, with the
TypeScript parser, only identifiers:

- named imports, including `import type` and `import { Old as Local }` (only the imported name changes);
- every use of the renamed binding in the file, and `export { Old }` of such a binding, which keeps
  your module's public name (`export { KuiButton as KuiButtonDirective }`);
- re-exports (`export { Old } from '@kikita-labs/ui'`);
- namespace members (`kui.Old` as a value or a type) and `import('@kikita-labs/ui').Old` types.

It never changes strings, comments or templates, it skips `node_modules`, `dist` and `.angular`, and a
second run changes nothing. When the new name is already declared or imported in the same file, that
symbol is left alone and the migration prints a warning with the file and the name; rename it by hand.

It cannot see names used through a dynamic import (`const { KuiButtonDirective } = await
import('@kikita-labs/ui')`) or a property of a lazily loaded module. Search for the old names with:

```bash
git grep -nE "Kui[A-Za-z]+(Component|Directive)\b|KuiToastService|kuiProvideLocale"
```

Selectors, inputs, outputs, `exportAs` names, CSS custom properties and CSS class names do not change,
so templates and styles need no edit.

## The naming rule

- An Angular class is named for what it is, not for the construct that declares it:
  `KuiSeparatorDirective` is now `KuiSeparator`, `KuiTabsComponent` is `KuiTabs`, `KuiToastService` is
  `KuiToast`. This matches Angular 20+ (`ng generate`, Angular Material, CDK and Angular Aria).
- A class name is the PascalCase of its selector: `button[kuiButton]` is `KuiButton`,
  `kui-tabs` is `KuiTabs`.
- A pipe keeps its suffix: `KuiComboboxHighlightPipe`.
- Providers follow Angular's `provideX` convention: `kuiProvideLocale` is now `provideKuiLocale`.
  The deprecated `kuiProvide*Options` helpers keep their names until they are removed in 3.0.
- `kuiToast()`, `kuiDialog()`, `kuiDrawer()`, `kuiConfirm()` and `kuiMediaViewer()` are unchanged.

There are no compatibility aliases: the old names no longer exist in 2.0.

## Renamed exports

These names were exported by 1.8.0.

| 1.x name                          | 2.0 name                 |
| --------------------------------- | ------------------------ |
| `KuiAccordionComponent`           | `KuiAccordion`           |
| `KuiAccordionIconDirective`       | `KuiAccordionIcon`       |
| `KuiAccordionItemComponent`       | `KuiAccordionItem`       |
| `KuiAvatarComponent`              | `KuiAvatar`              |
| `KuiAvatarGroupComponent`         | `KuiAvatarGroup`         |
| `KuiBadgeDirective`               | `KuiBadge`               |
| `KuiBreadcrumbItemDirective`      | `KuiBreadcrumbItem`      |
| `KuiBreadcrumbSeparatorComponent` | `KuiBreadcrumbSeparator` |
| `KuiBreadcrumbsDirective`         | `KuiBreadcrumbs`         |
| `KuiButtonDirective`              | `KuiButton`              |
| `KuiCalendarComponent`            | `KuiCalendar`            |
| `KuiCardDirective`                | `KuiCard`                |
| `KuiCellDirective`                | `KuiCell`                |
| `KuiCheckboxDirective`            | `KuiCheckbox`            |
| `KuiChipDirective`                | `KuiChip`                |
| `KuiChipRemoveDirective`          | `KuiChipRemove`          |
| `KuiColorInputDirective`          | `KuiColorInput`          |
| `KuiComboboxDirective`            | `KuiCombobox`            |
| `KuiCommandPaletteComponent`      | `KuiCommandPalette`      |
| `KuiDatePickerDirective`          | `KuiDatePicker`          |
| `KuiDropdownComponent`            | `KuiDropdown`            |
| `KuiDropdownForDirective`         | `KuiDropdownFor`         |
| `KuiEmptyStateActionsDirective`   | `KuiEmptyStateActions`   |
| `KuiEmptyStateComponent`          | `KuiEmptyState`          |
| `KuiEmptyStateIconDirective`      | `KuiEmptyStateIcon`      |
| `KuiErrorDirective`               | `KuiError`               |
| `KuiFieldActionDirective`         | `KuiFieldAction`         |
| `KuiFieldAffixDirective`          | `KuiFieldAffix`          |
| `KuiFieldAffixIconDirective`      | `KuiFieldAffixIcon`      |
| `KuiFieldComponent`               | `KuiField`               |
| `KuiFileUploadComponent`          | `KuiFileUpload`          |
| `KuiGroupDirective`               | `KuiGroup`               |
| `KuiHintDirective`                | `KuiHint`                |
| `KuiIconButtonDirective`          | `KuiIconButton`          |
| `KuiIconComponent`                | `KuiIcon`                |
| `KuiInputDirective`               | `KuiInput`               |
| `KuiInputGroupDirective`          | `KuiInputGroup`          |
| `KuiLabelDirective`               | `KuiLabel`               |
| `KuiLoaderDirective`              | `KuiLoader`              |
| `KuiMenuComponent`                | `KuiMenu`                |
| `KuiMenuForDirective`             | `KuiMenuFor`             |
| `KuiMenuHeaderDirective`          | `KuiMenuHeader`          |
| `KuiMenuItemDirective`            | `KuiMenuItem`            |
| `KuiNumberInputDirective`         | `KuiNumberInput`         |
| `KuiOptionDirective`              | `KuiOption`              |
| `KuiPopoverComponent`             | `KuiPopover`             |
| `KuiPopoverForDirective`          | `KuiPopoverFor`          |
| `KuiProgressComponent`            | `KuiProgress`            |
| `KuiRadioDirective`               | `KuiRadio`               |
| `KuiRowDirective`                 | `KuiRow`                 |
| `KuiSegmentDirective`             | `KuiSegment`             |
| `KuiSegmentedComponent`           | `KuiSegmented`           |
| `KuiSelectCellComponent`          | `KuiSelectCell`          |
| `KuiSelectDirective`              | `KuiSelect`              |
| `KuiSelectThComponent`            | `KuiSelectTh`            |
| `KuiSelectValueDirective`         | `KuiSelectValue`         |
| `KuiSeparatorDirective`           | `KuiSeparator`           |
| `KuiSkeletonDirective`            | `KuiSkeleton`            |
| `KuiSliderDirective`              | `KuiSlider`              |
| `KuiStepComponent`                | `KuiStep`                |
| `KuiStepperComponent`             | `KuiStepper`             |
| `KuiSwitchDirective`              | `KuiSwitch`              |
| `KuiTabDirective`                 | `KuiTab`                 |
| `KuiTabPanelDirective`            | `KuiTabPanel`            |
| `KuiTableDirective`               | `KuiTable`               |
| `KuiTabsComponent`                | `KuiTabs`                |
| `KuiTextDirective`                | `KuiText`                |
| `KuiTextareaDirective`            | `KuiTextarea`            |
| `KuiThDirective`                  | `KuiTh`                  |
| `KuiThGroupDirective`             | `KuiThGroup`             |
| `KuiToastService`                 | `KuiToast`               |
| `KuiTooltipDirective`             | `KuiTooltip`             |
| `KuiTreeComponent`                | `KuiTree`                |
| `kuiProvideLocale`                | `provideKuiLocale`       |

## Provider defaults

Component defaults moved from six injection tokens to one mechanism, `KuiDefaults`. See
[DI Defaults](di-defaults.md) for the keys.

| 1.x                                                                               | 2.0                                                                     |
| --------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `KUI_BUTTON_OPTIONS`, `KUI_FIELD_OPTIONS`, `KUI_SELECT_OPTIONS`                   | removed; use `provideKuiDefaults({ button, field, select })`            |
| `KUI_COMBOBOX_OPTIONS`, `KUI_TOOLTIP_OPTIONS`, `KUI_TOAST_OPTIONS`                | removed; use `provideKuiDefaults({ combobox, tooltip, toast })`         |
| `kuiProvideButtonOptions`, `kuiProvideFieldOptions`, `kuiProvideSelectOptions`    | deprecated, forward to `provideKuiDefaults`, removed in 3.0             |
| `kuiProvideComboboxOptions`, `kuiProvideTooltipOptions`, `provideKuiToastOptions` | deprecated, forward to `provideKuiDefaults`, removed in 3.0             |
| `provideKikitaUi({ tooltip })`                                                    | deprecated; use `provideKikitaUi({ defaults: { tooltip } })`            |
| `KikitaUiDefaults`                                                                | deprecated alias of `KuiComponentDefaults`                              |
| `KuiButtonOptions` as `{ button, iconButton }`                                    | `KuiButtonProviderOptions`; `KuiButtonOptions` now describes one button |

Behaviour that differs from 1.x:

- A nested provider merges with its parent per property. In 1.x `kuiProvideFieldOptions`,
  `kuiProvideSelectOptions`, `kuiProvideComboboxOptions` and `kuiProvideButtonOptions` replaced the whole
  parent object, so a subtree that set one property dropped the rest.
- The global control size is reactive: changing `defaults.size` updates components that are already
  rendered.
- Providing `KIKITA_UI_OPTIONS` directly no longer sets the default size. Use
  `provideKuiDefaults({ size })` for a subtree.
- The inputs that now resolve through the defaults (Popover, Menu, Dropdown, Calendar, Carousel, Pagination
  and others) are `undefined` when omitted. Their rendered default is unchanged; code that reads such an
  input back and expects the old literal must read the resolved value instead.
- `KuiStepperContext.linear` is `effectiveLinear`, `KuiTreeContext.mode` is `effectiveMode` and
  `KuiSplitterContext.orientation` is `effectiveOrientation`.

## Locale and messages

All text the library owns is a typed message with an English default; see [Internationalization](i18n.md).

- `kuiProvideLocale` is `provideKuiLocale`. It returns `Provider[]` (it returned one `Provider`), so spread
  it where you used it as a single entry, and it accepts a `Signal` and works for a subtree.
- A requested locale is checked against the runtime's `Intl` and falls back to `en-US` instead of the host's
  default locale. `LOCALE_ID` is not read implicitly; use `provideKikitaUi({ locale: () => inject(LOCALE_ID) })`.
- On the server `KUI_LOCALE` follows the request's `Accept-Language` and the browser reuses it through
  `TransferState`. A cache in front of the server must send `Vary: Accept-Language`, or the application can
  pin a locale with `provideKuiLocale`.
- The library ships English only. Translate with `provideKikitaUi({ messages })`, `provideKuiMessages` or the
  `messages` input of the components that have one. Inputs that carried an English default (`ariaLabel` of
  Pagination, Carousel, Menu, Popover, Tree and OTP Input, `closeLabel` of Alert, `label` of Avatar Group and
  Loader, `placeholder` of Command Palette and Date Picker, `errorLabel` of Tab) are `undefined` when omitted;
  the rendered text is unchanged.
- Date Picker formats and parses the numeric layout of the locale (`10/03/2026` in `en-US`, `03.10.2026` in
  `ru-RU`) instead of a fixed `dd.MM.yyyy`. Set `format="dd.MM.yyyy"` or `defaults.datePicker.format` to
  keep the old layout.
- Time Picker defaults to the locale's hour cycle (`12h` in `en-US`). Set `format="24h"` or
  `defaults.timePicker.format` to keep the old default.
- Calendar and Calendar Range name each day button with its full localized date, take the first day and the
  weekend from the locale and mark the weekend of the locale. Tests that look up a day button by its bare
  number must use the full date as the accessible name.
- The default chart `valueFormat` is the locale's compact notation, File Upload sizes use `Intl` units
  (`2.5 MB`, `340 kB`) and Pagination, Carousel, Media Viewer and OTP positions are formatted with the
  locale (`1,234`).
- Removed internals: `KUI_CALENDAR_NAVIGATION_LABELS`, and the Date Picker `formatDisplayDate` and
  `parseDisplayDate` helpers.

## Icons

- Structural icons (close, clear, chevrons, status marks and similar) are drawn by one renderer and can be
  replaced through `defaults.icons` and per-component slots; see [Structural Icons](structural-icons.md).
  Default shapes, sizes and weights are unchanged.
- The default Lucide set is read at a pinned `lucide-static` version (`1.51.0`, it was the floating `@1`)
  and converted to glyph data, not inserted as trusted HTML. Allow `connect-src https://cdn.jsdelivr.net`
  in a Content Security Policy, or serve the files yourself with `createKuiLucideResolver({ baseUrl })`.
- A name that is not a Lucide kebab-case name resolves to nothing without a request.
- `KuiIconSource` is still the markup string type; resolvers and registries may also return `KuiIconGlyph`.
- The internal `kui-chrome-icon-paths.util` module is removed.

## Component behaviour changes

- **OTP Input:** the `readOnly` input is `readonly`, the name the Signal Forms contract binds. Rename it in
  templates; there is no alias.
- **Toast:** the region is a manual popover in the browser top layer and sits above open dialogs and drawers.
  `defaults.toast.position` and `maxVisible` follow runtime changes. A `persistent` signal that turns `false`
  resumes the time left, and `ref.update({ duration: undefined })` uses the configured default duration.
- **Select:** an `input[kuiSelect]` bound with `[formField]` shows `aria-invalid` only after the field is
  touched. A multiple Select keeps its panel open when an option is chosen with Enter or Space.
- **Required state:** `kui-field` exposes its required state as `aria-required` on the controls that support
  it. Snapshot tests of the rendered markup change.
- **Calendar and Calendar Range:** the markup is a full ARIA grid: day buttons sit in `role="gridcell"`
  elements inside `role="row"` weeks, and `aria-selected` is on the gridcell. CSS that targets
  `.kui-calendar-grid > .kui-calendar-day` must target `.kui-calendar-day` or the new
  `.kui-calendar-week` and `.kui-calendar-cell` wrappers (both `display: contents`).
- **Splitter:** the `role="separator"` is an inner element of `kui-splitter-gutter` and the collapse button is
  its sibling. The gutter host carries no `role`, `aria-*` or `tabindex`; style it through
  `data-kui-orientation`, `data-kui-disabled` and `data-kui-dragging`. Each pane renders its generated `id`.
- **File Upload:** the "Choose file" label and the native file input are `aria-hidden`; the dropzone is the
  only interactive element.
- **Carousel:** the slide track is a tab stop while `draggable` is `true`.
- **Focus:** every focusable part draws a solid 2px `outline` in `--kui-color-focus`. A ring drawn only with
  `box-shadow` is gone, and `--kui-input-focus-ring` defaults to `none`.
- **Disabled state:** every disabled control dims to `--kui-opacity-disabled` (`0.5`); see the token notes
  above.
- **Dropdown:** closing a panel after a selection returns focus to the control, and Escape returns it to the
  field control. `KuiDropdown.setAnchor` takes an optional third argument naming the focus-return element.
- **Coercion:** static numeric attributes of Progress, Avatar, Avatar Group, Time Picker, Pagination, OTP
  Input, Splitter Pane, Carousel, Dropdown, Menu and Popover are coerced, and an invalid value falls back to
  a safe default instead of reaching ARIA or CSS.
- **Inputs:** `type="number"` fields built with `kuiInput` no longer show the browser's own arrows (use
  `kuiNumberInput` for step buttons) and `type="search"` fields no longer show the browser's own clear cross.
- **Command Palette:** command ids must be stable, unique and non-empty. Development builds report empty,
  whitespace-containing and duplicate ids.
- **Autofocus:** `kuiAutoFocus` is new. OTP Input `autoFocus` focuses the first cell that can take focus,
  and the Command Palette focuses its search input after render instead of in a microtask.

## Packaging and styles

- Each primitive's stylesheet lives beside its component. `@kikita-labs/ui/styles` and `kikita-ui.css` are
  still the only public style paths.
- `kui-field` and `kui-icon` styles moved from component-scoped files into the `kui.components` layer, so
  both need `kikita-ui.css` like every other component (`ng add` installs it). An unlayered application rule
  overrides them without raising specificity.
- Controls no longer import `kui-field`; they inject the internal `KUI_FIELD` token. No selector, input or
  output changed. `KuiField.getDropdown()`, `getCalendar()` and `getTimePickerPanel()` now find the part
  anywhere inside the field, not only among its direct content.
- `theme-default.css` is part of `@kikita-labs/ui/styles`, so the default theme works from CSS alone. The
  generated theme sheet sits in the `kui.tokens` layer, declared before `kui.base` and `kui.components`, so a
  variable you write outside any layer wins regardless of source order.
- `provideKikitaUi()` sets `data-kui-density` on `<html>` from `seeds.density`, on the server too, unless the
  page already set it.
- `provideKikitaUi` now lives in `lib/root`; the public import is unchanged.

## Right-to-left

Right-to-left layouts are not supported in 2.0. No primitive has direction-aware behaviour, and the
browser suites only check that a right-to-left page does not overflow.

## Token and style changes

The tokens of 2.0 keep their names, with these exceptions. The colour tokens have their own table in
[Theming](theming.md#migrating-to-the-colour-roles).

- Component tokens that only mapped a role onto a semantic or base token (322, for example `--kui-card-bg`,
  `--kui-btn-solid-bg`, `--kui-input-height`) are no longer defined by the generated stylesheet or returned in
  `createKuiTheme().component`. Each component states the default as a fallback chain in its own CSS, so an
  override on an ancestor, at any level, reaches the component. Setting a component token works as before;
  reading one in your own CSS with `getComputedStyle` now returns an empty string unless it is set.
- Components no longer declare their own public tokens on their element (123 tokens such as
  `--kui-alert-radius`, `--kui-badge-height`, `--kui-carousel-dot-bg`). Per-variant defaults live in private
  `--_kui-*` variables and the public token wins at any level.
  `--kui-badge-height`, `--kui-switch-width`, `-height`, `-thumb-size` and `-thumb-translate`,
  `--kui-radio-size`, `--kui-loader-size` and `-border-width`, `--kui-stepper-circle-size`,
  `--kui-tree-row-height`, `--kui-file-upload-item-height` and `--kui-file-upload-thumbnail-size` are no
  longer generated.
- The Button compatibility aliases `--kui-btn-bg`, `--kui-btn-bg-hover`, `--kui-btn-bg-active`,
  `--kui-btn-color`, `--kui-btn-secondary-bg`, `--kui-btn-secondary-bg-hover`, `--kui-btn-secondary-color`,
  `--kui-btn-outline-bg-hover`, `--kui-btn-ghost-bg-hover`, `--kui-btn-focus-ring-width`,
  `--kui-btn-focus-ring-offset` and `--kui-btn-focus-ring`, and the legacy Select tokens `--kui-select-bg`,
  `--kui-select-border`, `--kui-select-border-hover`, `--kui-select-border-focus`,
  `--kui-select-border-error` and `--kui-select-radius`, are removed. The replacements are listed in
  [Removed In 2.0](tokens.md#removed-in-20).
- Button and Icon Button read the canonical `--kui-btn-solid-*` and `--kui-btn-soft-*` tokens, and the
  `danger`, `success` and `warning` appearances read `--kui-btn-<appearance>-bg*`, so a token set on an
  ancestor now restyles Button in that scope. `--kui-btn-danger-fg` sets the solid danger label colour.
- `--kui-input-text` and `--kui-input-color` are both honoured by `kuiInput` and `kuiNumberInput`.
- Seeds and palettes: `seeds.neutral` now drives the surface, border, text, skeleton and scrollbar roles;
  `--kui-neutral-1` to `-12` are two scales, one per mode, and `theme.palettes.neutral` is the light scale
  (the neutral variables are no longer part of `theme.paletteVariables`). Accent steps sit at fixed tones, so
  the ramps move by at most 0.035 ΔE. The default `warning` seed is `oklch(0.56 0.15 65)` and the default
  `info` seed is `oklch(0.53 0.14 215)`; pass your own seeds to keep other colours.
- Text on solid fills is white on every default accent, in both modes, and interactive control borders are
  stronger at rest. Use `--kui-color-<role>-on-fill`, `-text` and `-indicator` in your own CSS.
  `--kui-color-on-fill` and `--kui-color-primary-focus-ring` still exist but are deprecated and removed in 3.0.
- Hover and pressed fills of list options, menu items, calendar days, tabs and ghost buttons read
  `--kui-color-state-hover` and `--kui-color-state-active`.
- Windows High Contrast: `forced-colors.css`, imported last by `kikita-ui.css`, states checked controls,
  Slider, Progress, selected cells, Tabs, Segmented, pressed Chip and Stepper with system colours.
- The Slider thumb halo follows the primary seed, not a hard-coded purple.

- Hooks that used to be defined on `:root` as literals (`--kui-btn-focus-ring-w`, `--kui-btn-disabled-opacity`,
  `--kui-chip-disabled-opacity`, `--kui-dialog-backdrop`, the component font-weight tokens, ...) are not generated
  any more. Code that reads them with `getComputedStyle` gets an empty string; CSS that sets them keeps working.
  Set the shared token (`--kui-focus-ring-width`, `--kui-opacity-disabled`, `--kui-color-scrim`,
  `--kui-font-weight-semibold`, ...) to change every component at once. The full list is in
  [Defaults That Moved Into CSS](tokens.md#defaults-that-moved-into-css).
- Card, Segmented, Tabs and Table no longer follow `--kui-btn-focus-ring-w` and `--kui-btn-focus-ring-off`.
  Set `--kui-focus-ring-width` and `--kui-focus-ring-offset` instead.
- Every disabled state dims to `--kui-opacity-disabled` (`0.5`). If a theme relied on a lighter dimming of
  inputs (`0.65`) or checkboxes (`0.55`), set the token on the subtree.
- Line heights follow the type roles and `--kui-line-height-control`; a few values moved by at most
  `0.1` (see the changelog). Set `--kui-type-body-lg-line-height` and the other roles to restore them.
- Reading a global token with a literal fallback in your own CSS (`var(--kui-space-4, 12px)`) still works;
  the library no longer does it, because the default theme always defines these tokens.

## Chart behaviour changes

- Arrow keys now move DOM focus, and Up and Down move between series (Left and Right move along a
  series); previously every arrow moved along one flat list.
- `KuiChartPoint.x` and `y` passed to a `tooltip` formatter are data units (they were SVG pixels), and
  `r` is passed. The default scatter text is `{series}: ({x}, {y})`.
- Bubble `r` is in CSS pixels (it was viewBox units); consumers own clamping.
- Line and bar charts measure their container, so axis text keeps a fixed pixel size (13px by default,
  it was 11px scaled with the viewBox). Set `--kui-chart-axis-text-font-size` to change it.
- Every tooltip closes on `Escape`; `[kuiTooltip]` tooltips also stay open while the pointer is on them. Chart tooltips still follow the pointer, but a line or scatter point (and a bar) shows its tooltip only while the pointer is on it, not near it.
- `--kui-chart-legend-swatch-radius` is gone (the swatch is a marker shape); use
  `--kui-chart-legend-swatch-size`.

## Verify the upgrade

1. `ng update @kikita-labs/ui`, then `git grep -nE "Kui[A-Za-z]+(Component|Directive)\b|KuiToastService|kuiProvideLocale"`
   returns nothing.
2. Replace every `KUI_*_OPTIONS` token and `kuiProvide*Options` call with `provideKuiDefaults`.
3. Rename `readOnly` to `readonly` on `kui-otp-input`.
4. Search your styles for removed tokens (see [Removed In 2.0](tokens.md#removed-in-20)) and for selectors
   that depend on the old Calendar or Splitter markup.
5. If you render on the server, check that your cache sends `Vary: Accept-Language`.
6. Rebuild, run your unit and browser tests, and review screenshot diffs before accepting new baselines:
   disabled opacity, focus outlines, warning and info colours, line heights and tooltip timing changed on
   purpose.

## Names from 2.0 prereleases

The migration also maps names that only existed in 2.0 prereleases. The two chart legend entries
change in opposite directions: the data type `KuiChartLegendItem` became `KuiChartLegendEntry` and the
template directive `KuiChartLegendItemDirective` took the plain name `KuiChartLegendItem`.

| 1.x name                      | 2.0 name              |
| ----------------------------- | --------------------- |
| `KuiAlertActionsDirective`    | `KuiAlertActions`     |
| `KuiAlertComponent`           | `KuiAlert`            |
| `KuiAlertIconDirective`       | `KuiAlertIcon`        |
| `KuiAlertMessageDirective`    | `KuiAlertMessage`     |
| `KuiAlertTitleDirective`      | `KuiAlertTitle`       |
| `KuiAutoFocusDirective`       | `KuiAutoFocus`        |
| `KuiBarChartComponent`        | `KuiBarChart`         |
| `KuiCalendarRangeComponent`   | `KuiCalendarRange`    |
| `KuiCarouselComponent`        | `KuiCarousel`         |
| `KuiCarouselSlideDirective`   | `KuiCarouselSlide`    |
| `KuiChartLegendComponent`     | `KuiChartLegend`      |
| `KuiChartLegendItem`          | `KuiChartLegendEntry` |
| `KuiChartLegendItemDirective` | `KuiChartLegendItem`  |
| `KuiDonutChartComponent`      | `KuiDonutChart`       |
| `KuiLineChartComponent`       | `KuiLineChart`        |
| `KuiLinkDirective`            | `KuiLink`             |
| `KuiOtpInputComponent`        | `KuiOtpInput`         |
| `KuiPaginationComponent`      | `KuiPagination`       |
| `KuiScatterChartComponent`    | `KuiScatterChart`     |
| `KuiSplitterComponent`        | `KuiSplitter`         |
| `KuiSplitterPaneComponent`    | `KuiSplitterPane`     |
| `KuiTimePickerDirective`      | `KuiTimePicker`       |
| `KuiTimePickerPanelComponent` | `KuiTimePickerPanel`  |
| `kuiProvideDefaults`          | `provideKuiDefaults`  |
| `kuiProvideI18n`              | `provideKuiI18n`      |
| `kuiProvideMessages`          | `provideKuiMessages`  |

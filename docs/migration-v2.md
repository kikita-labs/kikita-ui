# Migrating to Kikita UI 2.0

This guide covers the renamed exports of 2.0.0. The other breaking changes of the release are listed
in the 2.0.0 (currently `[Unreleased]`) section of [CHANGELOG.md](../CHANGELOG.md); the colour tokens that
changed have their own table in [Theming](theming.md#migrating-to-the-colour-roles) and the new
default mechanism is described in [DI Defaults](di-defaults.md).

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

## Token and style changes

The tokens of 2.0 keep their names, with these exceptions. The colour tokens have their own table in
[Theming](theming.md#migrating-to-the-colour-roles).

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

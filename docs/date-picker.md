# Date Picker

`input[kuiDatePicker]` converts a native text input into a date picker trigger. Text is
parsed/formatted with the numeric layout of the locale (`10/03/2026` in `en-US`, `03.10.2026` in
`ru-RU`, `2026/10/03` in `ja-JP`) or the `format` input; surrounding whitespace is trimmed, and
four-digit years from `0000` through `9999` are preserved. Parsing reads three digit groups in the
layout's order, so `3.1.2026` is accepted where `03.01.2026` is shown. Pair it with `kui-calendar` inside a sibling `kui-dropdown`
for the popover grid.

## Import

```ts
import { KuiCalendar, KuiDatePicker, KuiDropdown, KuiField } from '@kikita-labs/ui';
```

## Usage

```html
<kui-field label="Meeting date">
  <input kuiDatePicker [(value)]="date" />
  <kui-dropdown panelRole="dialog" panelWidth="auto" maxHeight="420px">
    <kui-calendar flat showFooter />
  </kui-dropdown>
</kui-field>
```

The calendar needs no `[value]`/`(valueChange)` or `[(viewDate)]` binding: when `kui-calendar`
is found as a sibling of `input[kuiDatePicker]` inside the same `kui-field`, the directive
auto-discovers it and wires `value`/`viewDate` both ways automatically — a day clicked in the
calendar updates the input, and a valid date typed in the input updates (and scrolls) the
calendar. This is the recommended usage.

Manually binding `[value]`/`(valueChange)`/`[(viewDate)]` on the calendar still works — it's no
longer required, not deprecated. If you keep the old pattern (e.g. bound to the same signal as
the input), the auto-wire effects and your binding stay in sync without fighting each other:

```html
<!-- Still supported: manual binding, same as before this feature shipped. -->
<kui-field label="Meeting date">
  <input kuiDatePicker [(value)]="date" [(viewDate)]="viewDate" />
  <kui-dropdown panelRole="dialog" panelWidth="auto" maxHeight="420px">
    <kui-calendar flat [(value)]="date" [(viewDate)]="viewDate" [showFooter]="true" />
  </kui-dropdown>
</kui-field>
```

Three things on `kui-dropdown` matter here, all different from its default (listbox) usage:

- `panelRole="dialog"` — the panel holds a calendar grid, not a list of options.
- `panelWidth="auto"` — sizes the panel to the calendar's own width (296px by default)
  instead of clipping it to the (usually narrower) field. This is why the popover is often
  wider than the input — that's intentional, not a bug: `kui-calendar` has a fixed width
  (`--kui-calendar-width`, 296px by default) because its day grid needs a minimum amount of
  room regardless of the trigger. Override `--kui-calendar-width` on `kui-calendar` if you want
  it narrower or wider — `panelWidth` only controls how the _dropdown panel_ relates to the
  trigger's width, not the calendar's own size, so switching it to `"anchor"` alone would just
  clip a still-296px-wide calendar into a narrower panel rather than shrink it.
- `maxHeight="420px"` — the calendar's natural height comfortably fits under this; it's a
  safety cap so the popover never renders unbounded when there isn't enough room in either
  direction, falling back to an internal scroll instead of visually overflowing.

And on `kui-calendar`:

- `flat` — the popover panel already draws its own background/border, so the calendar drops
  its own to avoid a double frame. See [Calendar](./calendar.md#flat-no-own-chrome).

## Disabled Dates

```html
<kui-field label="Meeting date">
  <input kuiDatePicker [(value)]="date" [minDate]="today" />
  <kui-dropdown panelRole="dialog" panelWidth="auto" maxHeight="420px">
    <kui-calendar flat showFooter />
  </kui-dropdown>
</kui-field>
```

`minDate`/`maxDate` are enforced on typed text (marks the field invalid) by the directive, and
auto-wired into a sibling `kui-calendar` the same way `value`/`viewDate` are — no need to bind
them on the calendar too.

## Clearable

```html
<input kuiDatePicker [(value)]="date" [clearable]="false" />
```

`clearable` defaults to `true` and shows a clear button once there's a value. Falls back to
`defaults.datePicker.clearable`, then `defaults.field.clearable`, when not set locally.

## Disabled / Readonly

```html
<input kuiDatePicker [(value)]="date" [disabled]="true" />
<input kuiDatePicker [(value)]="date" [readonly]="true" />
```

`readonly` shows the value but never opens the popover.

## Invalid Input

Typing an out-of-format value (`32.13.2026`) sets `aria-invalid`/`data-kui-invalid` (red border)
without replacing the last successfully parsed `value`. A parseable date outside `minDate` or
`maxDate` updates `value` and `viewDate` to the typed date but keeps the field invalid; the linked
calendar continues to disable dates outside the configured range. Typing a valid in-range date
clears the invalid state.

## Inputs

- `value`: two-way model, `Date | null` (default: `null`). Its `valueChange` model output is
  available for one-way output binding. Auto-wired into a sibling `kui-calendar` inside the same
  `kui-field` (see Usage above); manual binding on the calendar is optional.
- `viewDate`: two-way model, first-of-month `Date` (defaults to the first day of the current
  month). Its `viewDateChange` model output is available for one-way output binding. Auto-wired into a sibling
  `kui-calendar`, keeping the popover's displayed month in sync as a valid date is typed or the
  calendar is navigated.
- `minDate` / `maxDate`: `Date | undefined` (default: `undefined`). These are inclusive local
  calendar-day boundaries; their time portions are ignored, matching `kui-calendar`. They are
  also auto-wired into a sibling `kui-calendar` (push-only — the calendar never changes these on
  its own).
- `clearable`: `boolean | undefined` (default resolves to `true`)
- `disabled` / `readonly`: `boolean` (default: `false`)
- `placeholder`: `string | undefined` — defaults to the `dayPlaceholder`, `monthPlaceholder` and `yearPlaceholder` messages arranged in the order and separators of the locale (`mm/dd/yyyy`, `dd.mm.yyyy`)
- `format`: `string | undefined` (default: `'locale'`). A pattern of `d`/`dd`, `M`/`MM` and `yyyy` tokens such as `dd.MM.yyyy` pins the layout. Resolves as `format > defaults.datePicker.format > 'locale'`.
- `messages`: `Partial<KuiDatePickerMessages> | undefined`. Text overrides for this instance (`openCalendar`, `closeCalendar`, the placeholder tokens). See [Internationalization](./i18n.md).
- `id`: `string | undefined` — falls back to the parent `kui-field`'s control id

Also implements the Angular Signal Forms `FormValueControl<Date | null>` contract
(`invalid`, `errors`, `touched` inputs; `touch` output), same shape as `kuiCombobox`/`kuiSelect`.

## Provider Defaults

Set `defaults.datePicker` once for the application or for a subtree:

```ts
// app.config.ts
provideKikitaUi({
  defaults: {
    datePicker: {
      /* options below */
    },
  },
});

// a component, route or environment injector
providers: [
  provideKuiDefaults({
    datePicker: {
      /* options below */
    },
  }),
];
```

| Option        | Values         | Description                                                                                                                    |
| ------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `clearable`   | `boolean`      | When true, field controls with clear affordances show a clear button by default.                                               |
| `chevronIcon` | `KuiIconGlyph` | Icon of the options toggle. Takes precedence over `defaults.icons.pickerChevron`. See [Structural Icons](structural-icons.md). |
| `clearIcon`   | `KuiIconGlyph` | Icon of the clear button. Takes precedence over `defaults.icons.clear`. See [Structural Icons](structural-icons.md).           |

Each option resolves as `local input > defaults.datePicker.<option> > built-in default`. See [DI defaults](di-defaults.md).

## Accessibility

- `role="combobox"` on the input, `aria-haspopup="dialog"`, `aria-expanded` + `aria-controls`
  pointing at the popover panel id.
- `aria-invalid`/`data-kui-invalid` reflect parse failures and out-of-range dates.
- The linked `kui-calendar` carries its own grid accessibility (`role="grid"`, roving tabindex,
  `aria-current="date"`, `aria-selected`) — see [Calendar](./calendar.md#accessibility).

### Keyboard

- `ArrowDown`: opens the popover
- `Enter`: opens the popover if closed, closes it if open
- `Escape`: closes the popover; focus stays in the field, or returns to it when it was inside the calendar
- `Tab`: closes the popover, focus moves to the next tabbable element
- Inside the popover: calendar keyboard navigation applies (see Calendar docs)

## Style Import

Import `@kikita-labs/ui/styles` (which includes `date-picker.css`) once in your application
styles.

## CSS Variables

| Variable                            | Default | Purpose                                      |
| ----------------------------------- | ------- | -------------------------------------------- |
| `--kui-date-picker-suffix-gap`      | `2px`   | Gap between the clear and calendar controls. |
| `--kui-date-picker-affordance-size` | `20px`  | Size of the clear and calendar controls.     |

## Known Gaps

- Range picking (pairing with `kui-calendar-range`, either "one field" or "two fields" layouts)
  is not implemented — `input[kuiDatePicker]` only auto-wires `kui-calendar` (single-date).
  Single-date picking only, for now. See [Calendar Range](./calendar-range.md) for standalone
  range selection without a text-input trigger.
- No mobile bottom-sheet popover variant; the popover is always a floating panel, on any
  viewport size.
- Digits are Latin and the calendar is Gregorian in every locale; native numerals and other
  calendars are not supported in v2 (see [Internationalization](./i18n.md#limits-in-v2)).

<!-- color-tokens:begin -->

## Color Tokens

Set any of these on the component or an ancestor to restyle one part. Each token is optional: when it
is not set, the part uses the semantic role in the Default column.

| Token                                      | Default                    | Controls                |
| ------------------------------------------ | -------------------------- | ----------------------- |
| `--kui-date-picker-chevron-color-expanded` | `--kui-color-primary-text` | Chevron color, expanded |

<!-- color-tokens:end -->

<!-- geometry-tokens:begin -->

## Geometry Tokens

Set any of these on the component or an ancestor to restyle one part. Each token is optional: when it
is not set, the part uses the scale token in the Default column.

| Token                                              | Default         | Controls                                                       |
| -------------------------------------------------- | --------------- | -------------------------------------------------------------- |
| `--kui-date-picker-control-overlay-padding-inline` | `--kui-space-3` | Control overlay padding, inline                                |
| `--kui-date-picker-padding-inline-start`           | `34px`          | Input start padding that clears the calendar icon              |
| `--kui-date-picker-padding-inline-end`             | `34px`          | Input end padding that clears the chevron                      |
| `--kui-date-picker-padding-inline-end-clearable`   | `56px`          | Input end padding that clears the clear button and the chevron |

<!-- geometry-tokens:end -->

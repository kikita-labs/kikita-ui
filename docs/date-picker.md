# Date Picker

`input[kuiDatePicker]` converts a native text input into a date picker trigger. Text is
parsed/formatted as `dd.MM.yyyy`; pair it with `kui-calendar` inside a sibling `kui-dropdown`
for the popover grid.

## Import

```ts
import {
  KuiCalendarComponent,
  KuiDatePickerDirective,
  KuiDropdownComponent,
  KuiFieldComponent,
} from '@kikita-labs/ui';
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
<input kuiDatePicker [(value)]="date" [minDate]="today" /> <kui-calendar flat [minDate]="today" />
```

`minDate`/`maxDate` are enforced on typed text (marks the field invalid) by the directive, and
control the calendar's disabled cells independently. They are **not** auto-forwarded from the
directive into the calendar: `kui-calendar` declares `minDate`/`maxDate` as plain inputs (not
two-way models), and the directive only has a `contentChild` reference to the calendar, not a
`ComponentRef` — so there is no supported way to programmatically override an unbound input from
outside the component the way `value`/`viewDate` are pushed/pulled. Bind `[minDate]`/`[maxDate]`
on the calendar directly (typically the same signal as on the input, as above) to keep disabled
dates in sync between the two.

## Clearable

```html
<input kuiDatePicker [(value)]="date" [clearable]="false" />
```

`clearable` defaults to `true` and shows a clear button once there's a value. Falls back to
`kuiProvideFieldOptions({ clearable })` when not set locally, same as `kuiCombobox`/`kuiSelect`.

## Disabled / Readonly

```html
<input kuiDatePicker [(value)]="date" [disabled]="true" />
<input kuiDatePicker [(value)]="date" [readonly]="true" />
```

`readonly` shows the value but never opens the popover.

## Invalid Input

Typing an out-of-format (`32.13.2026`) or out-of-range (before `minDate`/after `maxDate`) date
sets `aria-invalid`/`data-kui-invalid` (red border) without discarding the last valid value —
the field stays on the last good date until a valid one is typed.

## Inputs

- `value`: two-way model, `Date | null`. Auto-wired into a sibling `kui-calendar` inside the
  same `kui-field` (see Usage above); manual binding on the calendar is optional.
- `viewDate`: two-way model, first-of-month `Date`. Also auto-wired into a sibling
  `kui-calendar`, keeping the popover's displayed month in sync as a valid date is typed or the
  calendar is navigated.
- `minDate` / `maxDate`: `Date | undefined`
- `clearable`: `boolean | undefined` (default resolves to `true`)
- `disabled` / `readonly`: `boolean` (default: `false`)
- `placeholder`: `string` (default: `'dd.mm.yyyy'`)
- `id`: `string | undefined` — falls back to the parent `kui-field`'s control id

Also implements the Angular Signal Forms `FormValueControl<Date | null>` contract
(`invalid`, `errors`, `touched` inputs; `touch` output), same shape as `kuiCombobox`/`kuiSelect`.

## Accessibility

- `role="combobox"` on the input, `aria-haspopup="dialog"`, `aria-expanded` + `aria-controls`
  pointing at the popover panel id.
- `aria-invalid`/`data-kui-invalid` reflect parse failures and out-of-range dates.
- The linked `kui-calendar` carries its own grid accessibility (`role="grid"`, roving tabindex,
  `aria-current="date"`, `aria-selected`) — see [Calendar](./calendar.md#accessibility).

### Keyboard

- `ArrowDown`: opens the popover
- `Enter`: opens the popover if closed, closes it if open
- `Escape`: closes the popover, focus stays in the field
- `Tab`: closes the popover, focus moves to the next tabbable element
- Inside the popover: calendar keyboard navigation applies (see Calendar docs)

## Style Import

Import `@kikita-labs/ui/styles` (which includes `date-picker.css`) once in your application
styles.

## Known Gaps

- Range picking (pairing with `kui-calendar-range`, either "one field" or "two fields" layouts)
  is not implemented — `input[kuiDatePicker]` only auto-wires `kui-calendar` (single-date).
  Single-date picking only, for now. See [Calendar Range](./calendar-range.md) for standalone
  range selection without a text-input trigger.
- No mobile bottom-sheet popover variant; the popover is always a floating panel, on any
  viewport size.
- No locale-aware display format (`format` input); the mask is always `dd.MM.yyyy`, matching
  the design brief's explicit non-goal for this iteration.
- `minDate`/`maxDate` are not auto-forwarded to a paired calendar (see Disabled Dates above);
  bind them on both elements.

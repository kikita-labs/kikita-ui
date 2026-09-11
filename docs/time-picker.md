# Time Picker

`input[kuiTimePicker]` converts a native text input into a time-of-day picker trigger. Text is
parsed/formatted per `format` (`HH:mm[:ss]` for `'24h'`, `hh:mm[:ss] AM/PM` for `'12h'`); pair it
with `kui-time-picker-panel` inside a sibling `kui-dropdown` for the scrollable hour/minute/second
column popover — the same composition `input[kuiDatePicker]` uses with `kui-calendar`.

## Import

```ts
import {
  KuiDropdownComponent,
  KuiFieldComponent,
  KuiTimePickerDirective,
  KuiTimePickerPanelComponent,
} from '@kikita-labs/ui';
```

## Usage

```html
<kui-field label="Meeting time">
  <input kuiTimePicker [(value)]="time" />
  <kui-dropdown panelRole="dialog" panelWidth="auto" maxHeight="280px">
    <kui-time-picker-panel />
  </kui-dropdown>
</kui-field>
```

The panel needs no `[value]`/`(valueChange)` or `[format]`/`[minuteStep]`/`[secondStep]`/
`[showSeconds]` binding: when `kui-time-picker-panel` is found as a sibling of
`input[kuiTimePicker]` inside the same `kui-field`, the directive auto-discovers it and wires
`value` both ways (a column pick, an arrow-key move, or "Now" updates the input; a valid time
typed in the input updates the panel), and pushes `format`/`hourStep`/`minuteStep`/`secondStep`/
`showSeconds`/`minTime`/`maxTime`/`disabledHours`/`disabledMinutes`/`disabledSeconds` into it
one-way. Every column auto-centers on its selected cell -- both the moment the panel opens and on
every later selection (click, keyboard, "Now") -- reacting to the ancestor `kui-dropdown`'s own
`isOpen` signal rather than this component's construction, so it holds regardless of whether a
given `kui-dropdown` recreates a fresh panel per open or reuses one across opens.

### Inline (standalone)

`kui-time-picker-panel` also works on its own, the same way `kui-calendar` does — its ancestor
`kui-dropdown` is optional, and it auto-detects whether one is present:

```html
<kui-time-picker-panel [(value)]="time" [showSeconds]="true" />
```

With no `kui-dropdown` ancestor, the panel draws its own background/border (`data-kui-flat` is
only set when one is present, matching `kui-calendar`'s `flat` input — just auto-detected here
instead of an explicit prop). "Now"/"Done" still work standalone; "Done" simply has nothing to
close.

## 12-Hour Format, Seconds, Step

```html
<kui-field label="Slot" hint="15-minute/second slots">
  <input
    kuiTimePicker
    [(value)]="time"
    format="12h"
    [showSeconds]="true"
    [minuteStep]="15"
    [secondStep]="15"
  />
  <kui-dropdown panelRole="dialog" panelWidth="auto" maxHeight="300px">
    <kui-time-picker-panel />
  </kui-dropdown>
</kui-field>
```

`format="12h"` renders a 1–12 hours column plus an AM/PM `kui-segmented` toggle below the columns
instead of a 0–23 hours column. `showSeconds` adds a third column. `minuteStep`/`secondStep`
thin the minute/second columns to only every Nth value (e.g. `15` → `00, 15, 30, 45`).

## Clearable

```html
<input kuiTimePicker [(value)]="time" [clearable]="false" />
```

`clearable` defaults to `true` and shows a clear button once there's a value. Falls back to
`kuiProvideFieldOptions({ clearable })` when not set locally, same as `kuiDatePicker`/
`kuiCombobox`/`kuiSelect`.

## Disabled / Readonly

```html
<input kuiTimePicker [(value)]="time" [disabled]="true" />
<input kuiTimePicker [(value)]="time" [readonly]="true" />
```

`readonly` shows the value but never opens the popover.

## Typing

Typing digits auto-inserts the `:` separator (`2214` becomes `22:14` as you type) and non-digit
characters that could never be part of a valid value are stripped as you type (`AM`/`PM` letters,
typed one at a time, and a space are kept for `format="12h"` -- the space is inserted
automatically, same as `:`). Input length is capped per `format`/`showSeconds`. Each
hour/minute/second group clamps to its own valid maximum once both its digits are typed (`99:99`
becomes `23:59`, not left sitting out of range) and snaps to the nearest `hourStep`/`minuteStep`/
`secondStep`. For `format="12h"`, the `AM`/`PM` suffix is optional -- a fully-typed `hh:mm[:ss]`
commits immediately, defaulting the period from whatever it was before (not always `AM`), so
picking a wheel cell or the AM/PM toggle right after typing acts on what was just typed instead of
silently discarding it. Caret position is not preserved across a rebuild -- typing always lands
the caret at the end of the field, a known simplification shared with the parser's own
locale-less mask.

## Invalid Input

Since every group clamps into range as it's typed, a _fully_ typed value is never out of range on
its own. What still sets `aria-invalid`/`data-kui-invalid` (red border), without discarding the
last valid value:

- An incomplete group -- e.g. typing only `12:3` and stopping (`3` isn't yet a full 2-digit
  minute).
- A value inside `[minTime, maxTime]`'s excluded range, or matching `disabledHours`/
  `disabledMinutes`/`disabledSeconds` -- typing is not rejected there, only flagged (same
  convention `kuiDatePicker`'s `minDate`/`maxDate` use).

## Inputs

- `value`: two-way model, `Date | null` — only the hours/minutes/seconds fields are meaningful;
  the date part is whatever `Date` last produced or received the value (typically "now" from the
  browser at construction time or from "Now"). Auto-wired into a sibling
  `kui-time-picker-panel` inside the same `kui-field` (see Usage above).
- `format`: `'24h' | '12h'` (default: `'24h'`). Also auto-wired (push-only) into the panel.
- `hourStep`: `number` (default: `1`). Not in the Claude Design spec's own API table (only
  `minuteStep`/`secondStep` are) — added for naming/behavior parity with those two. Also
  auto-wired (push-only).
- `minuteStep`: `number` (default: `1`). Also auto-wired (push-only).
- `secondStep`: `number` (default: `1`, only relevant with `showSeconds`). Also auto-wired
  (push-only).
- `showSeconds`: `boolean` (default: `false`). Also auto-wired (push-only).
- `minTime` / `maxTime`: `Date | undefined` — earliest/latest selectable time-of-day (inclusive;
  only the hours/minutes/seconds fields are read), the same convention `kuiDatePicker`'s
  `minDate`/`maxDate` use. Disables every out-of-range wheel cell; typing/selecting an
  out-of-range time is not rejected, only marked `aria-invalid` (same as `kuiDatePicker`). Also
  auto-wired (push-only).
- `disabledHours`: `(() => readonly number[]) | undefined` — returns the hours to disable. For a
  rule `minTime`/`maxTime` can't express (e.g. "disable the first 30 minutes of every hour"), see
  `disabledMinutes`. Disables the matching wheel cells and marks a typed value landing on one
  `aria-invalid` (same treatment as `minTime`/`maxTime`) -- neither rejects nor auto-corrects the
  typed text. Also auto-wired (push-only).
- `disabledMinutes`: `((hour: number) => readonly number[]) | undefined` — returns the minutes to
  disable for a given hour. Also auto-wired (push-only).
- `disabledSeconds`: `((hour: number, minute: number) => readonly number[]) | undefined` —
  returns the seconds to disable for a given hour/minute, used only when `showSeconds` is true.
  Also auto-wired (push-only).
- `clearable`: `boolean | undefined` (default resolves to `true`)
- `disabled` / `readonly`: `boolean` (default: `false`)
- `placeholder`: `string | undefined` — defaults to a format-appropriate mask
  (`hh:mm`, `hh:mm:ss`, `hh:mm AM/PM`, or `hh:mm:ss AM/PM`)
- `id`: `string | undefined` — falls back to the parent `kui-field`'s control id

Also implements the Angular Signal Forms `FormValueControl<Date | null>` contract
(`invalid`, `errors`, `touched` inputs; `touch` output), same shape as `kuiDatePicker`.

## Accessibility

- `role="combobox"` on the input, `aria-haspopup="dialog"`, `aria-expanded` + `aria-controls`
  pointing at the popover panel id — the same pattern `kuiDatePicker` uses (a combobox that
  opens a non-modal dialog, not a listbox).
- Each unit column is `role="listbox"` with its own `aria-label` ("Hours"/"Minutes"/"Seconds"),
  focusable (`tabindex="0"`); arrow keys/Home/End work inside it without moving focus to another
  column. Cells are `role="option"` + `aria-selected`; the selected cell is also visually distinct
  (fill + bold), not color alone.
- `:focus-visible` is explicitly styled on the column (a `--kui-color-primary-fill` ring), not
  left to the browser default.
- AM/PM uses `kui-segmented` (`role="radiogroup"`) — already keyboard-accessible as part of the
  kit, not reimplemented here.
- Disabled uses native `disabled` on the input and the chevron button (excluded from tab order).
- Invalid sets `aria-invalid` on the input; pair with `kui-field`'s `error` for an announced
  `role="alert"` message.

### Keyboard

- `ArrowDown` (in the input, panel closed): opens the popover and moves focus into the first
  column.
- `Enter` (in the input): opens the popover if closed, closes it if open.
- `Enter` (in a column): closes the popover, keeping the current selection.
- `Escape` (anywhere in the field): closes the popover, focus stays in the field.
- `Tab` (in the input): closes the popover, focus moves to the next tabbable element.
- `ArrowUp` / `ArrowDown` (in a column): cyclic move to the previous/next value, applied
  immediately.
- `Home` / `End` (in a column): jump to the first/last value in that column.

Selecting a cell (by click or arrow key) does **not** close the panel — picking hours would
otherwise close the panel before minutes/seconds could be picked. Close explicitly with
`Enter`/`Escape`/an outside click, or the panel's own "Done" button. The panel's "Now" button
sets `value` to the current time without closing.

## Style Import

Import `@kikita-labs/ui/styles` (which includes `time-picker.css`) once in your application
styles.

## Component Tokens

| Variable                              | Aliases to                   | Purpose                                                                                                                                                            |
| ------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `--kui-timepicker-col-gap`            | `--kui-space-2`              | Gap between hour/minute/second columns.                                                                                                                            |
| `--kui-timepicker-icon-color`         | `--kui-color-text-secondary` | Leading clock icon color.                                                                                                                                          |
| `--kui-timepicker-cell-bg-selected`   | `--kui-color-primary-fill`   | Selected cell background — solid fill, matching `kui-calendar`'s selected day (not a soft tone), so the trigger and panel read as one family with `kuiDatePicker`. |
| `--kui-timepicker-cell-text-selected` | `--kui-color-on-fill`        | Selected cell text color.                                                                                                                                          |
| `--kui-timepicker-cell-bg-hover`      | `--kui-color-surface-sunken` | Hover background for an unselected cell.                                                                                                                           |
| `--kui-timepicker-affordance-size`    | `20px`                       | Chevron/clear click target — same local override `kuiDatePicker`/`kuiCombobox` apply to the default `24px` `--kui-field-action-size`.                              |

## Known Gaps

- Range picking (a "from–to" time range) is not implemented.
- `applyNow` ("Now" button) only clamps into `[minTime, maxTime]`, not around
  `disabledHours`/`disabledMinutes`/`disabledSeconds` — "Now" can still land on a disabled slot
  those functions name (marked `aria-invalid` like any other disabled-slot value, just not
  avoided upfront the way `minTime`/`maxTime` are).
- `aria-controls` on the trigger does not point at the real `kui-dropdown` panel id while the
  panel component itself hasn't rendered it yet on first open — the same pre-existing gap
  `kuiDatePicker` has (the dropdown doesn't expose its id outward before attaching).
- No locale-aware display format beyond the `24h`/`12h` mask switch; the leading clock icon is a
  new static chrome glyph (`KUI_CLOCK_CIRCLE`/`KUI_CLOCK_D` in `kui-chrome-icon-paths.util`), not
  yet routed through the async `kui-icon` registry, matching how `KUI_CALENDAR_D` is handled for
  `kuiDatePicker`.

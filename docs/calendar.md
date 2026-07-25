# Calendar

`kui-calendar` is an inline month-grid single-date picker with month/year/decade navigation. It's the building block for date pickers that open it in a popover, but it's also usable inline (sidebars, filter panels). For range selection (a start/end pair), see [Calendar Range](./calendar-range.md).

Header nav/title controls and the footer's "Today" button are `kuiButton` (ghost) underneath; the rule between the grid and the footer is `hr[kuiSeparator]`. `kui-calendar` itself only carries the styling that's actually calendar-specific (day grid, cell states, month/year pickers).

## Import

```ts
import { KuiCalendarComponent } from '@kikita-labs/ui';
```

## Usage

```html
<kui-calendar [(value)]="selectedDate" />
```

`value` is a two-way model holding a `Date | null`.

Placed as a sibling of `input[kuiDatePicker]` inside the same `kui-field`, the directive
auto-wires this calendar's `value`/`viewDate` for you — see [Date Picker](./date-picker.md),
which is the recommended way to pair the two.

### Disabled Dates

```html
<kui-calendar [minDate]="today" [(value)]="selectedDate" />
<kui-calendar [disabledDates]="[holiday1, holiday2]" [(value)]="selectedDate" />
<kui-calendar [disabledDates]="isWeekend" [(value)]="selectedDate" />
```

### Footer

```html
<kui-calendar showFooter [(value)]="selectedDate" />
```

Off by default. When enabled, adds a footer with the current value and a "Today" shortcut button — useful when the calendar is the whole surface (e.g. inside a popover), but usually skipped for bare inline placements (sidebars, filter panels).

### Custom Header / Footer

The header (month/year title + nav arrows) and footer are both replaceable through content projection. Project an element with `kuiCalendarHeader` or `kuiCalendarFooter` to fully replace the corresponding default block; the built-in one (including the `showFooter` toggle) only renders when nothing is projected.

```html
<kui-calendar [(value)]="selectedDate">
  <div kuiCalendarFooter class="my-footer">
    <button type="button" (click)="clearSelection()">Clear</button>
  </div>
</kui-calendar>
```

Projected content is compiled against the host template, not `kui-calendar`'s internal state — it replaces the block rather than augmenting it.

### Compact Size

```html
<kui-calendar size="sm" [(value)]="selectedDate" />
```

`sm` drops the border and padding, for embedding directly inside a sidebar or panel.

### Width

The calendar has a fixed width (`296px`) so its day grid always has enough room, regardless of
how wide whatever's anchoring it (a field, a dropdown trigger) happens to be. Override it with
the `--kui-calendar-width` custom property:

```html
<kui-calendar style="--kui-calendar-width: 340px" [(value)]="selectedDate" />
```

### Flat (No Own Chrome)

```html
<kui-calendar flat [(value)]="selectedDate" />
```

Strips the calendar's own background/border/padding. Use this when nesting it inside chrome
that already draws those — a `kui-dropdown`/`kui-popover` panel in a date picker — so the two
don't stack into a double frame. See [Date Picker](./date-picker.md).

### Controlling The Displayed Month

```html
<kui-calendar [(value)]="selectedDate" [(viewDate)]="viewDate" />
```

`viewDate` (a first-of-month `Date`, two-way) drives which month the grid shows. Bind it when
an external control needs to move the calendar to a specific month manually. Left unbound, it
defaults to today's month, or the bound `value`'s month at construction time. When paired with
`input[kuiDatePicker]` inside the same `kui-field`, this is wired automatically — see
[Date Picker](./date-picker.md).

`showPrevNav`/`showNextNav` (`boolean`, default `true`) hide the previous/next nav button. This
is for pairing two linked calendars a month apart (one showing month N with only a "previous"
button, the other month N+1 with only "next") — not yet wired up as a built-in range popover,
but available for custom layouts.

### Locale

`kui-calendar` resolves month names, weekday names, and the first day of the week purely from `Intl` — there is no bundled locale data to keep in sync. By default it uses the app-wide `KUI_LOCALE` token (which itself defaults to `navigator.language`, falling back to `en-US`).

Override the locale for the whole app:

```ts
// app.config.ts
import { kuiProvideLocale } from '@kikita-labs/ui';

providers: [kuiProvideLocale('ru-RU')];
```

Or override it for a single instance with the `locale` input, which takes precedence over the token:

```html
<kui-calendar locale="ru-RU" [(value)]="selectedDate" />
```

## Inputs

- `value`: two-way model, `Date | null` (default: `null`)
- `viewDate`: two-way model, first-of-month `Date` driving which month is displayed
- `size`: `md | sm` (default: `md`)
- `flat`: `boolean` (default: `false`). Strips the calendar's own background/border/padding.
- `showWeekend`: `boolean` (default: `true`). Renders Saturday/Sunday in a muted color.
- `showFooter`: `boolean` (default: `false`). Renders the built-in value + "Today" footer.
- `showPrevNav` / `showNextNav`: `boolean` (default: `true`). Hide a header nav button.
- `minDate` / `maxDate`: `Date | undefined`. Dates outside the range are disabled.
- `disabledDates`: `Date[] | ((date: Date) => boolean) | undefined`. Individual exceptions.
- `locale`: `string | undefined`. BCP 47 locale tag overriding `KUI_LOCALE` for this instance.

## Accessibility

- `role="grid"` on the day grid, `role="row"` on the weekday header row.
- `aria-selected` on the selected cell, `aria-current="date"` on today, `aria-disabled` on disabled dates.
- Roving tabindex: one day cell is in the tab order at a time (the focused date); arrow keys, `Home`/`End`, `PageUp`/`PageDown` move focus without leaving the grid.
- Month/year changes are announced through an `aria-live="polite"` region.

### Keyboard

- `ArrowLeft` / `ArrowRight`: previous/next day
- `ArrowUp` / `ArrowDown`: previous/next week
- `Home` / `End`: start/end of the focused week
- `PageUp` / `PageDown`: previous/next month
- `Shift+PageUp` / `Shift+PageDown`: previous/next year
- `Enter` / `Space`: select the focused date

## Style Import

Import `@kikita-labs/ui/styles` (which includes `calendar.css`) once in your application styles. `kui-calendar-range` shares the same stylesheet (see [Calendar Range](./calendar-range.md)).

## Version Notes

- As of this release, `kui-calendar` is single-date only: the `mode` input and the
  `Date | KuiDateRange | null` union `value` type are gone. Existing `mode="range"` usage
  migrates to the new `kui-calendar-range` component (`value: KuiDateRange | null`); see
  [Calendar Range](./calendar-range.md).

## Known Gaps

- Arbitrary multi-date selection is not implemented; the design spec marks it low priority until a concrete use case appears.
- `kui-calendar` is inline-only; a popover-based date picker that wraps it is not yet built (see [Date Picker](./date-picker.md) for the current pairing pattern with `input[kuiDatePicker]`).

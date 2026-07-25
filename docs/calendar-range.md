# Calendar Range

`kui-calendar-range` is an inline month-grid date-range picker with month/year/decade navigation. It shares its visual grid, month/year/decade navigation, disabled-date handling, locale resolution, and keyboard behavior with [Calendar](./calendar.md) (`kui-calendar`), but selects a start/end pair instead of a single date: first click sets the start, hovering before the second click previews the range, second click commits it — the first click after a committed range starts a new one.

Header nav/title controls and the footer's "Today" button are `kuiButton` (ghost) underneath; the rule between the grid and the footer is `hr[kuiSeparator]`.

## Import

```ts
import { KuiCalendarRangeComponent } from '@kikita-labs/ui';
```

## Usage

```html
<kui-calendar-range [(value)]="selectedRange" />
```

`value` is a two-way model holding a `KuiDateRange | null`:

```ts
interface KuiDateRange {
  start: Date;
  end: Date | null;
}
```

`end` is `null` while the range is still open (only the start date has been picked).

### Disabled Dates

```html
<kui-calendar-range [minDate]="today" [(value)]="selectedRange" />
<kui-calendar-range [disabledDates]="[holiday1, holiday2]" [(value)]="selectedRange" />
<kui-calendar-range [disabledDates]="isWeekend" [(value)]="selectedRange" />
```

### Footer

```html
<kui-calendar-range showFooter [(value)]="selectedRange" />
```

Off by default. When enabled, adds a footer with the current value and a "Today" shortcut button.

### Custom Header / Footer

Project an element with `kuiCalendarHeader` or `kuiCalendarFooter` to fully replace the corresponding default block; the built-in one (including the `showFooter` toggle) only renders when nothing is projected.

```html
<kui-calendar-range [(value)]="selectedRange">
  <div kuiCalendarFooter class="my-footer">
    <button type="button" (click)="clearSelection()">Clear</button>
  </div>
</kui-calendar-range>
```

### Compact Size

```html
<kui-calendar-range size="sm" [(value)]="selectedRange" />
```

`sm` drops the border and padding, for embedding directly inside a sidebar or panel.

### Width

Fixed width (`296px` by default), overridable with `--kui-calendar-width`, same as `kui-calendar`. See [Calendar > Width](./calendar.md#width).

### Flat (No Own Chrome)

```html
<kui-calendar-range flat [(value)]="selectedRange" />
```

Strips the calendar's own background/border/padding. Use this when nesting it inside chrome that already draws those (a `kui-dropdown`/`kui-popover` panel) so the two don't stack into a double frame.

### Controlling The Displayed Month

```html
<kui-calendar-range [(value)]="selectedRange" [(viewDate)]="viewDate" />
```

`viewDate` (a first-of-month `Date`, two-way) drives which month the grid shows. Left unbound, it defaults to today's month, or the bound `value.start`'s month at construction time.

`showPrevNav`/`showNextNav` (`boolean`, default `true`) hide the previous/next nav button — for pairing two linked calendars a month apart (one showing month N with only "previous", the other month N+1 with only "next"); not yet wired up as a built-in range popover, but available for custom layouts.

### Locale

Same `Intl`-driven locale resolution as `kui-calendar` — see [Calendar > Locale](./calendar.md#locale).

## Inputs

- `value`: two-way model, `KuiDateRange | null` (default: `null`)
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
- `aria-selected` on the range endpoints (and any single committed day), `aria-current="date"` on today, `aria-disabled` on disabled dates.
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

Import `@kikita-labs/ui/styles` (which includes `calendar.css`) once in your application styles. `kui-calendar-range` reuses the same `.kui-calendar*` class names and stylesheet as `kui-calendar` — the two share pixel-identical grid/day-cell/nav visuals, so there is no separate `calendar-range.css`.

## Known Gaps

- No built-in popover wrapper (a range equivalent of `input[kuiDatePicker]`) is implemented yet — `kui-calendar-range` is inline-only for now. Pairing two linked instances a month apart for a range popover is possible with `showPrevNav`/`showNextNav`, but is not a built-in composed pattern.
- Arbitrary multi-range selection (more than one start/end pair) is not implemented.

# Calendar

`kui-calendar` is an inline month-grid date picker with month/year/decade navigation. It's the building block for date/date-range pickers that open it in a popover, but it's also usable inline (sidebars, filter panels).

Header nav/title controls and the footer's "Today" button are `kuiButton` (ghost) underneath; the rule between the grid and the footer is `hr[kuiSeparator]`. `kui-calendar` itself only carries the styling that's actually calendar-specific (day grid, cell states, month/year pickers).

## Import

```ts
import { KuiCalendarComponent } from '@kikita-labs/ui';
```

## Usage

```html
<kui-calendar [(value)]="selectedDate" />
```

### Range Mode

```html
<kui-calendar mode="range" [(value)]="selectedRange" />
```

`value` holds a `Date` in `single` mode, and a `{ start: Date; end: Date | null }` object (`KuiDateRange`) in `range` mode. `end` is `null` while the range is still open (only the start date has been picked); the first click after a committed range starts a new one.

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

- `mode`: `single | range` (default: `single`)
- `value`: two-way model, `Date | KuiDateRange | null` depending on `mode` (default: `null`)
- `size`: `md | sm` (default: `md`)
- `showWeekend`: `boolean` (default: `true`). Renders Saturday/Sunday in a muted color.
- `showFooter`: `boolean` (default: `false`). Renders the built-in value + "Today" footer.
- `minDate` / `maxDate`: `Date | undefined`. Dates outside the range are disabled.
- `disabledDates`: `Date[] | ((date: Date) => boolean) | undefined`. Individual exceptions.
- `locale`: `string | undefined`. BCP 47 locale tag overriding `KUI_LOCALE` for this instance.

## Accessibility

- `role="grid"` on the day grid, `role="row"` on the weekday header row.
- `aria-selected` on selected/range-endpoint cells, `aria-current="date"` on today, `aria-disabled` on disabled dates.
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

Import `@kikita-labs/ui/styles` (which includes `calendar.css`) once in your application styles.

## Known Gaps

- `mode="multiple"` (arbitrary multi-date selection) is not implemented; the design spec marks it low priority until a concrete use case appears.
- `kui-calendar` is inline-only; a popover-based date/date-range picker that wraps it is not yet built.

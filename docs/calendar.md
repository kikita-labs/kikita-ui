# Calendar

`kui-calendar` is an inline month-grid single-date picker with month/year/decade navigation. It's the building block for date pickers that open it in a popover, but it's also usable inline (sidebars, filter panels). For range selection (a start/end pair), see [Calendar Range](./calendar-range.md).

Header nav/title controls and the footer's "Today" button are `kuiButton` (ghost) underneath; the rule between the grid and the footer is `hr[kuiSeparator]`. `kui-calendar` itself only carries the styling that's actually calendar-specific (day grid, cell states, month/year pickers).

## Import

```ts
import { KuiCalendar } from '@kikita-labs/ui';
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

`kui-calendar` resolves month names, weekday names, the heading, the first day of the week and the weekend purely from `Intl` — there is no bundled locale data to keep in sync. The heading is one `Intl` month-and-year format, so its order follows the locale (`October 2026`, `2026年10月`). The first day and the weekend come from `Intl.Locale#getWeekInfo()` (`he-IL` has a Friday and Saturday weekend), with a static table for engines that lack it. Names use the Gregorian calendar and Latin digits whatever the locale's default is.

By default it uses the locale of the nearest `KuiI18n` level, which starts from the app-wide `KUI_LOCALE` (in the browser `navigator.language`, on the server the request's `Accept-Language`, both falling back to `en-US`; see `KUI_LOCALE` for the server-to-browser hand-off). See [Internationalization](./i18n.md).

Set the locale for the whole app or a subtree:

```ts
// app.config.ts
import { provideKikitaUi } from '@kikita-labs/ui';

provideKikitaUi({ locale: 'ru-RU' });

// a subtree: provideKuiLocale('ru-RU') in the component's providers
```

Or override it for a single instance with the `locale` input, which takes precedence over the level:

```html
<kui-calendar locale="ru-RU" [(value)]="selectedDate" />
```

## Inputs

- `value`: two-way model, `Date | null` (default: `null`)
- `viewDate`: two-way model, first-of-month `Date` driving which month is displayed
- `size`: `md | sm` (default: `md`)
- `flat`: `boolean` (default: `false`). Strips the calendar's own background/border/padding.
- `showWeekend`: `boolean` (default: `true`). Renders the weekend days of the locale (Saturday and Sunday in `en-US`) in a muted color.
- `showFooter`: `boolean` (default: `false`). Renders the built-in value + "Today" footer.
- `showPrevNav` / `showNextNav`: `boolean` (default: `true`). Hide a header nav button.
- `minDate` / `maxDate`: `Date | undefined`. Dates outside the range are disabled.
- `disabledDates`: `Date[] | ((date: Date) => boolean) | undefined`. Individual exceptions.
- `locale`: `string | undefined`. BCP 47 locale tag overriding the locale of the nearest `KuiI18n` level for this instance.
- `messages`: `Partial<KuiCalendarMessages> | undefined`. Text overrides for this instance (`label`, `today`, `previousMonth`, ...). They win over the scoped and root messages.

## Provider Defaults

Set `defaults.calendar` once for the application or for a subtree:

```ts
// app.config.ts
provideKikitaUi({
  defaults: {
    calendar: {
      /* options below */
    },
  },
});

// a component, route or environment injector
providers: [
  provideKuiDefaults({
    calendar: {
      /* options below */
    },
  }),
];
```

| Option         | Values         | Description                                                                                                                 |
| -------------- | -------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `size`         | `'md' \| 'sm'` | Calendar size. Takes precedence over the global `defaults.size`.                                                            |
| `flat`         | `boolean`      | Strips the calendar's own background, border and padding.                                                                   |
| `showWeekend`  | `boolean`      | Shows Saturday and Sunday in a muted colour.                                                                                |
| `showFooter`   | `boolean`      | Shows the footer with the current value and the "Today" shortcut.                                                           |
| `showPrevNav`  | `boolean`      | Shows the "previous" navigation control in the header.                                                                      |
| `showNextNav`  | `boolean`      | Shows the "next" navigation control in the header.                                                                          |
| `previousIcon` | `KuiIconGlyph` | Icon of the previous control. Takes precedence over `defaults.icons.previous`. See [Structural Icons](structural-icons.md). |
| `nextIcon`     | `KuiIconGlyph` | Icon of the next control. Takes precedence over `defaults.icons.next`. See [Structural Icons](structural-icons.md).         |

Each option resolves as `local input > defaults.calendar.<option> > built-in default`. See [DI defaults](di-defaults.md).

## Accessibility

- The day grid is a complete ARIA grid: `role="grid"` containing the weekday header `role="row"` (with `role="columnheader"` cells that carry the full weekday name as `abbr`) and a `role="rowgroup"` of six `role="row"` week rows, each holding seven `role="gridcell"` elements. Each gridcell wraps one day `<button>`.
- `aria-selected` on the selected gridcell (not on the button), `aria-current="date"` on today, `aria-disabled` on disabled dates.
- Roving tabindex: one day cell is in the tab order at a time (the focused date). On initial render, the selected date receives focus when it is in the displayed month; otherwise today is used when visible, then the first day of the displayed month. Arrow keys, `Home`/`End`, and `PageUp`/`PageDown` move DOM focus to the new roving cell without leaving the grid.
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

<!-- color-tokens:begin -->

## Color Tokens

Set any of these on the component or an ancestor to restyle one part. Each token is optional: when it
is not set, the part uses the semantic role in the Default column.

| Token                                         | Default                          | Controls                           |
| --------------------------------------------- | -------------------------------- | ---------------------------------- |
| `--kui-calendar-bg`                           | `--kui-color-surface`            | Background                         |
| `--kui-calendar-border`                       | `--kui-color-border`             | Border color                       |
| `--kui-calendar-color`                        | `--kui-color-text`               | Color                              |
| `--kui-calendar-title-color`                  | `--kui-color-text`               | Title color                        |
| `--kui-calendar-day-color`                    | `--kui-color-text`               | Day color                          |
| `--kui-calendar-day-focus-ring-color`         | `--kui-color-focus`              | Day focus ring color               |
| `--kui-calendar-day-color-muted`              | `--kui-color-text-secondary`     | Day color, muted                   |
| `--kui-calendar-day-color-weekend`            | `--kui-color-text-secondary`     | Day color, weekend                 |
| `--kui-calendar-day-bg-selected`              | `--kui-color-primary-fill`       | Day background, selected           |
| `--kui-calendar-day-color-selected`           | `--kui-color-primary-on-fill`    | Day color, selected                |
| `--kui-calendar-day-color-range-middle`       | `--kui-color-primary-soft-text`  | Day color, range middle            |
| `--kui-calendar-day-bg-range-start`           | `--kui-color-primary-fill`       | Day background, range start        |
| `--kui-calendar-day-color-range-start`        | `--kui-color-primary-on-fill`    | Day color, range start             |
| `--kui-calendar-day-bg-range-end`             | `--kui-color-primary-fill`       | Day background, range end          |
| `--kui-calendar-day-color-range-end`          | `--kui-color-primary-on-fill`    | Day color, range end               |
| `--kui-calendar-day-bg-range-edge-hover`      | `--kui-color-primary-fill-hover` | Day background, range edge hover   |
| `--kui-calendar-day-bg-range-middle-hover`    | `?`                              | Day background, range middle hover |
| `--kui-calendar-day-bg-selected-hover`        | `--kui-color-primary-fill-hover` | Day background, selected hover     |
| `--kui-calendar-value-color`                  | `--kui-color-text-secondary`     | Value color                        |
| `--kui-calendar-picker-cell-color`            | `--kui-color-text`               | Picker cell color                  |
| `--kui-calendar-picker-cell-focus-ring-color` | `--kui-color-focus`              | Picker cell focus ring color       |
| `--kui-calendar-picker-cell-bg-active`        | `--kui-color-primary-fill`       | Picker cell background, active     |
| `--kui-calendar-picker-cell-color-active`     | `--kui-color-primary-on-fill`    | Picker cell color, active          |
| `--kui-calendar-picker-cell-color-muted`      | `--kui-color-text-secondary`     | Picker cell color, muted           |

<!-- color-tokens:end -->

<!-- geometry-tokens:begin -->

## Geometry Tokens

Set any of these on the component or an ancestor to restyle one part. Each token is optional: when it
is not set, the part uses the scale token in the Default column.

| Token                                       | Default                   | Controls                    |
| ------------------------------------------- | ------------------------- | --------------------------- |
| `--kui-calendar-radius`                     | `--kui-radius-lg`         | Corner radius               |
| `--kui-calendar-padding`                    | `--kui-space-4`           | Padding                     |
| `--kui-calendar-title-font-size`            | `--kui-text-sm-size`      | Title font size             |
| `--kui-calendar-title-padding-inline`       | `--kui-space-2`           | Title padding, inline       |
| `--kui-calendar-nav-spacer-size`            | `--kui-control-height-xs` | Nav spacer size             |
| `--kui-calendar-weekday-font-size`          | `--kui-text-xs-size`      | Weekday font size           |
| `--kui-calendar-weekday-padding-bottom`     | `--kui-space-2`           | Weekday padding, bottom     |
| `--kui-calendar-day-font-size`              | `--kui-text-sm-size`      | Day font size               |
| `--kui-calendar-footer-gap`                 | `--kui-space-2`           | Footer gap                  |
| `--kui-calendar-value-font-size`            | `--kui-text-xs-size`      | Value font size             |
| `--kui-calendar-picker-grid-gap`            | `--kui-space-2`           | Picker grid gap             |
| `--kui-calendar-picker-cell-padding-block`  | `--kui-space-3`           | Picker cell padding, block  |
| `--kui-calendar-picker-cell-padding-inline` | `--kui-space-2`           | Picker cell padding, inline |
| `--kui-calendar-picker-cell-radius`         | `--kui-radius-sm`         | Picker cell corner radius   |
| `--kui-calendar-picker-cell-font-size`      | `--kui-text-sm-size`      | Picker cell font size       |
| `--kui-calendar-padding-sm`                 | `--kui-space-3`           | Padding, sm                 |
| `--kui-calendar-day-font-size-sm`           | `--kui-text-xs-size`      | Day font size, sm           |
| `--kui-calendar-weekday-font-size-sm`       | `--kui-text-2xs-size`     | Weekday font size, sm       |

<!-- geometry-tokens:end -->

# Chart

Universal SVG chart family for product analytics: line, area, bar (vertical/horizontal,
grouped/stacked), donut, and scatter/bubble share one internal engine (scale math, axes, legend,
tooltip, keyboard navigation, alt-table) behind thin, type-specific public components -- not one
kitchen-sink component with a `type` prop. The contract and limitations below describe current source. Historical design exports are not required to understand or use this API.

**All four types are implemented:** `kui-line-chart`, `kui-bar-chart`, `kui-scatter-chart`,
`kui-donut-chart`.

## Data contract

| Chart           | Data                                                             | Domain                                                                        | Gaps and invalid values                              | Identity      |
| --------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------- | ---------------------------------------------------- | ------------- |
| Line, area      | `series[].data` aligned with `categories`, the shorter side wins | `[min(0, min), max(0, max)]` over all series; hiding a series keeps the scale | `null`, `NaN`, `Infinity` are gaps, never `0`        | `id ?? name`  |
| Bar, grouped    | as line                                                          | as line                                                                       | as line                                              | `id ?? name`  |
| Bar, stacked    | as line                                                          | per category, positive and negative sums separate, hidden series excluded     | as line                                              | `id ?? name`  |
| Scatter, bubble | `points: {x, y, r?}`                                             | data extent per axis, zero is not forced, hiding keeps the scale              | a point with a non-finite `x`, `y` or `r` is dropped | `id ?? name`  |
| Donut           | `slices: {id?, label, value, color?}`                            | shares of the visible total                                                   | negative and non-finite slices are dropped           | `id ?? label` |

Two series or slices that share an `id` (or, without one, a name) get distinct keys (`a`, `a#1`, ...);
in development mode the chart logs one warning per chart for a duplicate explicit `id` and for a
`data` array whose length differs from `categories`. A flat domain (every value equal) is expanded
so the axis never collapses, and ticks are rounded to the precision their step needs.

## Import

```ts
import { KuiBarChart, KuiDonutChart, KuiLineChart, KuiScatterChart } from '@kikita-labs/ui';
```

Import runtime styles once:

```ts
import '@kikita-labs/ui/styles';
```

## Usage

```html
<kui-line-chart ariaLabel="Sessions per day" [series]="series" [categories]="categories" />
```

```ts
protected readonly series: readonly KuiChartCartesianSeries[] = [
  { id: 'sessions', name: 'Sessions', data: [120, 180, 150, 220, 260, 210, 300] },
];
protected readonly categories = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
```

`ariaLabel` has a chart-type fallback name and should describe what the chart shows. It is distinct
from each point's own `aria-label` (its value).

## Area

```html
<kui-line-chart
  ariaLabel="Sessions per day"
  [series]="series"
  [categories]="categories"
  [area]="true"
/>
```

`area` is a boolean flag, not a separate component or chart type -- line and area differ only in
whether the area under the curve is filled; every other mechanic is identical.

## Series color

`series[].color`/`slices[].color` is optional -- when omitted, series/slices are colored by a
round-robin over the eight `--kui-chart-series-1..8` tokens, in the order given.

## Gaps and missing data

`null` in a series' `data` is a gap: the line breaks there instead of connecting across, and it is
never silently drawn as `0`. `NaN`/`Infinity` are treated the same as `null`. A `data` array
shorter or longer than `categories` is truncated to the shorter length rather than throwing.

## Legend

Shown automatically when there is more than one series (`legend` input overrides). Clicking a
legend item hides that series; hiding does **not** recompute the value-axis domain, so the
remaining series' scale stays stable across toggles (`kui-donut-chart` and stacked `kui-bar-chart`
are the deliberate exceptions -- see their own sections). Hovering a legend item highlights the
matching series/slice on the chart and vice versa (hovering a mark/slice also highlights its
legend entry) -- a two-way cross-highlight. Legend items for hidden series stay interactive --
"every series hidden" is a legend-only state, not the `EmptyState` shown when `series` itself has
no data.

### Standalone legend (`kui-chart-legend`)

Every `kui-*-chart` component implements `KuiChartLegendSource`: a public `legendItems()`/
`hoveredLegendId()` read surface plus `toggleLegendItem(id)`/`setHoveredLegendId(id)`. Pass the
chart through a template reference variable to `kui-chart-legend` to render its legend anywhere in
the DOM, independent of the chart's own inline `legend` slot -- set `[legend]="false"` on the
chart so the data doesn't render twice:

```html
<kui-line-chart
  #chartRef
  ariaLabel="..."
  [series]="series"
  [categories]="categories"
  [legend]="false"
/>
<kui-chart-legend [chart]="chartRef" />
```

Without a custom template, `kui-chart-legend` renders the same `<button>` markup (and
`.kui-chart__legend*` CSS classes) the chart's own inline legend does -- hide/show and hover
cross-highlight behave identically either way, since both read the exact same signals and call the
exact same methods. Project a `kuiChartLegendItem`-marked `<ng-template>` to fully replace that
markup with your own:

```html
<kui-chart-legend [chart]="chartRef">
  <ng-template kuiChartLegendItem let-item let-hovered="hovered">
    <button
      type="button"
      [class.active]="hovered"
      (click)="chartRef.toggleLegendItem(item.id)"
      (pointerenter)="chartRef.setHoveredLegendId(item.id)"
      (pointerleave)="chartRef.setHoveredLegendId(null)"
    >
      {{ item.label }}
    </button>
  </ng-template>
</kui-chart-legend>
```

The template receives `KuiChartLegendItemContext` (`$implicit`: the `KuiChartLegendEntry`,
`hovered`: whether it's cross-highlighted) -- wiring up `toggleLegendItem`/`setHoveredLegendId` is
the template's own job (it already has the chart reference in scope), not a second set of
callbacks this directive supplies. Modeled after the "headless legend" pattern common to chart
libraries with external-legend support (amCharts' external-container legends, Recharts'
`Legend`/`DefaultLegendContent` payload API, MUI X Charts' `ChartsWrapper` + `legendPosition`).

## Value axis

Always includes `0` (the domain is `[min(0, dataMin), max(0, dataMax)]`, not clamped to
non-negative) and is never log-scaled or domain-clamped.

## Dense series

```html
<kui-line-chart
  ariaLabel="Sessions over 120 days"
  [series]="series"
  [categories]="categories"
  size="lg"
/>
```

Tick labels are thinned by their measured width plus an 8px gap, so they never overlap, and a label
wider than its slot is cut with an ellipsis (the full text stays in the element's `<title>`). There is
no built-in zoom, pan or decimation -- an intentional scope cut (the same choice uPlot makes: zoom
and pan are a plugin concern). Aggregate or paginate very dense series before passing them in; see
[Performance](#performance) for what a chart draws and the measured cost.

## Sizes

```html
<kui-line-chart ariaLabel="..." [series]="series" [categories]="categories" size="sm" />
```

`size` (`sm` / `md` / `lg`, default `md`) sets the plot **height** in CSS pixels (200 / 280 / 360).
Line, bar and scatter charts measure their container with a `ResizeObserver` and draw at one user
unit per CSS pixel, so text, strokes and marks keep their pixel size at any width instead of
shrinking with the container; the plot follows the width, the axis padding fits the widest measured
tick label, and the x-axis padding also fits the axis title.

Server rendering and the first client render use a nominal width (`sm` 320, `md` 480, `lg` 640) inside
a graphic whose height is already final (`preserveAspectRatio="xMinYMin meet"`), so hydration does
not shift the layout; the first measurement runs after render. `kui-donut-chart` has no text, so it
stays CSS-scaled: a square of `min(container, size)`, centred.

Axis text defaults to `--kui-text-sm-size` (13px, above the 12px floor that Chartability asks for);
`--kui-chart-axis-text-font-size` changes it, and a smaller value is the consumer's decision.

Axis titles come from `axes.xTitle` and `axes.yTitle` and are drawn in the SVG.

## Loading / Empty

```html
<kui-line-chart ariaLabel="..." [series]="series" [categories]="categories" [loading]="true" />
```

`loading` shows a skeleton placeholder shaped like that chart type instead of a generic spinner:
`kui-line-chart` shows a wavy sparkline silhouette of shimmering dots, `kui-scatter-chart` shows a
loose scattered dot cluster, `kui-donut-chart` shows a shimmering ring, and `kui-bar-chart` shows
var-height bars (see its own section below) -- only the bar shape has an actual design source
(the original bar-chart design); the other three invent a
shape-appropriate placeholder built from the kit's own `[kuiSkeleton]` primitive rather than
falling back to a generic spinner. An empty or missing `series` (no non-gap value anywhere) always
renders an empty-state composition (dashed border, faded chart icon, "No data" text) -- from that
original chart design, shared across every chart type, not the kit's `kui-empty-state` (its anatomy
doesn't match this spec).

## Tooltip and value formatting

```ts
protected formatTooltip(point: KuiChartPoint): string {
  return `${point.categoryLabel}: $${point.value.toLocaleString('en-US')}`;
}
```

```html
<kui-line-chart
  ariaLabel="..."
  [series]="series"
  [categories]="categories"
  [tooltip]="formatTooltip"
/>
```

The tooltip is **dismissible** (`Escape` closes it without moving focus or the pointer, and it stays
closed until a new trigger -- the pointer leaves and comes back, or focus moves) and **persistent** (it
stays until hover or focus ends, or `Escape`). It follows the pointer and ignores pointer events, so it is
not **hoverable** (WCAG 1.4.13); see Known gaps. Every `[kuiTooltip]` trigger is hoverable, dismissible and
persistent.

`tooltip` overrides the default `"<series> · <category>: <value>"` text (scatter: `"<series>: (<x>, <y>)"`,
bubble adds the radius). `valueFormat` (default: the
locale's compact notation, `1.2K`/`3.4M` in English and `1,5 Mio.` in German) controls axis tick and default tooltip/legend number formatting --
it is never used for the alt-table, which always shows exact values. Accessible names, role descriptions,
the loading and empty text, the table headers and the point text are `chart` messages; every chart takes a
`messages` input for one-off overrides (see [Internationalization](i18n.md)).

## Alt-table

The "Table" button switches the same data to a `Table`-based representation with exact (not
compact-formatted) values -- the accessible-charts recommendation of pairing a graphic with a
tabular alternative, not a cosmetic duplicate. It lists the visible series with exact numbers, has a
caption with the chart name, and lists every point of a dense chart whatever the chart draws. The
Table button keeps keyboard focus when the view switches.

## `kui-bar-chart`

```html
<kui-bar-chart
  ariaLabel="MRR by plan"
  [series]="[{ name: 'MRR', data: [0, 4200, 9800, 15600] }]"
  [categories]="['Free', 'Pro', 'Business', 'Enterprise']"
/>
```

Shares `series`/`categories`/`size`/`legend`/`axes`/`valueFormat`/`tooltip`/`ariaLabel` with
`kui-line-chart` -- same gap handling, same round-robin default color, same tooltip/keyboard-nav
mechanics (both reuse the same internal `KuiChartTooltipController`/roving-tabindex helpers). Two
inputs are bar-specific:

- **`orientation`** (`'vertical' | 'horizontal'`, default `'vertical'`) -- flips on-screen bar
  direction only. `axes.x`/`axes.y` stay semantic (`x` = categories, `y` = values) regardless of
  orientation; only which screen edge (left/bottom) shows which axis changes.
- **`stacked`** (`boolean`, default `false`) -- stacks series within each category instead of
  placing them side by side. Only meaningful with more than one series (a single series stacked on
  itself renders identically to grouped). Positive and negative values stack separately (diverging
  stacking, like D3's `stackOffsetDiverging`), so a category with both gains and losses shows two
  stacks growing from zero in opposite directions, not one signed sum.

**Legend hide behavior differs from grouped/line:** hiding a series while `stacked` recomputes the
value-axis domain (the remaining stack collapses to its own height) -- the deliberate exception to
"hiding never recomputes the scale" that applies to `kui-line-chart` and grouped `kui-bar-chart`.
Grouped mode keeps the axis fixed, same as line.

**Loading** uses a var-height skeleton bar silhouette (from the original bar-chart design) -- the only chart type whose loading shape has an
actual design source; the other three (see Loading / Empty above) invent their own. The skeleton
shrinks with its container instead of overflowing it.

**`patterns`** fills each series with one of eight hatch patterns instead of plain colour; see
[Colour independence](#colour-independence).

## `kui-scatter-chart`

```html
<kui-scatter-chart
  ariaLabel="Age vs. income"
  [series]="[{ name: 'Users', points: [{ x: 22, y: 32000 }, { x: 41, y: 71000 }] }]"
/>
```

Shares `size`/`legend`/`axes`/`valueFormat`/`tooltip`/`ariaLabel`/loading/empty/tooltip-retarget/
keyboard-nav mechanics with `kui-line-chart`/`kui-bar-chart`. Structurally different:

- **No `categories` input.** Both axes are independent numeric domains computed from the data's
  own `x`/`y` extent, **not** forced to include `0` -- a deliberate deviation from
  `kui-line-chart`/`kui-bar-chart`'s "value axis always includes 0" rule. Scatter plots typically
  correlate two independent measures (e.g. age vs. income); forcing a zero baseline on either axis
  would compress the actually-interesting range. Matches typical scatter-plot practice (D3,
  Chart.js scatter both use the data extent).
- **`bubble`** (`boolean`, default `false`) -- reads `r` from each point as the bubble radius
  instead of a fixed dot size. Not a separate component or chart type (Chart.js precedent: bubble
  is scatter plus an unscaled `r`). `r` is in CSS pixels (one user unit is one pixel) and is **not
  clamped** -- the consumer is responsible for passing a radius that fits the plot area.
- **Touch/pointer hit-target.** Each point renders two overlaid shapes: an invisible circle at least
  12px in radius (a 24px target, WCAG 2.5.8; or the bubble's own radius if larger) that carries the
  role/aria-label/tabindex, and a visible decorative marker (`aria-hidden`) at the actual size. The
  tooltip shows while the pointer is on the hit circle, and a press focuses the point.
- **Alt-table** columns are `Series`/`X`/`Y` (`+R` when `bubble`), not category-keyed rows.

## `kui-donut-chart`

```html
<kui-donut-chart
  ariaLabel="Plan mix"
  [slices]="[{ label: 'Free', value: 40 }, { label: 'Pro', value: 35 }, { label: 'Business', value: 25 }]"
/>
```

No `categories`/`axes` inputs -- a donut has no axes. `slices: KuiChartSlice[]` (`{id?, label,
value, color?}`) replaces `series`; negative `value` is dropped during normalization (donut shares
cannot be negative).

**Hiding a slice through the legend recomputes the remaining slices' shares and re-partitions the
circle** -- the hidden slice is excluded from the total, and the other slices grow to fill its
angular space, the same "looks like the hidden item was never there" rule every other chart type's
own legend-hide behavior follows. See `computeDonutShares`'s JSDoc for the full rationale and the
earlier frozen-angle behavior (no re-partitioning, hidden slice leaves a gap) this replaced -- that
was this component's original behavior, following an since-superseded reading of a different design
spec's Open Questions; the maintainer confirmed on 2026-09-18 that recompute is correct here too.

A donut is a **ring**, not a filled disc (inner radius is 60% of the outer radius, fixed, not
configurable in v1) -- distinguishing it from a pie chart, matching the spec's own naming. A single
visible slice (100% share) renders as a true two-circle ring (`donutFullRingPath`) rather than an
arc wedge spanning the full circle -- SVG's arc command cannot close a true 360-degree arc
seamlessly (see `donutArcPath`'s JSDoc), and the visible seam that leaves behind is a real render
bug, not just a theoretical one -- found by browser-checking this exact case, not by a unit test.

A donut whose visible slices sum to zero draws no arc (all-zero data is the empty composition; a
visible set that sums to zero draws nothing while the legend stays usable) -- it never shows an equal
split of data that does not exist. The re-partition sweep runs through `requestAnimationFrame`
only without `prefers-reduced-motion`, and stops at once if reduced motion is turned on while it runs.

**No center text/sum.** The spec does not specify one, and no design source dictates its exact
appearance -- deferred rather than invented; see Known gaps.

## API

### `kui-line-chart`

| Input         | Type                                            | Default        | Description                                                                  |
| ------------- | ----------------------------------------------- | -------------- | ---------------------------------------------------------------------------- |
| `series`      | `readonly KuiChartCartesianSeries[]`            | -- (required)  | `{id?, name, color?, data}`. Empty/no non-gap value renders `EmptyState`.    |
| `categories`  | `readonly string[]`                             | `[]`           | Category labels, aligned index-for-index with each series' `data`.           |
| `area`        | `boolean`                                       | `false`        | Fills the area under each line. Not a separate chart type.                   |
| `patterns`    | `boolean`                                       | `false`        | With `area`, fills each area with a hatch pattern (see Colour independence). |
| `size`        | `'sm' \| 'md' \| 'lg'`                          | `'md'`         | Plot height: 200 / 280 / 360px.                                              |
| `loading`     | `boolean`                                       | `false`        | Shows a wavy-sparkline skeleton placeholder instead of the chart.            |
| `legend`      | `boolean \| undefined`                          | auto           | Defaults to `true` when there is more than one series.                       |
| `axes`        | `KuiChartAxesOptions`                           | `{}`           | `{x?, y?, gridLines?, xTitle?, yTitle?}`.                                    |
| `valueFormat` | `(value: number) => string`                     | compact        | Axis tick / default tooltip / legend number formatting.                      |
| `tooltip`     | `(point: KuiChartPoint) => string \| undefined` | built-in       | Overrides the default tooltip text.                                          |
| `ariaLabel`   | `string`                                        | `'Line chart'` | Accessible name for the chart as a whole; prefer a content-specific name.    |

### `kui-bar-chart`

| Input         | Type                                            | Default       | Description                                                               |
| ------------- | ----------------------------------------------- | ------------- | ------------------------------------------------------------------------- |
| `series`      | `readonly KuiChartCartesianSeries[]`            | -- (required) | `{id?, name, color?, data}`. Empty/no non-gap value renders `EmptyState`. |
| `categories`  | `readonly string[]`                             | `[]`          | Category labels, aligned index-for-index with each series' `data`.        |
| `orientation` | `'vertical' \| 'horizontal'`                    | `'vertical'`  | Flips on-screen bar direction only; `axes.x`/`axes.y` stay semantic.      |
| `stacked`     | `boolean`                                       | `false`       | Stacks series per category. Only meaningful with >1 series.               |
| `patterns`    | `boolean`                                       | `false`       | Fills each series with a hatch pattern (see Colour independence).         |
| `size`        | `'sm' \| 'md' \| 'lg'`                          | `'md'`        | Plot height: 200 / 280 / 360px.                                           |
| `loading`     | `boolean`                                       | `false`       | Shows a var-height skeleton bar silhouette instead of the chart.          |
| `legend`      | `boolean \| undefined`                          | auto          | Defaults to `true` when there is more than one series.                    |
| `axes`        | `KuiChartAxesOptions`                           | `{}`          | `{x?, y?, gridLines?, xTitle?, yTitle?}`.                                 |
| `valueFormat` | `(value: number) => string`                     | compact       | Axis tick / default tooltip / legend number formatting.                   |
| `tooltip`     | `(point: KuiChartPoint) => string \| undefined` | built-in      | Overrides the default tooltip text.                                       |
| `ariaLabel`   | `string`                                        | `'Bar chart'` | Accessible name for the chart as a whole; prefer a content-specific name. |

### `kui-scatter-chart`

| Input         | Type                                            | Default           | Description                                                               |
| ------------- | ----------------------------------------------- | ----------------- | ------------------------------------------------------------------------- |
| `series`      | `readonly KuiChartScatterSeries[]`              | -- (required)     | `{id?, name, color?, points: {x, y, r?}[]}`. Empty renders `EmptyState`.  |
| `bubble`      | `boolean`                                       | `false`           | Reads `r` from each point as the radius. Not a separate chart type.       |
| `size`        | `'sm' \| 'md' \| 'lg'`                          | `'md'`            | Plot height: 200 / 280 / 360px.                                           |
| `loading`     | `boolean`                                       | `false`           | Shows a scattered-dot skeleton placeholder instead of the chart.          |
| `legend`      | `boolean \| undefined`                          | auto              | Defaults to `true` when there is more than one series.                    |
| `axes`        | `KuiChartAxesOptions`                           | `{}`              | `{x?, y?, gridLines?, xTitle?, yTitle?}`. No `categories`-related fields. |
| `valueFormat` | `(value: number) => string`                     | compact           | Axis tick / default tooltip / legend number formatting.                   |
| `tooltip`     | `(point: KuiChartPoint) => string \| undefined` | built-in          | Overrides the default tooltip text.                                       |
| `ariaLabel`   | `string`                                        | `'Scatter chart'` | Accessible name for the chart as a whole; prefer a content-specific name. |

### `kui-donut-chart`

| Input         | Type                                            | Default         | Description                                                               |
| ------------- | ----------------------------------------------- | --------------- | ------------------------------------------------------------------------- |
| `slices`      | `readonly KuiChartSlice[]`                      | -- (required)   | `{id?, label, value, color?}`. Negative `value` is dropped.               |
| `size`        | `'sm' \| 'md' \| 'lg'`                          | `'md'`          | Square of up to 200 / 280 / 360px.                                        |
| `loading`     | `boolean`                                       | `false`         | Shows a shimmering ring skeleton placeholder instead of the chart.        |
| `patterns`    | `boolean`                                       | `false`         | Fills each slice with a hatch pattern (see Colour independence).          |
| `legend`      | `boolean \| undefined`                          | auto            | Defaults to `true` when there is more than one slice.                     |
| `valueFormat` | `(value: number) => string`                     | compact         | Default tooltip/legend number formatting.                                 |
| `tooltip`     | `(point: KuiChartPoint) => string \| undefined` | built-in        | Overrides the default `"<label>: <value> (<share>%)"` tooltip text.       |
| `ariaLabel`   | `string`                                        | `'Donut chart'` | Accessible name for the chart as a whole; prefer a content-specific name. |

### `kui-chart-legend`

| Input   | Type                   | Default       | Description                                                     |
| ------- | ---------------------- | ------------- | --------------------------------------------------------------- |
| `chart` | `KuiChartLegendSource` | -- (required) | Any `kui-*-chart` component, via a template reference variable. |

See Standalone legend above. Optionally projects a `kuiChartLegendItem`-marked `<ng-template>`
(context: `KuiChartLegendItemContext` -- `$implicit: KuiChartLegendEntry`, `hovered: boolean`) to
replace its default `<button>` markup.

## Provider Defaults

Set `defaults.barChart` once for the application or for a subtree:

```ts
// app.config.ts
provideKikitaUi({
  defaults: {
    barChart: {
      /* options below */
    },
  },
});

// a component, route or environment injector
providers: [
  provideKuiDefaults({
    barChart: {
      /* options below */
    },
  }),
];
```

| Option   | Values                 | Description             |
| -------- | ---------------------- | ----------------------- |
| `size`   | `'sm' \| 'md' \| 'lg'` | Chart size.             |
| `legend` | `boolean`              | Shows the chart legend. |

Each option resolves as `local input > defaults.barChart.<option> > built-in default`. See [DI defaults](di-defaults.md).

Set `defaults.lineChart` once for the application or for a subtree:

```ts
// app.config.ts
provideKikitaUi({
  defaults: {
    lineChart: {
      /* options below */
    },
  },
});

// a component, route or environment injector
providers: [
  provideKuiDefaults({
    lineChart: {
      /* options below */
    },
  }),
];
```

| Option   | Values                 | Description             |
| -------- | ---------------------- | ----------------------- |
| `size`   | `'sm' \| 'md' \| 'lg'` | Chart size.             |
| `legend` | `boolean`              | Shows the chart legend. |

Each option resolves as `local input > defaults.lineChart.<option> > built-in default`. See [DI defaults](di-defaults.md).

Set `defaults.donutChart` once for the application or for a subtree:

```ts
// app.config.ts
provideKikitaUi({
  defaults: {
    donutChart: {
      /* options below */
    },
  },
});

// a component, route or environment injector
providers: [
  provideKuiDefaults({
    donutChart: {
      /* options below */
    },
  }),
];
```

| Option   | Values                 | Description             |
| -------- | ---------------------- | ----------------------- |
| `size`   | `'sm' \| 'md' \| 'lg'` | Chart size.             |
| `legend` | `boolean`              | Shows the chart legend. |

Each option resolves as `local input > defaults.donutChart.<option> > built-in default`. See [DI defaults](di-defaults.md).

Set `defaults.scatterChart` once for the application or for a subtree:

```ts
// app.config.ts
provideKikitaUi({
  defaults: {
    scatterChart: {
      /* options below */
    },
  },
});

// a component, route or environment injector
providers: [
  provideKuiDefaults({
    scatterChart: {
      /* options below */
    },
  }),
];
```

| Option   | Values                 | Description             |
| -------- | ---------------------- | ----------------------- |
| `size`   | `'sm' \| 'md' \| 'lg'` | Chart size.             |
| `legend` | `boolean`              | Shows the chart legend. |

Each option resolves as `local input > defaults.scatterChart.<option> > built-in default`. See [DI defaults](di-defaults.md).

## Colour independence

Colour is never the only way to tell series apart (WCAG 1.4.1):

- With more than one series, line and scatter marks use a **marker shape per series index** (circle,
  square, diamond, up and down triangle, cross, plus, star) and the legend swatch shows the same
  shape. A single series stays circles. The shape follows the series, so hiding another series never
  changes it.
- `kui-bar-chart`, `kui-donut-chart` and `kui-line-chart` with `area` accept **`patterns`**
  (default `false`): each series or slice is filled with one of eight hatch patterns (a tinted ground
  with a hatch in the full series colour), and the legend swatch is a patterned square. Patterns are
  defined once per chart (`<pattern>` ids are unique per chart instance, so many charts on one page
  never collide).
- A hidden legend item is marked with more than its pressed state: the label is struck through and the
  swatch is an outline.
- In **forced colours** (Windows High Contrast) the chart takes over with `forced-color-adjust: none`
  and draws with system colours (`CanvasText`, `Canvas`, `GrayText`, `Highlight`) only. Series then
  differ by hatch pattern (areas, bars, slices), by dash (lines: solid, `8 4`, `2 3`, ...) and by marker
  shape -- patterns and dashes turn on automatically, `patterns` is not needed. Focus rings use
  `Highlight`.

Playwright's forced-colours emulation toggles only the media query; it does not force fill and stroke
the way the real mode does, so the real mode still needs a manual pass on Windows.

## Keyboard

Tab enters a chart at the last focused mark and leaves with Tab; DOM focus follows the arrows.

| Chart             | Keys                                                                                                                                                |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Line, grouped bar | `←` `→` along the category axis in the same series; `↑` `↓` between series at the same category; `Home` `End` first and last category of the series |
| Stacked bar       | `↑` `↓` between segments of the stack; the rest as above                                                                                            |
| Horizontal bar    | the pairs swap: `↑` `↓` along the categories, `←` `→` between series                                                                                |
| Scatter           | points are ordered by `x` within a series; the keys above                                                                                           |
| Donut             | `←` `↑` previous slice, `→` `↓` next slice, `Home` `End` first and last                                                                             |
| Any               | `Escape` dismisses the tooltip; `Enter` and `Space` on a legend item toggle it                                                                      |

The roving position is a key (series and category), not an index, so hiding a series moves it to the
nearest remaining mark and re-focuses that mark if focus was inside the chart. Focus mirrors hover:
the focused mark highlights its series and opens the tooltip.

## Performance

A line chart draws one DOM mark per point up to 500 marks (`KUI_CHART_MARK_LIMIT`); above that it
draws only the mark that holds the tab stop (the keyboard model is index-based, so
nothing else changes, and the table always lists every point). Bar and scatter charts draw every
shape. Measured in Chromium on the Playground stress page (`/components/chart`, "Stress test"; a line
chart with two series and a scatter chart with one series of the same point count; the paint time is
the click until two animation frames later):

| Points per chart | Time to paint | DOM nodes (both charts) |
| ---------------- | ------------- | ----------------------- |
| 500              | 46 ms         | 1,629                   |
| 2,000            | 115 ms        | 6,123                   |
| 5,000            | 259 ms        | 15,123                  |

Hiding a series on the 2,000-point line chart paints in 27 ms. The e2e budget
(`chart-contract.spec.ts`) is a ceiling of 500, 1000 and 2000 ms for the three sizes. The practical
limit for bar and scatter charts is a few thousand shapes; above that, aggregate before passing the
data in. Decimation is out of scope.

## Accessibility

- The `<svg>` is the graphic: `role="graphics-document"` with the name and the role description
  (`aria-roledescription`). The wrapper has no role, and axis text, gridlines and decorative shapes
  are `aria-hidden`.
- Each point/bar/slice is `role="graphics-symbol img"` with its own `aria-label` (the same text as
  the tooltip) -- an indivisible graphical unit, per the WAI-ARIA Graphics Module.
- Roving tabindex across points/bars/slices (see Keyboard). The inline legend is a named group of
  native `<button aria-pressed>` items at least 24px high.
- The tooltip shown on hover is the same one shown on keyboard focus (one shared overlay, retargeted
  between marks). It is dismissible and persistent. On pointer hover it appears at the pointer and follows
  it; keyboard focus anchors it to the focused mark. On touch, a tap pins the tooltip open until an
  outside tap, `Escape`, or a tap on a different mark; it also always renders below 768px, since it is
  the primary way to read a chart's exact value.
- Pointer hit targets: a line chart shows the tooltip while the pointer is on the point (its marker plus a
  3px margin), a scatter chart on the point's hit circle (at least 12px in radius), a bar chart on the bar
  itself and a donut on the slice.
- Text is at least 12px on screen: axis text defaults to 13px and keeps its pixel size at any width.
- `prefers-reduced-motion: reduce` disables the hover/dim transition and the donut sweep.
- The alt-table is a real accessible alternative to the graphic, not a decorative duplicate.

Automated checks (keyboard, accessibility tree, axe, forced-colours media emulation, reduced motion)
are in `chart-contract.spec.ts` and `accessibility.spec.ts`. A session with a real screen reader has
not been run and stays pending.

## Known gaps

- A bar is a `<path>` and its size change (hiding a series on a stacked chart) is a CSS transition of `d`.
  Chromium animates it; Safari and Firefox are expected to jump to the new size instead, because they do not
  animate the `d` property (from browser compatibility data, not tested here). Nothing else depends on it.
  A `requestAnimationFrame` tween like the donut's would make it smooth everywhere; not done, because the
  effect is decorative.
- The chart tooltip follows the pointer and is not hoverable, so it does not meet the "hoverable" part of
  WCAG 1.4.13 (it is dismissible and persistent). It was left this way on purpose: a tooltip that is
  hoverable and follows the cursor catches the cursor and freezes. Anchoring it to the mark would fix
  both; that is a design decision still open.
- `kui-scatter-chart`'s `bubble` radius is not clamped to any min/max -- a consumer passing an
  unbounded `r` can draw a bubble far larger than the plot area; the consumer owns this.
- `kui-donut-chart` has no center text/sum -- the spec does not specify one and no design source
  dictates its appearance; explicitly deferred rather than invented. Its inner-radius ratio (60% of
  the outer radius) is fixed, not configurable.
- There is no zoom, pan or decimation, and bar and scatter charts draw every shape (see
  [Performance](#performance)).
- The marker shapes and hatch patterns are engineering decisions recorded in
  `docs/design-provenance.md`; the designer still has to confirm them for Figma and `tokens.css`.
- Visual baselines were captured in Docker and reviewed, but a formal assistive-technology pass with a
  real screen reader and a real Windows forced-colours session is still pending.

<!-- color-tokens:begin -->

## Color Tokens

Set any of these on the component or an ancestor to restyle one part. Each token is optional: when it
is not set, the part uses the semantic role in the Default column.

| Token                                  | Default                        | Controls                       |
| -------------------------------------- | ------------------------------ | ------------------------------ |
| `--kui-chart-mark-stroke`              | `--kui-color-surface`          | Mark stroke                    |
| `--kui-chart-pattern-ground-color`     | `--kui-color-surface`          | Ground under hatch patterns    |
| `--kui-chart-axis-title-color`         | `--kui-chart-axis-label-color` | Axis title color               |
| `--kui-chart-empty-border`             | `--kui-color-border`           | Empty border color             |
| `--kui-chart-empty-color`              | `--kui-color-text-secondary`   | Empty color                    |
| `--kui-chart-legend-item-bg-active`    | `--kui-color-surface-sunken`   | Legend item background, active |
| `--kui-chart-legend-item-color-active` | `--kui-color-text`             | Legend item color, active      |

<!-- color-tokens:end -->

<!-- geometry-tokens:begin -->

## Geometry Tokens

Set any of these on the component or an ancestor to restyle one part. Each token is optional: when it
is not set, the part uses the scale token in the Default column.

| Token                                    | Default              | Controls                    |
| ---------------------------------------- | -------------------- | --------------------------- |
| `--kui-chart-gap`                        | `--kui-space-3`      | Gap                         |
| `--kui-chart-axis-text-font-size`        | `--kui-text-sm-size` | Axis text font size         |
| `--kui-chart-loading-bars-gap`           | `--kui-space-3`      | Loading bars gap            |
| `--kui-chart-loading-bars-padding`       | `--kui-space-4`      | Loading bars padding        |
| `--kui-chart-empty-gap`                  | `--kui-space-3`      | Empty gap                   |
| `--kui-chart-empty-radius`               | `--kui-radius-md`    | Empty corner radius         |
| `--kui-chart-empty-text-font-size`       | `--kui-text-sm-size` | Empty text font size        |
| `--kui-chart-toolbar-gap`                | `--kui-space-3`      | Toolbar gap                 |
| `--kui-chart-legend-gap`                 | `--kui-space-3`      | Legend gap                  |
| `--kui-chart-legend-item-gap`            | `--kui-space-2`      | Legend item gap             |
| `--kui-chart-legend-item-radius`         | `--kui-radius-sm`    | Legend item corner radius   |
| `--kui-chart-legend-item-padding-inline` | `--kui-space-1`      | Legend item padding, inline |
| `--kui-chart-legend-item-font-size`      | `--kui-text-sm-size` | Legend item font size       |
| `--kui-chart-legend-swatch-size`         | `12px`               | Legend swatch size          |

<!-- geometry-tokens:end -->

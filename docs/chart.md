# Chart

Universal SVG chart family for product analytics: line, area, bar (vertical/horizontal,
grouped/stacked), donut, and scatter/bubble share one internal engine (scale math, axes, legend,
tooltip, keyboard navigation, alt-table) behind thin, type-specific public components -- not one
kitchen-sink component with a `type` prop. New pattern, built from Claude Design spec
`09 Chart.dc.html`. See `.local-notes/v2/chart-architecture-plan.md` for the full design rationale
(data contracts, scale/stacking math, missing-data handling, accessibility, SSR) and the phased
implementation checklist.

**All four types are implemented:** `kui-line-chart`, `kui-bar-chart`, `kui-scatter-chart`,
`kui-donut-chart`.

## Import

```ts
import {
  KuiBarChartComponent,
  KuiDonutChartComponent,
  KuiLineChartComponent,
  KuiScatterChartComponent,
} from '@kikita-labs/ui';
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

`ariaLabel` is required -- it is the accessible name for the chart as a whole (what it shows),
distinct from each point's own `aria-label` (its value).

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

The template receives `KuiChartLegendItemContext` (`$implicit`: the `KuiChartLegendItem`,
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

Tick labels thin automatically at high density instead of overlapping. There is no built-in
zoom/pan -- an intentional scope cut (the same choice uPlot makes: zoom/pan is a plugin concern,
not part of the base renderer). Aggregate or paginate very dense series before passing them in.

## Sizes

```html
<kui-line-chart ariaLabel="..." [series]="series" [categories]="categories" size="sm" />
```

`size` (`sm` / `md` / `lg`, default `md`) sets the SVG's nominal `viewBox` dimensions (a fixed
per-size width/height pair, not a real measured pixel size). The `<svg>` itself scales
responsively by pure CSS (`width:100%;height:auto` with `preserveAspectRatio="xMidYMid meet"`,
matching the Claude Design spec `02ec9aaf/40 Charts.dc.html`'s own `.kui-chart` rule) -- there is
no `ResizeObserver`/client-side width measurement. An earlier version measured the real container
width and re-rendered once that landed, which caused a visible "narrow, then snaps to full width"
flicker on first paint; removed as unnecessary complexity, since nothing actually needs the true
pixel width, only a stable aspect ratio. One consequence: tick-thinning and font sizing are
computed against the nominal `viewBox` width, not the actual rendered width, so a chart rendered
much narrower than its nominal size can under-thin ticks or look denser than intended -- see Known
gaps.

## Loading / Empty

```html
<kui-line-chart ariaLabel="..." [series]="series" [categories]="categories" [loading]="true" />
```

`loading` shows a skeleton placeholder shaped like that chart type instead of a generic spinner:
`kui-line-chart` shows a wavy sparkline silhouette of shimmering dots, `kui-scatter-chart` shows a
loose scattered dot cluster, `kui-donut-chart` shows a shimmering ring, and `kui-bar-chart` shows
var-height bars (see its own section below) -- only the bar shape has an actual design source
(Claude Design `02ec9aaf/40 Charts.dc.html`'s `.chart-skeleton`); the other three invent a
shape-appropriate placeholder built from the kit's own `[kuiSkeleton]` primitive rather than
falling back to a generic spinner. An empty or missing `series` (no non-gap value anywhere) always
renders an empty-state composition (dashed border, faded chart icon, "No data" text) -- from that
same `02ec9aaf` spec, shared across every chart type, not the kit's `kui-empty-state` (its anatomy
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

`tooltip` overrides the default `"<series> · <category>: <value>"` text. `valueFormat` (default: a
compact `1.2K`/`3.4M` formatter) controls axis tick and default tooltip/legend number formatting --
it is never used for the alt-table, which always shows exact values.

## Alt-table

The "Table" button switches the same data to a `Table`-based representation with exact (not
compact-formatted) values -- the accessible-charts recommendation of pairing a graphic with a
tabular alternative, not a cosmetic duplicate.

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

**Loading** uses a var-height skeleton bar silhouette (from Claude Design
`02ec9aaf/40 Charts.dc.html`'s `.chart-skeleton`) -- the only chart type whose loading shape has an
actual design source; the other three (see Loading / Empty above) invent their own.

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
  is scatter plus an unscaled `r`). `r` is in SVG viewBox units and is **not clamped** -- the
  consumer is responsible for passing a radius that fits the plot area.
- **Touch/pointer hit-target.** Each point renders two overlaid circles: an invisible one at least
  10 viewBox units in radius (or the bubble's own radius if larger) that carries the
  role/aria-label/tabindex/events, and a visible decorative dot (`aria-hidden`) at the actual
  radius. A 3px default dot would otherwise be hard to hover or tap precisely.
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

**No center text/sum.** The spec does not specify one, and no design source dictates its exact
appearance -- deferred rather than invented; see Known gaps.

## API

### `kui-line-chart`

| Input         | Type                                            | Default       | Description                                                               |
| ------------- | ----------------------------------------------- | ------------- | ------------------------------------------------------------------------- |
| `series`      | `readonly KuiChartCartesianSeries[]`            | -- (required) | `{id?, name, color?, data}`. Empty/no non-gap value renders `EmptyState`. |
| `categories`  | `readonly string[]`                             | `[]`          | Category labels, aligned index-for-index with each series' `data`.        |
| `area`        | `boolean`                                       | `false`       | Fills the area under each line. Not a separate chart type.                |
| `size`        | `'sm' \| 'md' \| 'lg'`                          | `'md'`        | Nominal SVG `viewBox` height: 200 / 280 / 360px.                          |
| `loading`     | `boolean`                                       | `false`       | Shows a wavy-sparkline skeleton placeholder instead of the chart.         |
| `legend`      | `boolean \| undefined`                          | auto          | Defaults to `true` when there is more than one series.                    |
| `axes`        | `KuiChartAxesOptions`                           | `{}`          | `{x?, y?, gridLines?, xTitle?, yTitle?}`.                                 |
| `valueFormat` | `(value: number) => string`                     | compact       | Axis tick / default tooltip / legend number formatting.                   |
| `tooltip`     | `(point: KuiChartPoint) => string \| undefined` | built-in      | Overrides the default tooltip text.                                       |
| `ariaLabel`   | `string`                                        | -- (required) | Accessible name for the chart as a whole.                                 |

### `kui-bar-chart`

| Input         | Type                                            | Default       | Description                                                               |
| ------------- | ----------------------------------------------- | ------------- | ------------------------------------------------------------------------- |
| `series`      | `readonly KuiChartCartesianSeries[]`            | -- (required) | `{id?, name, color?, data}`. Empty/no non-gap value renders `EmptyState`. |
| `categories`  | `readonly string[]`                             | `[]`          | Category labels, aligned index-for-index with each series' `data`.        |
| `orientation` | `'vertical' \| 'horizontal'`                    | `'vertical'`  | Flips on-screen bar direction only; `axes.x`/`axes.y` stay semantic.      |
| `stacked`     | `boolean`                                       | `false`       | Stacks series per category. Only meaningful with >1 series.               |
| `size`        | `'sm' \| 'md' \| 'lg'`                          | `'md'`        | Nominal SVG `viewBox` height: 200 / 280 / 360px.                          |
| `loading`     | `boolean`                                       | `false`       | Shows a var-height skeleton bar silhouette instead of the chart.          |
| `legend`      | `boolean \| undefined`                          | auto          | Defaults to `true` when there is more than one series.                    |
| `axes`        | `KuiChartAxesOptions`                           | `{}`          | `{x?, y?, gridLines?, xTitle?, yTitle?}`.                                 |
| `valueFormat` | `(value: number) => string`                     | compact       | Axis tick / default tooltip / legend number formatting.                   |
| `tooltip`     | `(point: KuiChartPoint) => string \| undefined` | built-in      | Overrides the default tooltip text.                                       |
| `ariaLabel`   | `string`                                        | -- (required) | Accessible name for the chart as a whole.                                 |

### `kui-scatter-chart`

| Input         | Type                                            | Default       | Description                                                               |
| ------------- | ----------------------------------------------- | ------------- | ------------------------------------------------------------------------- |
| `series`      | `readonly KuiChartScatterSeries[]`              | -- (required) | `{id?, name, color?, points: {x, y, r?}[]}`. Empty renders `EmptyState`.  |
| `bubble`      | `boolean`                                       | `false`       | Reads `r` from each point as the radius. Not a separate chart type.       |
| `size`        | `'sm' \| 'md' \| 'lg'`                          | `'md'`        | Nominal SVG `viewBox` height: 200 / 280 / 360px.                          |
| `loading`     | `boolean`                                       | `false`       | Shows a scattered-dot skeleton placeholder instead of the chart.          |
| `legend`      | `boolean \| undefined`                          | auto          | Defaults to `true` when there is more than one series.                    |
| `axes`        | `KuiChartAxesOptions`                           | `{}`          | `{x?, y?, gridLines?, xTitle?, yTitle?}`. No `categories`-related fields. |
| `valueFormat` | `(value: number) => string`                     | compact       | Axis tick / default tooltip / legend number formatting.                   |
| `tooltip`     | `(point: KuiChartPoint) => string \| undefined` | built-in      | Overrides the default tooltip text.                                       |
| `ariaLabel`   | `string`                                        | -- (required) | Accessible name for the chart as a whole.                                 |

### `kui-donut-chart`

| Input         | Type                                            | Default       | Description                                                         |
| ------------- | ----------------------------------------------- | ------------- | ------------------------------------------------------------------- |
| `slices`      | `readonly KuiChartSlice[]`                      | -- (required) | `{id?, label, value, color?}`. Negative `value` is dropped.         |
| `size`        | `'sm' \| 'md' \| 'lg'`                          | `'md'`        | Square nominal SVG `viewBox`: 200 / 280 / 360px.                    |
| `loading`     | `boolean`                                       | `false`       | Shows a shimmering ring skeleton placeholder instead of the chart.  |
| `legend`      | `boolean \| undefined`                          | auto          | Defaults to `true` when there is more than one slice.               |
| `valueFormat` | `(value: number) => string`                     | compact       | Default tooltip/legend number formatting.                           |
| `tooltip`     | `(point: KuiChartPoint) => string \| undefined` | built-in      | Overrides the default `"<label>: <value> (<share>%)"` tooltip text. |
| `ariaLabel`   | `string`                                        | -- (required) | Accessible name for the chart as a whole.                           |

### `kui-chart-legend`

| Input   | Type                   | Default       | Description                                                     |
| ------- | ---------------------- | ------------- | --------------------------------------------------------------- |
| `chart` | `KuiChartLegendSource` | -- (required) | Any `kui-*-chart` component, via a template reference variable. |

See Standalone legend above. Optionally projects a `kuiChartLegendItem`-marked `<ng-template>`
(context: `KuiChartLegendItemContext` -- `$implicit: KuiChartLegendItem`, `hovered: boolean`) to
replace its default `<button>` markup.

## Accessibility

- Each point/bar/slice is `role="graphics-symbol img"` with its own `aria-label` (the same text as
  the tooltip) -- an indivisible graphical unit, per the WAI-ARIA Graphics Module, not the whole
  `<svg>`.
- Roving tabindex across points/bars/slices: `Tab`/`Shift+Tab` enters/exits the chart at the
  last-focused mark; `←`/`→`/`↑`/`↓` move to the adjacent mark; `Home`/`End` jump to the
  first/last mark.
- The tooltip shown on hover is the same one shown on keyboard focus (one shared overlay,
  retargeted between marks -- not a tooltip instance per mark). On pointer hover it follows the
  cursor (`pointermove` retargets the overlay to the pointer's viewport position), matching common
  chart libraries' hover-tooltip behavior; keyboard focus still anchors to the focused mark's own
  element, since a focus event has no pointer position to follow. On touch, a tap pins the tooltip
  open (no hover-follow exists for touch) until an outside tap, `Escape`, or a tap on a different
  mark; the tooltip also always renders below 768px, unlike a purely decorative `kuiTooltip`, since
  it's the primary way to read a chart's exact value.
- Points/bars/slices, not the legend, carry the per-value accessible name; the legend uses native
  `<button aria-pressed>`.
- `kui-scatter-chart` gives every point/bubble an invisible hit-target at least 10 viewBox units in
  radius, separate from its (possibly much smaller) visual dot, for touch/pointer precision.
- `prefers-reduced-motion: reduce` disables the hover/dim transition.
- The alt-table is a real accessible alternative to the graphic, not a decorative duplicate.

## Known gaps

- Padding for axis labels is fixed (sized for the default compact formatter's typical 2-4 char
  numeric output on `kui-line-chart`, vertical `kui-bar-chart`, and `kui-scatter-chart`;
  `kui-bar-chart` uses a wider fixed left padding when `orientation="horizontal"`, since that side
  then shows category text labels instead of numbers) -- not measured against the longest actual
  tick label in any case, so an unusually long category name or a `valueFormat` producing much
  wider numbers can still clip against the plot area. The first/last tick on any axis anchors
  inward (`start`/`end` instead of `middle`) so it does not clip against the viewBox edge, but
  interior ticks can still visually crowd each other at high density -- `thinTicks` reduces the
  count, it does not measure actual rendered label width.
- Tick-thinning and font sizing are computed against each chart's nominal `viewBox` size (see
  Sizes above), not the actual rendered pixel size -- a chart rendered much narrower than its
  nominal `size` can under-thin ticks or look denser than the same chart at its intended size.
- `kui-scatter-chart` does not implement series distinguishability beyond color (marker
  shape/pattern) -- the design brief did not specify one, and no shape/pattern system has been
  designed yet; explicitly deferred rather than invented.
- `kui-scatter-chart`'s `bubble` radius is not clamped to any min/max -- a consumer passing an
  unbounded `r` can draw a bubble far larger than the plot area; the consumer owns this.
- `kui-donut-chart` has no center text/sum -- the spec does not specify one and no design source
  dictates its appearance; explicitly deferred rather than invented. Its inner-radius ratio (60% of
  the outer radius) is fixed, not configurable, in v1.
- The shared `KuiTooltipDirective`'s hover/focus mode is not fully WCAG 1.4.13 compliant (not
  dismissible via Escape, not hoverable) -- a pre-existing kit-wide gap, not specific to Chart; see
  `docs/component-roadmap.md` Known Tech Debt.
- Reviewed in a real browser for all four types (tooltip retarget, keyboard nav, legend, alt-table,
  all orientations/stacking/bubble, default colors, donut hide-recompute behavior) -- but committed
  visual-regression baselines and a formal assistive-technology pass are still pending, same as
  other recently added primitives.

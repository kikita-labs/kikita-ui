# Pagination

Navigation between pages of a long list or table: page numbers, step forward/back, jump to
first/last, and optionally a "Showing X–Y of Z" summary with a rows-per-page picker. Composed
entirely from existing kit primitives -- `button[kuiButton]` for page numbers, `button[kuiIconButton]`
for First/Prev/Next/Last, and `input[kuiSelect]` for the rows-per-page picker -- plus one piece of
markup the kit has no primitive for: a static, non-interactive ellipsis.

The current page is marked with `shape="solid" appearance="primary"` plus `aria-current="page"`
(state is never carried by color alone), matching Claude Design spec `03 Pagination.dc.html`
exactly. The First/Prev/Next/Last chevrons are this component's own internal chrome, not
user-facing content, so -- like `kui-select`'s dropdown chevron and `kui-tabs`' scroll chevrons --
they are structural icons (synchronous icon data drawn as inline SVG) instead of `IconButton`'s
network-dependent, name-resolved `icon` input. Replace them with `defaults.pagination.firstIcon`,
`previousIcon`, `nextIcon` and `lastIcon`, or the shared roles; see
[Structural Icons](structural-icons.md).

## Import

```ts
import { KuiPaginationComponent } from '@kikita-labs/ui';
```

Import runtime styles once:

```ts
import '@kikita-labs/ui/styles';
```

## Usage

```html
<kui-pagination [totalPages]="10" [(currentPage)]="page" />
```

```ts
protected readonly page = signal(1);
```

`currentPage` and `pageSize` are plain two-way bindings (`[(currentPage)]`, `[(pageSize)]`), not
`FormValueControl` -- pagination is page-level navigation state, not a form field value, so it is
never placed inside `kui-field`.

## Variants

```html
<kui-pagination variant="compact" [totalPages]="12" [(currentPage)]="page" />
<kui-pagination variant="simple" [totalPages]="12" [(currentPage)]="page" />
<kui-pagination
  variant="full"
  [totalPages]="12"
  [totalItems]="289"
  [(currentPage)]="page"
  [(pageSize)]="pageSize"
/>
```

- `compact` (default): First/Prev/numbers+ellipsis/Next/Last.
- `simple`: only Prev/"Page X of Y"/Next -- for narrow layouts (e.g. a mobile list).
- `full`: everything in `compact`, plus the "Showing X–Y of Z" summary and a rows-per-page picker.

## Sizes

```html
<kui-pagination size="lg" [totalPages]="12" [(currentPage)]="page" />
```

`size` uses the same `xs | sm | md | lg` scale as `Button`/`IconButton` (default `'md'`).

## Page window

```html
<kui-pagination [totalPages]="42" [siblingCount]="2" [boundaryCount]="1" [(currentPage)]="page" />
```

`siblingCount` (default `1`) is how many page numbers show beside the current page before an
ellipsis appears; `boundaryCount` (default `1`) is how many page numbers always show at each edge.
Both borrow their names from MUI Pagination's `usePagination` so the vocabulary isn't reinvented.
The ellipsis itself is a static `<span aria-hidden="true">`, not a button -- it never becomes
clickable/interactive.

## Rows-per-page

```html
<kui-pagination
  variant="full"
  [totalPages]="totalPages()"
  [totalItems]="totalItems()"
  [pageSizeOptions]="[10, 25, 50, 100]"
  [(currentPage)]="page"
  [(pageSize)]="pageSize"
/>
```

Only rendered by `variant="full"`. Changing the picker's value sets `pageSize` and resets
`currentPage` to `1` in the same update -- a stale page offset into a resized list is wrong, not
just visually different, matching every researched kit's own Paginator behavior.

## Usage with `kui-table`

`kui-pagination` is a standalone sibling of `table[kuiTable]`, never nested inside it: `kuiTable`
is a directive on a native `<table>`, whose only legal children are
`thead`/`tbody`/`tfoot`/`tr`/`caption`/`colgroup`, so a `<nav>`-based control cannot live inside it,
and `kuiTable` holds/sorts the full dataset with no slicing concept of its own. This mirrors how
Angular Material composes `mat-paginator` with `mat-table` (a sibling driving a shared
`DataSource`/page state, not a component the table owns or injects) rather than PrimeNG's
`p-table`, which renders its own paginator internally -- only possible because `p-table` is a
wrapping component, not a thin directive over a bare `<table>` the way `kuiTable` is.

```html
<table kuiTable [data]="sortedPage()" #t="kuiTable" (sortChange)="onSort($event)">
  <!-- thead/tbody as usual -->
</table>

<kui-pagination
  variant="full"
  [totalPages]="totalPages()"
  [totalItems]="allRows().length"
  [(currentPage)]="page"
  [(pageSize)]="pageSize"
/>
```

```ts
protected readonly allRows = signal<Row[]>([...]);
protected readonly page = signal(1);
protected readonly pageSize = signal(25);
protected readonly totalPages = computed(() =>
  Math.max(1, Math.ceil(this.allRows().length / this.pageSize())),
);
protected readonly sortedPage = computed(() => {
  const start = (this.page() - 1) * this.pageSize();
  return this.allRows().slice(start, start + this.pageSize());
});
```

No DI link between the two components is needed or added -- `currentPage`/`pageSize` are the one
piece of shared state, owned by the consuming page/component, the same as `mat-paginator`'s
`pageIndex`/`pageSize` drive a `MatTableDataSource` from outside the table.

## Disabled

```html
<kui-pagination [totalPages]="12" [currentPage]="5" disabled />
```

`disabled` blocks every control with the native `disabled` attribute (not just visually), removing
them from tab order.

## API

| Input             | Type                              | Default                    | Description                                                                                                             |
| ----------------- | --------------------------------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `variant`         | `'full' \| 'compact' \| 'simple'` | `'compact'`                | Layout preset. See Variants above.                                                                                      |
| `size`            | `KuiSize`                         | `'md'`                     | Control size. Same scale as `Button`/`IconButton`.                                                                      |
| `totalPages`      | positive integer                  | --                         | Required total page count. Static numeric values are coerced; invalid or non-positive values use `1`.                   |
| `currentPage`     | `number`                          | `1`                        | Current page, 1-based. Two-way model.                                                                                   |
| `siblingCount`    | non-negative integer              | `1`                        | Page numbers shown beside the current page before an ellipsis appears. Static numeric values are coerced.               |
| `boundaryCount`   | non-negative integer              | `1`                        | Page numbers always shown at each edge before an ellipsis appears. Static numeric values are coerced.                   |
| `pageSize`        | `number`                          | `25`                       | Rows shown per page. Only used by `variant="full"`. Two-way model.                                                      |
| `pageSizeOptions` | `readonly number[]`               | `[10, 25, 50, 100]`        | Choices offered by the rows-per-page picker. Only used by `variant="full"`.                                             |
| `totalItems`      | `number \| undefined`             | `totalPages * pageSize`    | Total item count, for the summary text. Only used by `variant="full"`.                                                  |
| `disabled`        | `boolean`                         | `false`                    | Disables every control.                                                                                                 |
| `ariaLabel`       | `string`                          | `pagination.label` message | Accessible name for the `nav` landmark.                                                                                 |
| `messages`        | `Partial<KuiPaginationMessages>`  | `undefined`                | Text overrides for this instance (button names, `rowsPerPage`, `summary`, `page`). See [Internationalization](i18n.md). |

| Output              | Payload  | Description                                            |
| ------------------- | -------- | ------------------------------------------------------ |
| `currentPageChange` | `number` | Emitted whenever `currentPage` changes (model output). |
| `pageSizeChange`    | `number` | Emitted whenever `pageSize` changes (model output).    |

## Provider Defaults

Set `defaults.pagination` once for the application or for a subtree:

```ts
// app.config.ts
provideKikitaUi({
  defaults: {
    pagination: {
      /* options below */
    },
  },
});

// a component, route or environment injector
providers: [
  kuiProvideDefaults({
    pagination: {
      /* options below */
    },
  }),
];
```

| Option            | Values                            | Description                                                                                                                 |
| ----------------- | --------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `variant`         | `'full' \| 'compact' \| 'simple'` | Layout variant.                                                                                                             |
| `siblingCount`    | `number`                          | Pages shown on each side of the current page.                                                                               |
| `boundaryCount`   | `number`                          | Pages always shown at each edge.                                                                                            |
| `pageSizeOptions` | `readonly number[]`               | Choices offered by the rows-per-page picker of the `full` variant.                                                          |
| `firstIcon`       | `KuiIconGlyph`                    | Icon of the first-page button. Takes precedence over `defaults.icons.first`. See [Structural Icons](structural-icons.md).   |
| `previousIcon`    | `KuiIconGlyph`                    | Icon of the previous control. Takes precedence over `defaults.icons.previous`. See [Structural Icons](structural-icons.md). |
| `nextIcon`        | `KuiIconGlyph`                    | Icon of the next control. Takes precedence over `defaults.icons.next`. See [Structural Icons](structural-icons.md).         |
| `lastIcon`        | `KuiIconGlyph`                    | Icon of the last-page button. Takes precedence over `defaults.icons.last`. See [Structural Icons](structural-icons.md).     |

Each option resolves as `local input > defaults.pagination.<option> > built-in default`. See [DI defaults](di-defaults.md).

## Accessibility

- The controls sit inside a `<nav>` landmark with `aria-label` (default: the `pagination.label` message, `"Pagination"`), a
  separate landmark from the page's own primary navigation.
- The current page gets both `aria-current="page"` and its own `aria-label`
  (`"Page N, current"`) -- state is not carried by `shape="solid"`/`appearance="primary"` color
  alone.
- First/Prev/Next/Last are `button[kuiIconButton]` with a required `aria-label`, no visible text.
- The ellipsis is `<span aria-hidden="true">`, excluded from both the accessibility tree and the
  tab order -- it is never a button.
- Range boundaries use the native `disabled` attribute on First/Prev (`currentPage === 1`) and
  Next/Last (`currentPage === totalPages`), which removes them from tab order, not just dims them.
- The `variant="full"` summary is `aria-live="polite"`, announcing the changed range without
  interrupting the user.
- Focus-visible is `Button`/`IconButton`'s own native focus ring -- nothing custom.
- There is no roving-tabindex/arrow-key navigation between controls -- every researched kit
  (PrimeNG, MUI, HeroUI) treats pagination as a set of independent buttons in normal tab order, not
  a single composite widget like a listbox, so arrow keys are never intercepted here either.

| Key               | Action                                                                                                           |
| ----------------- | ---------------------------------------------------------------------------------------------------------------- |
| `Tab`/`Shift+Tab` | Moves between every non-disabled control in visual order (First → Prev → numbers → Next → Last → rows-per-page). |
| `Enter`/`Space`   | Activates the focused page/step button.                                                                          |

## CSS custom properties

| Token                                          | Default (per `size`)                 | Description                                                          |
| ---------------------------------------------- | ------------------------------------ | -------------------------------------------------------------------- |
| `--kui-pagination-gap`                         | `--kui-space-1`                      | Gap between all controls in `nav`.                                   |
| `--kui-pagination-summary-gap`                 | `--kui-space-3`                      | Gap between the summary row and the controls row.                    |
| `--kui-pagination-ellipsis-color`              | `--kui-color-text-secondary`         | Color of the ellipsis and secondary text ("Rows per page", summary). |
| `--kui-pagination-page-min-size-{xs,sm,md,lg}` | `--kui-control-height-{xs,sm,md,lg}` | Forces page-number buttons into a uniform square cell.               |
| `--kui-pagination-page-size-width`             | `76px`                               | Fixed width of the rows-per-page picker.                             |

## Known gaps

- No jump-to-page input (a number field to type a page directly) -- present in some researched
  kits (e.g. PrimeNG's Paginator), intentionally left out until product asks for it; easy to add
  next to the group with `NumberInput` when needed.
- The ellipsis is static and non-interactive, unlike some kits' hover-to-jump affordance (e.g. Ant
  Design desktop) -- an intentional scope decision, not a defect.
- The rows-per-page `input[kuiSelect]` sits inside a label-less `kui-field` (an `aria-label` is set
  directly on the input); `KuiDropdownComponent` does not derive an accessible name for the
  listbox panel from an `<input>` anchor (by design -- normally `kui-field`'s own `<label>` covers
  that), so the open listbox panel itself carries no separate `aria-label`. Accepted, matching the
  existing `input[kuiSelect]` pattern.
- `/pagination` has been reviewed in the browser at desktop width in both light and dark theme with
  no console errors, and is covered by the automated document-overflow check at 320/390/768/1440px;
  committed visual regression baselines and a formal assistive-technology review are not yet run.

<!-- color-tokens:begin -->

## Color Tokens

Set any of these on the component or an ancestor to restyle one part. Each token is optional: when it
is not set, the part uses the semantic role in the Default column.

| Token                                 | Default            | Controls           |
| ------------------------------------- | ------------------ | ------------------ |
| `--kui-pagination-simple-label-color` | `--kui-color-text` | Simple label color |

<!-- color-tokens:end -->

<!-- geometry-tokens:begin -->

## Geometry Tokens

Set any of these on the component or an ancestor to restyle one part. Each token is optional: when it
is not set, the part uses the scale token in the Default column.

| Token                                          | Default              | Controls                     |
| ---------------------------------------------- | -------------------- | ---------------------------- |
| `--kui-pagination-summary-font-size`           | `--kui-text-xs-size` | Summary font size            |
| `--kui-pagination-ellipsis-font-size`          | `--kui-text-sm-size` | Ellipsis font size           |
| `--kui-pagination-simple-label-font-size`      | `--kui-text-sm-size` | Simple label font size       |
| `--kui-pagination-simple-label-padding-inline` | `--kui-space-2`      | Simple label padding, inline |
| `--kui-pagination-page-size-gap`               | `--kui-space-2`      | Page size gap                |
| `--kui-pagination-page-size-label-font-size`   | `--kui-text-xs-size` | Page size label font size    |

<!-- geometry-tokens:end -->

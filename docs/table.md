# Table

`kuiTable` is a directive-based compound primitive for native data tables. It
provides sort state, row selection, and sticky column/header coordination through
a shared DI context while preserving table semantics.

## Import

```ts
import {
  KuiCell,
  KuiRow,
  KuiSelectCell,
  KuiSelectTh,
  KuiTable,
  KuiTh,
  KuiThGroup,
} from '@kikita-labs/ui';
```

## Usage

```html
<table kuiTable [data]="rows" #table="kuiTable">
  <thead>
    <tr kuiThGroup>
      <th kuiSelectTh ariaLabel="Select all rows"></th>
      <th kuiTh sortKey="name">Name</th>
      <th kuiTh sortKey="status">Status</th>
      <th kuiTh>Actions</th>
    </tr>
  </thead>
  <tbody>
    @for (row of table.sortedData(); track row.id) {
    <tr kuiRow [value]="row">
      <td kuiSelectCell [ariaLabel]="'Select ' + row.name"></td>
      <td kuiCell>{{ row.name }}</td>
      <td kuiCell>{{ row.status }}</td>
      <td kuiCell>...</td>
    </tr>
    }
  </tbody>
</table>
```

## Inputs: `table[kuiTable]`

| Input  | Type                           | Default | Description                         |
| ------ | ------------------------------ | ------- | ----------------------------------- |
| `data` | `T[]`                          | `[]`    | Source rows for sorting/selection.  |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg'` | `'md'`  | Table density and typography scale. |

## Inputs: `th[kuiTh]`

| Input        | Type                     | Default | Description                                                   |
| ------------ | ------------------------ | ------- | ------------------------------------------------------------- |
| `sortKey`    | `string \| undefined`    | -       | Enables sort for this column; usually matches a row property. |
| `comparator` | `(a: T, b: T) => number` | -       | Custom sort function for the column.                          |
| `sticky`     | `boolean`                | `false` | Pins this header cell to the left with `position: sticky`.    |

Sortable headers render a native `<button type="button">` inside the `<th>`.
The `<th>` owns `aria-sort`; the button owns the keyboard and click interaction.

## Inputs: `tr[kuiRow]`

| Input   | Type             | Description                                                                              |
| ------- | ---------------- | ---------------------------------------------------------------------------------------- |
| `value` | `T \| undefined` | Data object used for selected state. Omit it for a presentational row without selection. |

## Sort

Clicking a sortable header cycles through `asc`, `desc`, and clear. Active sort
state is available on the directive as `sortState: Signal<KuiSortState>`, where
`null` means no active sort. Sorted rows are exposed as `sortedData:
Signal<T[]>`.

When `(sortChange)` is not observed, `kuiTable` sorts `data` locally. When
`(sortChange)` is observed, `kuiTable` emits sort state and leaves row ordering
to the parent. The clear state emits `null`.

## Selection

`th[kuiSelectTh]` renders a native checkbox for select-all / indeterminate
state. `td[kuiSelectCell]` renders a native checkbox for each row. Selected
values are tracked internally; `isSelected(value)` returns `boolean`.

The selection column appears only when `(selectionChange)` is observed.

The selection checkboxes are named by the `table.selectRow` and `table.selectAllRows` messages (`Select row`, `Select all rows`) and the sort buttons by `sortAscending`, `sortDescending` and `clearSort`. Use `ariaLabel` on selection cells when the row has a human-readable name:

```html
<th kuiSelectTh ariaLabel="Select all users"></th>
<td kuiSelectCell [ariaLabel]="'Select ' + row.name"></td>
```

## Sticky

Add `sticky` to `th[kuiTh]` to pin the header column. Add `sticky` to `td[kuiCell]`
on matching body cells.

## Provider Defaults

Set `defaults.table` once for the application or for a subtree:

```ts
// app.config.ts
provideKikitaUi({
  defaults: {
    table: {
      /* options below */
    },
  },
});

// a component, route or environment injector
providers: [
  provideKuiDefaults({
    table: {
      /* options below */
    },
  }),
];
```

| Option | Values                         | Description                                                       |
| ------ | ------------------------------ | ----------------------------------------------------------------- |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg'` | Component size. Takes precedence over the global `defaults.size`. |

Each option resolves as `local input > defaults.table.<option> > built-in default`. See [DI defaults](di-defaults.md).

## Accessibility

- Keep real `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, and `<td>` markup.
- Sortable headers keep `aria-sort` on `<th>` and expose the action through a
  native button.
- Selection uses native checkboxes with accessible labels.
- Add a native `<caption>` in product tables when the surrounding page does not
  already provide a clear table title.
- Avoid putting complex interactive widgets inside cells unless their focus
  order and labels are explicitly tested.

## CSS Variables

- `--kui-table-font-size`
- `--kui-table-th-py`
- `--kui-table-cell-px`
- `--kui-table-row-py`
- `--kui-table-th-fg`
- `--kui-table-th-bg`
- `--kui-table-border`
- `--kui-table-row-border`
- `--kui-table-row-hover-bg`
- `--kui-table-row-selected-bg`
- `--kui-table-row-selected-accent`
- `--kui-table-sort-active-color`
- `--kui-table-bg`

<!-- color-tokens:begin -->

## Color Tokens

Set any of these on the component or an ancestor to restyle one part. Each token is optional: when it
is not set, the part uses the semantic role in the Default column.

| Token                                           | Default                         | Controls                           |
| ----------------------------------------------- | ------------------------------- | ---------------------------------- |
| `--kui-table-color`                             | `--kui-color-text`              | Color                              |
| `--kui-table-sort-color-hover`                  | `--kui-color-text`              | Sort color, hover                  |
| `--kui-table-checkbox-border`                   | `--kui-color-border-control`    | Checkbox border color              |
| `--kui-table-checkbox-border-hover`             | `--kui-color-primary-indicator` | Checkbox border color, hover       |
| `--kui-table-checkbox-bg-checked`               | `--kui-color-primary-fill`      | Checkbox background, checked       |
| `--kui-table-checkbox-border-checked`           | `--kui-color-primary-indicator` | Checkbox border color, checked     |
| `--kui-table-checkbox-mark-color`               | `--kui-color-primary-on-fill`   | Checkbox mark color                |
| `--kui-table-checkbox-mark-color-indeterminate` | `--kui-color-primary-on-fill`   | Checkbox mark color, indeterminate |
| `--kui-table-sort-focus-ring-color`             | `--kui-color-focus`             | Sort focus ring color              |
| `--kui-table-checkbox-focus-ring-color`         | `--kui-color-focus`             | Checkbox focus ring color          |

<!-- color-tokens:end -->

<!-- geometry-tokens:begin -->

## Geometry Tokens

Set any of these on the component or an ancestor to restyle one part. Each token is optional: when it
is not set, the part uses the scale token in the Default column.

| Token                                | Default               | Controls                     |
| ------------------------------------ | --------------------- | ---------------------------- |
| `--kui-table-th-sort-button-radius`  | `--kui-radius-xs`     | Th sort button corner radius |
| `--kui-table-th-sort-icon-font-size` | `--kui-text-2xs-size` | Th sort icon font size       |

<!-- geometry-tokens:end -->

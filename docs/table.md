# Table

`kuiTable` is a directive-based compound primitive for data tables. It provides sort state, row selection, and sticky column/header coordination through a shared DI context.

## Import

```ts
import {
  KuiTableDirective,
  KuiThGroupDirective,
  KuiThDirective,
  KuiRowDirective,
  KuiCellDirective,
  KuiSelectThComponent,
  KuiSelectCellComponent,
} from '@kikita-labs/ui';
```

## Usage

```html
<table kuiTable [data]="rows">
  <thead>
    <tr>
      <th kuiSelectTh></th>
      <th kuiTh sortKey="name">Name</th>
      <th kuiTh sortKey="status">Status</th>
      <th kuiTh>Actions</th>
    </tr>
  </thead>
  <tbody>
    @for (row of table.sortedData(); track row.id) {
      <tr kuiRow [value]="row">
        <td kuiSelectCell></td>
        <td kuiCell>{{ row.name }}</td>
        <td kuiCell>{{ row.status }}</td>
        <td kuiCell>…</td>
      </tr>
    }
  </tbody>
</table>
```

Access the directive instance via a template reference to read computed state:

```html
<table kuiTable [data]="rows" #table="kuiTable">
```

## Inputs — `table[kuiTable]`

- `data`: `T[]` — source rows (default: `[]`)
- `size`: `xs | sm | md | lg` (default: `md`)

## Inputs — `[kuiTh]`

- `sortKey`: `string` — enables sort on this column; must match a key of the row type
- `comparator`: custom sort function `(a: T, b: T) => number`
- `sticky`: `boolean` — pins column to the left with `position: sticky`

## Inputs — `[kuiRow]`

- `value` (required): `T` — the data object for this row

## Sort

Clicking a sortable header cycles through `asc → desc → (clear)`. Active sort state is available on the directive as `sortState: Signal<KuiSortState | null>`. Sorted rows are exposed as `sortedData: Signal<T[]>`.

## Selection

`kuiSelectTh` renders a header checkbox (select all / indeterminate). `kuiSelectCell` renders a per-row checkbox. Selected values are tracked internally; `isSelected(value)` returns `boolean`.

## Sticky

Add `sticky` to `[kuiTh]` to pin the column. Add `sticky` to `[kuiCell]` on matching body cells.

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

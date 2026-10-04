# Table Example Inventory

`table[kuiTable]` decorates native table markup with size, sorting, and selection behavior. This page
keeps one small seeded data set across six labelled examples so the default stays minimal while the
size and behavior differences remain easy to compare.

| Public input or output                                                         | Source contract                                                                                                                                                                                             | Visible coverage                                                                                                                                                                                   |
| ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data: T[]` on `table[kuiTable]`                                               | Defaults to `[]`; input rows are retained in their given order unless local sorting applies.                                                                                                                | The populated examples use stable member records; the default example also shows the header-only result when `data` is omitted.                                                                    |
| `size: KuiSize \| undefined` on `table[kuiTable]`                              | An unset value resolves as local input, then root default, then `md`. The playground root has no configured size override, so the default resolves to `md`.                                                 | The minimal default asserts `data-kui-size="md"`; a compact matrix shows `xs`, `sm`, `md`, and `lg`.                                                                                               |
| `sortKey: string \| undefined` on `th[kuiTh]`                                  | Unset by default; a defined key adds a native sort button and `aria-sort` state to the `<th>`.                                                                                                              | The email and score headers exercise default string and number sorting; status uses the custom comparator.                                                                                         |
| `comparator: ((a: unknown, b: unknown) => number) \| undefined` on `th[kuiTh]` | Optional. It receives full row values at runtime; the source input uses `unknown` parameters.                                                                                                               | The status header compares the row's stable `statusRank` values using an explicit type guard.                                                                                                      |
| `sticky: boolean` on `th[kuiTh]`                                               | Defaults to `false`; pins that header cell on the inline axis when the matching style is enabled.                                                                                                           | Omitted: individual sticky columns are not needed to demonstrate the accepted sticky-header behavior.                                                                                              |
| `sticky: boolean` on `tr[kuiThGroup]`                                          | Defaults to `false`; the group applies sticky positioning to its header cells on the block axis.                                                                                                            | The sticky-header example scrolls a bounded region, verifies the header remains at its top, and uses its long email column to exercise local horizontal scrolling at phone width.                  |
| `value: unknown \| undefined` on `tr[kuiRow]`                                  | Optional. The value participates in selection by object identity; omission is allowed for a presentational row.                                                                                             | Data rows provide their matching member record. An empty/presentational row is not needed for this page.                                                                                           |
| `ariaLabel: string` on `th[kuiSelectTh]`                                       | Defaults to the English string `Select all rows`. Its native checkbox renders when `selectionChange` is observed.                                                                                           | The translated example overrides this default; the default-label example omits it and E2E verifies that it stays English in Russian.                                                               |
| `ariaLabel: string` on `td[kuiSelectCell]`                                     | Defaults to the English string `Select row`. Its native row checkbox renders when `selectionChange` is observed.                                                                                            | The translated example overrides this default with each member name; the default-label example omits it and E2E verifies that it stays English in Russian.                                         |
| No inputs on `td[kuiCell]`                                                     | Adds the cell class; there is no public sticky input or output.                                                                                                                                             | Used for ordinary data cells. Sticky body cells are omitted (see contract discrepancies below).                                                                                                    |
| `selectionChange: T[]` on `table[kuiTable]`                                    | Observing this output enables the header and row checkboxes; it emits selected row values after each change. Selected rows remain internal Table state; the consumer mirrors emitted values for its status. | The listener is present initially, so the main example's six checkboxes render unchecked. Keyboard interaction progresses through one row (indeterminate header), all rows, and cleared selection. |
| `sortChange: KuiSortState` on `table[kuiTable]`                                | Cycles `null → { key, direction: 'asc' } → { key, direction: 'desc' } → null`. If observed, the parent owns row ordering.                                                                                   | One local example uses `sortedData()` without a listener; another observes the output and reorders its own `data`.                                                                                 |

The public directive also exposes `sortState`, `sortedData`, `isSelected`, and the selection helpers used
by its child controls. `sortedData()` returns the input rows when no sort is active, or when the parent
observes `sortChange`; otherwise it sorts a copy. The native sort button stays in the tab order and
supports the browser's Enter/Space activation. The `<th>` reports `aria-sort="none"`, `ascending`, or
`descending`; this is a native table interaction, not an ARIA grid, so arrow-key row navigation is not
added. Selection uses native checkboxes, including their `checked` and `indeterminate` states, and
each table includes a native caption. Scrollable example regions are named and keyboard-focusable.
At phone width, the selection and sticky-header first viewports intentionally show only the columns
that fit; a localized hint explains swipe and arrow-key scrolling. Their named regions keep the
horizontal overflow local, and E2E verifies `ArrowRight` scrolls each focused region without making
the document wider than the viewport.

The seeded member order is Priya, Tomas, Noor, Liam, Ava. Email ascending with the default string
comparator is Ava, Liam, Noor, Priya, Tomas; score ascending is Liam, Noor, Tomas, Priya, Ava. Scores
and selection counts use Angular's locale-aware number pipe. The status comparator sorts by rank
(active, invited, suspended) and preserves source order among equal ranks: Noor, Ava, Tomas, Liam,
Priya. Output summaries and member labels derive from the same locale data.

The empty-data example omits `[data]`, so the directive's `data = input<T[]>([])` default applies.
Table decorates native markup and does not render an empty-state message: `sortedData()` returns the
empty source array when no sort is active. The direct source contract is in
`kui-table.directive.ts`; the page E2E asserts one header row and zero body rows. Empty-state content
is intentionally omitted because it is consumer-owned content rather than a Table input or output.

Selection uses object identity: `isSelected` delegates to `Set.has`, and selection helpers add the row
objects themselves to that set. The page keeps seeded object references stable and does not simulate
replacing them with new objects; Table exposes no key or track-by input that could promise selection
persistence across refreshed records. Existing unit coverage selects the same row object; page E2E
checks selected styling and checkbox state for those stable rows.

The sort action words `Sort` and `Clear` are English literals in `KuiTh`; it moves the header's
current child nodes into a generated button and captures that initial column text for its accessible
label. Because the directive reparents the translated content after Angular creates it, sortable column
headings also remain in their initial language after a runtime locale switch. The Russian E2E verifies
that a non-sortable heading translates while a sortable `Score` heading and its generated `Sort Score`
action remain English. The ordinary selection example supplies translated labels; a separate example
omits both inputs and E2E confirms their English defaults remain English in the Russian locale.

## Contract discrepancies and boundaries

- `docs/table.md` describes `sticky` on matching `td[kuiCell]` cells and `table.css` contains a
  `.kui-cell--sticky` rule, but `KuiCell` has no sticky input or host binding. The class is not
  applied by the public directive. This page deliberately omits sticky body cells and does not add a
  class-based workaround.
- `docs/table.md` types the comparator as `(a: T, b: T) => number`; `th[kuiTh]` actually declares
  `((a: unknown, b: unknown) => number) | undefined`. The demo comparator therefore accepts
  `unknown` and narrows before reading row data.
- The page source JSDoc and `docs/table.md` allow an omitted row value for a presentational row, and
  the directive input is `unknown | undefined`. The generated/MCP-facing Table page describes the
  `value` input as required. This page uses values on every data row and does not claim requiredness.
- `KuiTh` moves sortable header child nodes into a generated button and stores its initial
  column text for the generated accessible label. The heading and generated action therefore retain
  the initial column text across a runtime locale change; the action verbs `Sort` and `Clear` are
  hard-coded in English. The Russian locale test verifies that non-sortable page copy translates while
  sortable heading text and action labels remain English.
- The default `ariaLabel` strings on both selection components are English. The primary localized
  example overrides them; a second example intentionally omits them and the Russian locale test
  asserts the defaults remain English.
- No Table-specific design-provenance record exists in `docs/design-provenance.md`. This page uses
  the library Table styles as shipped and adds only layout, wrapping, and scroll-region styles.
- The selection checkbox is styled at 15×15 CSS pixels (`projects/ui/src/lib/components/table/kui-table.css`), below
  the playground's 44×44px touch-target guidance. The sort button has `min-height: 1.5em` and
  inherits the 10px table-header font, giving it a 15px minimum height; it also falls below that
  guidance. The page does not alter shipped component visuals, so both small targets remain
  component-level accessibility caveats.

Filtering, pagination, virtualization, loading, custom empty-state content, disabled-row, row-click, and editable
table behaviors are not Table inputs or outputs. They are omitted; pagination is a separate component.
Hover styling exists for rows, but hover is not made a catalogue variant. No focus or pressed state is
faked with page CSS. The page contains no random or time-dependent content.

## Source references

- Public contract and examples: `docs/table.md` (inputs, sorting, selection, sticky notes, and native
  table accessibility guidance).
- Runtime inputs, outputs, sorting, and size resolution:
  `projects/ui/src/lib/components/table/kui-table.directive.ts` and
  `projects/ui/src/lib/providers/kui-defaults.util.ts`.
- Sort button creation, state labels, `aria-sort`, and comparator typing:
  `projects/ui/src/lib/components/table/kui-th.directive.ts`.
- Sticky header input: `projects/ui/src/lib/components/table/kui-th-group.directive.ts`.
- Optional row value and cell capabilities:
  `projects/ui/src/lib/components/table/kui-row.directive.ts` and
  `projects/ui/src/lib/components/table/kui-cell.directive.ts`.
- Native selection controls and defaults:
  `projects/ui/src/lib/components/table/kui-select-th.component.ts` and
  `projects/ui/src/lib/components/table/kui-select-cell.component.ts`.
- Sticky rules, size tokens, and checkbox dimensions:
  `projects/ui/src/lib/components/table/kui-table.css`.
- Existing behavioral coverage: `projects/ui/src/lib/components/table/kui-table.directive.spec.ts`.
- Touch target guidance: `projects/kikita-ui-playground/.agents/accessibility.md`.
- Design record inventory: `docs/design-provenance.md` (there is no Table-specific entry).

The visual E2E spec covers the page at 1440×1000, 768×1024, and 320×844. It checks server markup and
hydration, populated and default-empty tables, the minimally configured `md` default, every size,
default string and number sorting, parent-controlled sorting, the custom comparator, keyboard focus,
keyboard sorting and selection transitions, default English selection labels, controlled descending
and cleared states, sticky-header scroll ownership, locale scope loading, and document-level horizontal
overflow. At phone width, selection and sticky-header screenshots isolate their intentional first
viewport column crops, show the localized scroll hint, and verify region-local `ArrowRight` scrolling.
It declares deterministic screenshots for each named catalogue group and relevant focus,
sort, selection, and sticky states. On 2026-09-28, the parent-owned fresh production build and
focused Table browser suite passed 9/9. The parent reviewed the default desktop/320px captures, all
four sizes, sorting, selection/focus, and sticky-header default/scrolled/mobile captures; no page
clipping appeared, and horizontal scrolling remained inside the named mobile region. The shared
SSR/adaptive route suite passed 2/2 across 43 routes.

## Self-review checklist

- [x] The minimally configured default and all four supported sizes are represented.
- [x] The default empty `data` input is shown as a header-only native table with no body rows.
- [x] Local string and number sorting, parent-controlled sorting, and a custom comparator map to real consumer behavior.
- [x] Selection visibility, single-row selection, indeterminate select-all, all-selected, and cleared states are mapped to native checkbox interaction.
- [x] English selection-label defaults and English sort action labels are explicit and checked after the Russian locale switch.
- [x] Selection-by-object-identity behavior and the reason refreshed-object behavior is omitted are documented against source and tests.
- [x] Sticky-header behavior uses `kuiThGroup sticky`; unsupported sticky body cells are explicitly omitted.
- [x] Phone-width selection and sticky-header captures show the localized horizontal-scroll hint; E2E confirms focused arrow-key scrolling stays inside each named region without document overflow.
- [x] Inputs, outputs, defaults/resolution, semantics, keyboard behavior, accessibility, responsive scroll regions, and SSR/hydration are accounted for.
- [x] Source/docs discrepancies, English-only generated sort action phrases, and the missing design-provenance record are recorded.
- [x] Parent-owned fresh production build and focused Table browser suite passed 9/9; desktop/320px screenshots were reviewed, and shared SSR/adaptive checks passed 2/2 across 43 routes.

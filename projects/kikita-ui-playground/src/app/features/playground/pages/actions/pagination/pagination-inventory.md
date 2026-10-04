# Pagination Contract Inventory

Status: audit accepted by the parent; page implemented and self-reviewed against the source after the
audit. This inventory maps the public `kui-pagination` contract to the page examples and browser checks.

`KuiPagination` (`kui-pagination`) is a composite component: it renders a `nav` landmark
that composes `button[kuiIconButton]` (First/Previous/Next/Last), `button[kuiButton]` (page numbers),
a static ellipsis `span`, and `input[kuiSelect]` inside a label-less `kui-field` (rows per page). It
owns only the page-window algorithm and the coordinated `currentPage`/`pageSize` state. It is not a
form control (no `FormValueControl`, never placed inside `kui-field`). The consumer owns data
slicing.

## Public inputs, models, and outputs

| Member              | Type, default, and resolution                                                                                                                                                                                                                                                           | Planned coverage                                                                                                                                                                                         |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `variant`           | `KuiPaginationVariant` (`'full' \| 'compact' \| 'simple'`); `input('compact')`. Written to `data-kui-variant` on the host. `compact` = First/Prev/numbers/Next/Last; `simple` = Prev + "Page X of Y" + Next; `full` = compact + summary + rows-per-page.                                | Default example omits it (resolves to `compact`). Variant group renders all three explicitly. Browser checks assert `data-kui-variant`.                                                                  |
| `size`              | `KuiSize \| undefined`; `input<KuiSize \| undefined>()`. Resolution: local input, then Kikita UI root size default (`injectKuiRootSizeDefault`), then `md`. Written to `data-kui-size` on the host and passed to every child control.                                                   | Default omits it (resolves to `md`). Size group renders `xs`, `sm`, `md`, `lg`. Root-provider size is omitted: the Playground app configures no root size default (`provideKikitaUi({ scrollbars })`).   |
| `totalPages`        | Required; `input.required<number, unknown>({ transform: positiveIntegerAttribute })`. `numberAttribute(value, 1)`; non-finite or `< 1` becomes `1`; fractional values are floored.                                                                                                      | Every example sets it. A static-attribute example (`totalPages="12"` strings) proves coercion. `totalPages` of `1` is shown in the boundary group. Invalid values (`0`, `abc`) are covered in one check. |
| `currentPage`       | `model(1)`, two-way (`[(currentPage)]`). The rendered page is `clampedCurrentPage` = `min(max(currentPage, 1), max(totalPages, 1))`; the model keeps an out-of-range value until a navigation writes a clamped one (`setPage` writes only if the clamped value differs from the model). | Two-way bound in every interactive example. One-way `[currentPage]` with `disabled` in the disabled group. Out-of-range bindings are not shown (not a documented supported state).                       |
| `siblingCount`      | `input(1, { transform: nonNegativeIntegerAttribute })`. `numberAttribute(value, 1)`, floored, `max(0, n)`; non-finite becomes `1`.                                                                                                                                                      | Window group: sibling `0`, `1` (default, omitted), `2` on `page 21 of 42`, plus keyboard/click movement of the window.                                                                                   |
| `boundaryCount`     | `input(1, { transform: nonNegativeIntegerAttribute })`. Same coercion as `siblingCount`.                                                                                                                                                                                                | Window group: boundary `0`, `1` (default, omitted), `2` on `page 21 of 42`.                                                                                                                              |
| `pageSize`          | `model(25)`, two-way (`[(pageSize)]`). Used only by `variant="full"` (summary math and the picker value). Picker change writes `pageSize` and `currentPage = 1` together.                                                                                                               | Rows-per-page scenario and the table consumer scenario.                                                                                                                                                  |
| `pageSizeOptions`   | `input<readonly number[]>([10, 25, 50, 100])`. Rendered as `kuiOption` items in the picker. Only used by `variant="full"`.                                                                                                                                                              | Default options in the rows-per-page scenario; custom `[5, 10, 20]` in the table scenario.                                                                                                               |
| `totalItems`        | `input<number \| undefined>()`. Summary total; falls back to `totalPages * pageSize` when omitted. Only used by `variant="full"`.                                                                                                                                                       | Explicit `289` in the rows-per-page scenario; omitted (fallback) in a second `full` example; `1284` in the table scenario.                                                                               |
| `disabled`          | `input(false, { transform: booleanAttribute })`. Applies the native `disabled` attribute to First/Prev/Next/Last, every page number button, and the picker input. Boundary disabling (`currentPage <= 1` for First/Prev, `>= totalPages` for Next/Last) is independent.                 | Disabled group renders `compact`, `simple`, and `full` with the boolean attribute. Boundary disabling is a separate group (first, last, single page).                                                    |
| `ariaLabel`         | `input('Pagination')`. Accessible name of the `nav` landmark.                                                                                                                                                                                                                           | Every example passes a translated, unique name so tests use `getByRole('navigation', { name })`. The English default is asserted in the default example by not passing it... see discrepancy 5.          |
| `currentPageChange` | Model output; emits on every `currentPage` write.                                                                                                                                                                                                                                       | The two-way scenarios; the rows-per-page scenario also binds `(currentPageChange)` and counts emissions in a status `output` to prove the reset emits.                                                   |
| `pageSizeChange`    | Model output; emits on every `pageSize` write.                                                                                                                                                                                                                                          | Same scenario counts `(pageSizeChange)` emissions.                                                                                                                                                       |

`KuiPaginationVariant` is the only public type. No providers, tokens, or services are exposed by the
component. `KuiSize` is the shared `xs | sm | md | lg` scale.

## Rendered structure and page-window behavior

Verified by running the component's `computePageWindow` (copied verbatim into a scratch script;
`S`/`E` are the start/end ellipsis slots):

| page / total | sibling | boundary | Rendered numbers              |
| ------------ | ------- | -------- | ----------------------------- |
| 1 / 42       | 1       | 1        | `1 2 3 4 5 E 42`              |
| 5 / 42       | 1       | 1        | `1 S 4 5 6 E 42`              |
| 21 / 42      | 1       | 1        | `1 S 20 21 22 E 42`           |
| 42 / 42      | 1       | 1        | `1 S 38 39 40 41 42`          |
| 21 / 42      | 2       | 1        | `1 S 19 20 21 22 23 E 42`     |
| 21 / 42      | 0       | 1        | `1 S 21 E 42`                 |
| 21 / 42      | 1       | 0        | `S 20 21 22 E`                |
| 21 / 42      | 1       | 2        | `1 2 S 20 21 22 E 41 42`      |
| 21 / 42      | 0       | 0        | `S 21 E`                      |
| 1 / 1        | 1       | 1        | `1`                           |
| 1 / 3        | 1       | 1        | `1 2 3`                       |
| 4 / 7        | 1       | 1        | `1 2 3 4 5 6 7` (no ellipsis) |
| 5 / 12       | 1       | 1        | `1 S 4 5 6 E 12`              |
| 1 / 12       | 1       | 1        | `1 2 3 4 5 E 12`              |
| 12 / 12      | 1       | 1        | `1 S 8 9 10 11 12`            |

The window keeps a constant slot count while the current page moves (7 slots at sibling 1/boundary 1)
and an ellipsis only replaces a gap of two or more pages.

## States and behaviors

| State or behavior                                                                                                                              | Source                                                     | Planned example or check                                                                                                                          |
| ---------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Current page: `shape="solid" appearance="primary"`, `aria-current="page"`, `aria-label="Page N, current"`; others ghost, `aria-label="Page N"` | Component template, `pages` computed, unit spec            | Default example and every catalogue group; browser check asserts names, `aria-current`, and `data-kui-shape`.                                     |
| First/Previous disabled on page 1; Next/Last disabled on last page (native `disabled`, out of tab order)                                       | `firstDisabled`, `lastDisabled` computeds, unit spec       | Boundary group: `1 of 12`, `12 of 12`, `1 of 1`; asserts `toBeDisabled` and that Tab skips them.                                                  |
| Step buttons: First, Previous, Next, Last; page number click; clamp inside `[1, totalPages]`                                                   | `goFirst/goPrev/goNext/goLast/setPage`                     | Interactive default example: click each control, assert current page.                                                                             |
| Ellipsis is a static `span[aria-hidden]`, never a button, not focusable                                                                        | Template, CSS (`pointer-events: none`)                     | Window group; asserts ellipsis has no role and is not in the tab order (`Tab` never lands on it).                                                 |
| `simple` variant: Prev, "Page X of Y", Next; no numbers, no First/Last                                                                         | `showSimple`, `showEnds`, `showNumbers`                    | Variant group; label text and button count asserted. Label is library-owned English.                                                              |
| `full` variant: `aria-live="polite"` summary "Showing X–Y of Z" and rows-per-page picker                                                       | `summaryText`, `showSummary`, `showPageSize`               | Rows-per-page group; asserts summary text at first, middle, and last (partial) pages.                                                             |
| Rows-per-page change writes `pageSize` and resets `currentPage` to `1` in one update                                                           | `onPageSizeChange`, unit spec                              | Before/after interaction: go to page 5, choose `50` from the listbox, assert page 1 and summary `Showing 1–50 of 289`; emit counters.             |
| Summary fallback total = `totalPages * pageSize` when `totalItems` omitted                                                                     | `summaryText`                                              | Second `full` example without `totalItems` (`12 * 25 = 300`).                                                                                     |
| Summary last page is clamped to total (`min(page * size, total)`); empty total shows `0–0`                                                     | `summaryText`                                              | Last-page summary (`Showing 276–289 of 289` at page 12 of 12, size 25) asserted; `totalItems = 0` omitted, see omissions.                         |
| `disabled` applies natively to every control including the picker                                                                              | Template `[disabled]` bindings; Select `[attr.disabled]`   | Disabled group; asserts every `button` and the picker combobox `toBeDisabled` and that Tab skips the nav.                                         |
| Size scale changes button, icon-button, ellipsis, and picker geometry                                                                          | `effectiveSize`, `pagination.css` page-min-size tokens     | Size group; asserts host `data-kui-size` and measured control heights against the `--kui-control-height-*` tokens.                                |
| Keyboard: normal tab order First → Prev → numbers → Next → Last → picker; Enter and Space activate; arrow keys are not intercepted             | Docs Accessibility table; no key handlers in the component | Keyboard behavior test on the default and full examples with real key presses.                                                                    |
| Focus-visible is the Button/IconButton native ring                                                                                             | Docs, primitives                                           | Real Tab focus screenshot on a page number button (not simulated).                                                                                |
| Nav landmark name via `ariaLabel`; library step labels are English literals                                                                    | Template                                                   | Unique translated nav names per example (EN/RU); step labels stay English in RU, asserted.                                                        |
| Consumer composition beside `table[kuiTable]` (page slice from `currentPage`/`pageSize`)                                                       | Docs "Usage with `kui-table`"                              | Table scenario with 1284 seeded rows, page sizes 5/10/20, translated status with locale-formatted numbers.                                        |
| EN/RU switching                                                                                                                                | Playground shell Transloco                                 | Page-owned text (headings, group names, nav names, row labels, status) switches; library strings stay English; numbers use locale grouping.       |
| Focus after activating the last remaining forward step                                                                                         | Behavior observation (to measure)                          | Keyboard Enter on Next at page 9 of 10: focus falls to `body` (reproduced). Covered by a `test.fixme` that asserts focus stays in the navigation. |

## Edge cases

- `currentPage` outside `[1, totalPages]`: rendering clamps defensively and the bound model keeps the raw
  value until a navigation writes a clamped one. Recorded only; the page shows no out-of-range example
  because the docs do not present it as a supported state.
- `totalPages` invalid (`0`, `-3`, `abc`, `2.9`) coerces to `1`, `1`, `1`, `2`; recorded only (library
  coercion; no page example passes invalid values).
- `siblingCount`/`boundaryCount` `0` are valid and shown; negative or non-numeric values coerce to `0`/`1`
  (only `0` and valid values are shown; negative coercion is covered by the library unit spec gap, see
  discrepancies).
- `totalPages = 1`: page `1` only, all four step controls disabled.
- Two-way models: a parent that shrinks `totalPages` (rows-per-page increase) relies on the reset to
  page 1; a parent that changes `totalPages` without resetting `currentPage` is handled only by display
  clamping.
- `pageSize` not present in `pageSizeOptions`: the picker `value` binding has no matching option. Not
  shown, because the component does not document a resolved label for it; the table scenario keeps the
  seeded size inside its options (`10` in `[5, 10, 20]`).
- `totalItems` inconsistent with `totalPages * pageSize` (fewer items than the page offset): the summary
  can read "Showing 276–100 of 100". It is a consumer contract violation, not shown.
- `totalItems = 0`: summary `Showing 0–0 of 0` with `totalPages` still at least `1`. Omitted from the page
  as a contract-violating combination (a consumer with no rows would not render pagination); recorded here.

## Source audit

- Docs: [docs/pagination.md](../../../../../../../../../docs/pagination.md), plus the Pagination rows in
  `docs/state-coverage.md` and `docs/browser-test-coverage.md`.
- Implementation: `projects/ui/src/lib/components/pagination/kui-pagination.component.ts` (template,
  inputs, models, `computePageWindow`, summary math) and `kui-pagination-variant.type.ts`; coercion
  helper `projects/ui/src/lib/utils/kui-input-transform.util.ts`; root size default
  `projects/ui/src/lib/providers/kui-defaults.util.ts`.
- Styles: `projects/ui/src/lib/components/pagination/kui-pagination.css` (tokens `--kui-pagination-*`, per-size square page
  buttons, ellipsis geometry, fixed-width picker).
- Unit tests: `kui-pagination.component.spec.ts` (11 specs: landmark name, current page marking, inline
  SVG chrome, ellipsis count, click, boundary disabling, jump controls, simple variant, full summary,
  rows-per-page reset, disabled, static-attribute coercion).
- Legacy scenarios only (not modified): `projects/playground/src/app/pages/pagination/` (default,
  variants table, sizes table, full, simple, disabled, with `kui-table`).

## Discrepancies and observations

1. Docs and JSDoc mention the summary as an `aria-live="polite"` "Showing X-Y of Z" string; the
   implementation renders an en dash (`Showing 1–25 of 289`). Tests must use the en dash.
2. The summary, "Rows per page", "Page X of Y", and First/Previous/Next/Last/Page N labels are English
   template literals with no input, token, or locale hook. Only `ariaLabel` is configurable. The page
   cannot localize them, so RU pages show English library text (as other pages record). The summary
   also prints plain unformatted integers (`1284`, not `1,284` or `1 284`), so locale-formatted numbers
   can be shown only in page-owned text, not inside the library summary. Recorded as a library gap, not
   fixed.
3. The docs state the ellipsis is `aria-hidden` and non-interactive; CSS also sets `pointer-events: none`
   and `user-select: none`. Consistent.
4. Docs describe `siblingCount`/`boundaryCount` coercion for "static numeric values"; the transforms
   apply to every binding (including signals), not only static attributes. Consistent with tests, wider
   than the wording.
5. The English default `ariaLabel` (`Pagination`) is only observable when the input is omitted. The default
   example does not pass it so that the actual default is visible and asserted; every other example passes
   a unique name because several landmarks with the same name on one page are ambiguous for assistive
   technology.
6. Unit tests do not cover: window sizes other than `compact` defaults (only ellipsis count), out-of-range
   `currentPage` clamping, `pageSizeChange`/`currentPageChange` emissions, summary on the last partial
   page, `totalItems` fallback, `simple` variant navigation, sizes, negative `siblingCount`/`boundaryCount`.
   The page checks add browser-level assertions for these behaviors without changing the library.
7. The docs' "Known gaps" say no committed visual baselines exist; this page adds them.
8. Docs list `Tab`/`Shift+Tab` and `Enter`/`Space` only; consistent with the absence of key handlers.

Library defect confirmed on this page (not fixed, reproducing test kept as `test.fixme`):

- Focus loss after reaching the last (or first) page by keyboard: at page 9 of 10, focus Next and press
  Enter. The page becomes 10 and Next is disabled in the same update, so `document.activeElement`
  becomes `body`. A keyboard user loses their place; the same holds for Previous reaching page 1.

## Planned examples (groups)

Each group is a named `role="group"` inside an `app-playground-example-card`; page-private components
under `components/`:

1. Default: `<kui-pagination [totalPages]="10" [(currentPage)]="page">` with no other input.
2. Variants: `compact` (explicit), `simple`, `full` with `totalItems`.
3. Sizes: `xs`, `sm`, `md`, `lg` (compact, page 5 of 12).
4. Page window: sibling `0/1/2` (boundary 1) and boundary `0/1/2` (sibling 1), page 21 of 42, all
   interactive.
5. Range boundaries: `1 of 12`, `12 of 12`, `1 of 1`.
6. Rows per page and summary: `full` with `totalItems=289`, default options; second `full` example without
   `totalItems`; counters for both change outputs.
7. Disabled: `compact`, `simple`, `full`.
8. Table consumer: `table[kuiTable]` fed by a page slice of 1284 seeded rows, `full` pagination with
   `pageSizeOptions=[5, 10, 20]`, page-owned status text with locale-formatted numbers.

Planned files (all new, all under this page or the required registries): `pagination.ts/.html/.scss`,
`index.ts`, `pagination-inventory.md`, `components/` (three private components with barrels: a reusable labelled `pagination-example`, `pagination-rows-per-page`, `pagination-table`),
`constants/` (seeded table rows, size and window matrices), `interfaces/`, `helpers/` (row factory,
locale registration), `public/i18n/pagination/{en,ru}.json`, `e2e/pagination-playground.visual.spec.ts`
plus its snapshots. Registry single-line additions: `PlaygroundRoute.Pagination`, the sidebar entry, the
`actions.routes.ts` route, and `playground.components.pagination` in the root `en.json`/`ru.json`.

## Omissions

- Root-provider size default, provider precedence: not configured by this app; the resolved `md` default
  is shown instead.
- Dark theme, RTL: theme and direction come from the shell; not a Pagination-specific state.
- Hover and pressed states: not stated as Pagination contract; button hover and pressed belong to the
  Button and IconButton pages. Real focus-visible is captured.
- Touch-specific behavior: none in the component (plain click on `button`); no touch scenario.
- Timers, clocks: the component has no timers, so no clock control is needed.
- `pageSize` outside `pageSizeOptions`, inconsistent `totalItems`, and `totalItems = 0`: see edge cases.
- Jump-to-page input and hover-to-jump ellipsis: documented as intentionally unsupported.
- Out-of-range `currentPage`, invalid `totalPages`, and static string attributes: not shown (not presented
  as supported states).

## Self-review checklist

- [x] Parent review of the audit passed before implementation.
- [x] Minimal default and every catalogue group implemented; labels match runtime state.
- [x] EN and RU `pagination` catalogues contain matching key sets.
- [x] Desktop and 320px screenshots opened and inspected; states captured before interactions for 320px.
- [x] Locale numbers use `DecimalPipe` with the Transloco language mapped to an Angular locale id (`ru` registered), mirroring the Date Picker locale helper.

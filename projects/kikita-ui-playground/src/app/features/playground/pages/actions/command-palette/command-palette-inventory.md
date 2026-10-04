# Command Palette Page Inventory

This inventory is a retrospective source audit of the Command Palette page. It was cross-checked against `docs/command-palette.md`, `projects/ui/src/lib/components/command-palette/index.ts`, `kui-command-palette.component.ts` and its template, `kui-command-palette.types.ts`, `kui-command-palette.component.spec.ts`, `projects/ui/src/lib/components/command-palette/kui-command-palette.css`, the page's translated group helper/templates, and the page E2E spec.

## Public contract mapping

| Public API        | Type and default/resolution                                                                                                    | Page example or evidence                                                                                                                                                         |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `open` model      | Boolean, default `false`; generates `openChange`. Controls attachment of the CDK overlay and causes focus capture/restoration. | Each trigger changes its corresponding two-way `open` signal; E2E opens/closes all states through buttons, Enter, and Escape, and checks trigger focus restoration.              |
| `groups`          | `readonly KuiCommandGroup[]`, default `[]`.                                                                                    | The page supplies two translated groups with five deterministic commands; filtered, loading, and empty scenarios reuse the same data.                                            |
| `loading`         | Boolean, default `false`; renders skeleton rows and sets dialog `aria-busy="true"`.                                            | Loading example sets it to true; E2E checks `aria-busy`, screenshot, Escape close, and focus return.                                                                             |
| `placeholder`     | String, default `Type a command or search...`.                                                                                 | All page instances bind the page translation; E2E checks the live Russian placeholder.                                                                                           |
| `label`           | String, default `Command palette`; becomes the dialog and input accessible name.                                               | Page binds a translated label on every instance; E2E checks Russian dialog and combobox names and dialog semantics.                                                              |
| `emptyText`       | String, default `No commands found`; empty-state heading.                                                                      | Empty scenario supplies translated `No matching commands`; E2E checks the `status` content. The component's empty-state description remains hardcoded English, documented below. |
| `query` model     | String, default `''`; generates `queryChange`. Search term controls matching and active-descendant state.                      | Filtering and empty examples use two-way local signals seeded from translated fixed query strings. E2E checks filtering and clear-query behavior.                                |
| `selected` output | `OutputEmitterRef<KuiCommandItem>`, no default; emits the original item object and closes.                                     | Default scenario stores the emitted translated label in page status. E2E selects with keyboard and pointer in localized evidence and verifies status plus focus restoration.     |

`open`/`query` are Angular model inputs and provide generated `openChange`/`queryChange` outputs. The page binds both with two-way syntax. `selected` is the sole explicit output. There is no provider/default token on this primitive.

## Group and item contract mapping

`KuiCommandGroup` has optional `heading` and required `items`. `KuiCommandItem` requires stable `id` and `label`, and supports optional `description`, `meta`, `badge`, `shortcut`, `icon`, `danger`, `disabled`, and `keywords` (`kui-command-palette.types.ts`). The page's `create-command-groups.helper.ts` maps the complete item surface:

| Item data                | Concrete page item                                                                                                |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| `id`, `label`            | Every item has a stable English-domain ID and translated label; IDs stay the same when the shell switches locale. |
| `description`            | Projects and Components include translated supporting text.                                                       |
| `meta`                   | Export workspace includes translated Unavailable metadata.                                                        |
| `badge`                  | Create task includes the translated New badge.                                                                    |
| `shortcut`               | Projects, Components, and Create task include deterministic key arrays.                                           |
| `icon`                   | Create task includes the decorative `+` symbol.                                                                   |
| `danger`                 | Delete workspace is marked destructive.                                                                           |
| `disabled`               | Export workspace cannot be selected and is excluded from keyboard navigation.                                     |
| `keywords`               | Projects, Components, and Delete include translated extra search terms.                                           |
| Optional group `heading` | Navigation and Actions are translated group headings.                                                             |

All listed optional command fields are used in the page. A heading-less group is omitted because this catalogue is organized to compare named command categories; an empty `groups` array is omitted as a standalone page state because the dedicated no-match state is more useful and the source unit suite covers empty input behavior. Invalid/duplicate IDs are omitted from rendered page examples because they deliberately throw in development; the library unit suite covers both validation errors and stable identity across relabel/reorder/filter.

## State, accessibility, and responsive mapping

| State or behavior            | Evidence and reason for any omission                                                                                                                                                                                                                                                                                                         |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Closed/default palette       | Default trigger and neutral status are shown before opening. Page state starts closed; API's empty groups/default query are not a separate page card.                                                                                                                                                                                        |
| Search/filter/highlight      | Filtered scenario starts with a fixed translated project query; E2E verifies matching and excluded items. The component matches label, description, metadata, and keywords and highlights label matches; exhaustive permutations are omitted.                                                                                                |
| Empty results                | Fixed translated no-match query and empty heading; E2E verifies status. The explanatory description is primitive-owned English content.                                                                                                                                                                                                      |
| Loading                      | Fixed skeleton and busy state; E2E checks dialog `aria-busy`, Escape close, and focus returned to the opening trigger.                                                                                                                                                                                                                       |
| Item states                  | Default screenshot includes descriptions, shortcuts, badge, metadata, disabled item, and destructive item; a real pointer hover and keyboard active row are captured. Duplicate label/data combinations are omitted; stable item identity behavior belongs to the library unit suite.                                                        |
| Keyboard                     | E2E checks active option movement with ArrowDown/ArrowUp while DOM focus remains in the search input, Enter selection, clear-query action, Escape close/focus restoration, and Shift+Tab/Tab cycling across the modal focus-trap boundary. Component unit tests cover disabled skipping, active reset, and `aria-activedescendant` identity. |
| Selection/output             | E2E verifies the page status receives the selected label and that the original trigger regains focus. IDs remain domain keys in the page helper; unit tests prove `selected` emits the original item, not an ID string.                                                                                                                      |
| Dialog/listbox relationships | E2E checks `role="dialog"`, `aria-modal`, search combobox, `aria-expanded`, `aria-controls`, active descendant, selected option, disabled option, and status row. Primitive renders a listbox without its own accessible name; this is an inherited API limitation.                                                                          |
| Locale                       | Russian E2E loads the page's `ru.json`, switches shell language, then verifies translated heading/group/trigger/dialog/input/command/result status. Primitive-owned Clear search, empty description, and keyboard footer remain English and are not claimed as translated.                                                                   |
| Backdrop dismissal           | The component closes when its backdrop receives a pointer down and stops pointer events inside the dialog from bubbling to the backdrop. E2E clicks inside the dialog, then the surrounding backdrop, and checks close plus trigger focus restoration.                                                                                       |
| Responsive layout            | Scoped E2E passed at 768px and 320px, checking page main width and dialog bounds against the viewport and matching the named screenshots. All desktop, tablet, and mobile captures were visually reviewed; the shared `component-pages.spec.ts` route/responsive sweep remains parent-owned and pending.                                     |
| Route SSR/hydration          | Scoped E2E checks the raw route response heading and then the hydrated heading; it passed 11/11 twice. Shared `component-pages.spec.ts` also exercises server rendering, selected navigation, and responsiveness for this route; that integration sweep remains parent-owned and pending.                                                    |

## Source-backed behavior and inherited limitations

- Public barrel: `projects/ui/src/lib/components/command-palette/index.ts`; API: `kui-command-palette.component.ts` and inline template; data contracts: `kui-command-palette.types.ts`; tests: `kui-command-palette.component.spec.ts`.
- The component renders a CDK overlay with scroll blocking, `role="dialog"`, `aria-modal="true"`, CDK focus trap, autofocus to search, and trigger focus restoration. Search input has a combobox/listbox relationship with `aria-controls` and `aria-activedescendant`; Enter selects; Escape closes.
- Filtering checks label, description, metadata, and keywords. IDs must be non-empty, contain no whitespace, and be unique across all groups, including filtered/disabled items. Source validates in development and creates per-instance namespaced option DOM IDs.
- Primitive-owned `Clear search`, empty-state description, and footer key-help strings (`Up`/`Down`/`Enter`/`Esc`) are hardcoded English in the template. The page translates its own content/command data and does not claim full primitive localization.
- The modal uses `--kui-command-*` design tokens from `projects/ui/src/lib/components/command-palette/kui-command-palette.css`, including a narrow-screen rule at 560px. Page SCSS only sets card flow/spacing using KUI tokens.

## Self-review checklist

- [x] Retrospective audit cross-references docs, public exports, input/model/output source, item/group types, tests, styles, and page group builder.
- [x] Every public input/model/output, generated model output, default, and resolution rule is mapped to page interaction or an explicit omission.
- [x] Every optional item field is mapped to a named fixture item; omitted invalid-ID/heading/empty-groups cases have specific reasons and unit evidence.
- [x] EN/RU page catalogues have matching keys; Russian E2E gets expected strings from locale JSON rather than hard-coded Cyrillic.
- [x] The page keeps its examples in a page-private `CommandPaletteExamples` composition instead of duplicating the primitive or shell structure.
- [x] E2E declarations cover filtering, loading, empty, hover/active, clear, both arrow directions, Enter/Escape, backdrop dismissal, Tab cycling, ARIA, locale, route SSR, and tablet/320px geometry/screenshots.
- [x] The focused no-update browser suite passed 11/11 twice; existing visual baselines matched and were not regenerated.
- [x] Desktop, tablet, and 320px screenshots were opened and visually reviewed for clipping, overlap, and scroll ownership.
- [x] Production build and static audit/format/locale-parity checks passed; project lint reports no Command Palette issues but remains red on import-sort errors in unrelated pages.
- [ ] The shared `component-pages.spec.ts` route/responsive integration sweep remains parent-owned and pending.

# Component Page Rollout

Track every component catalog entry from implementation through independent review. The authoritative page contract and self-review requirements are in [component-page-authoring.md](./component-page-authoring.md).

## Completion Gate

A page is `Done` only after all of the following are true:

- The assigned agent implemented the catalog from the public Kikita UI contract, documented unsupported or omitted cases, and completed the authoring checklist.
- Before implementation, the agent submitted a source-backed contract audit and waited for the parent integrator to review it; the page inventory retains the accepted input/state-to-example map.
- The page has a minimally configured default example and a broad, compact catalogue of supported variants and meaningful states. Labels match actual runtime state.
- Page-specific unit/browser checks pass. Browser evidence uses stable accessible locators, controlled data/time, and covers relevant real interactions.
- Generated desktop and 320px screenshots were opened and visually inspected for clipping, overlap, unreadable density, incorrect scroll behavior, and misleading baselines.
- SSR/build, lint, format, route/i18n validation relevant to the page pass; shared test results are recorded at integration.
- A reviewer other than the implementing agent checked page anatomy, API fidelity, translations, decomposition, accessibility, SSR safety, and screenshot evidence.
- The parent integrated the page into its catalog-group route fragment and ran the integration checks.
- The page has its own commit. Before committing, inspect the staged file list and diff; include only this page's implementation, locale scope, E2E spec/reviewed snapshots, and directly matching source-doc fixes. Never stage a broad parent directory. Shared route registries are committed separately with only routing/integration files, after all referenced page commits are present.

Agents must work in bounded page ownership. In a parallel batch, no two agents may edit the same page folder, catalog-group route fragment, or locale scope. Shared route registries and this tracker are owned by the parent integrator. Pages that share a catalog group may run in parallel only when route integration is reserved for the parent and the agents' other file ownership remains disjoint.

The Playground build and browser tests write to shared output directories. Only one agent may build, serve, or run browser tests at a time; the parent assigns an exclusive verification slot after implementation work is ready.

Status definitions: `Queued` means the page has not been assigned; `In progress` means implementation, integration, independent review, or another completion gate remains; `Verified` means the implementation and independent-review gates passed but its page commit is pending; `Done` means the page has its own cleanly scoped commit as well. Record the short commit id in the owner/review cell. Never mark a page done solely because it renders or because tests pass.

## Catalog Status

### Actions

| Page            | Status      | Owner / review                                                                                                                               |
| --------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Button          | Done        | Initial pilot; independent audit passed; page committed as `220c61e`                                                                         |
| Icon button     | Done        | Independent review cleared; 16/16 E2E, SSR build, lint/static audit, and pre-commit passed; commit `4d766f7`                                 |
| Menu            | In progress | Placement E2E now captures triggers with panels and asserts relative geometry; parent rerun, baseline/visual review, and page commit pending |
| Command palette | In progress | Retrospective source-backed input/default map and self-review are present; parent rerun, baseline/visual review, and page commit pending     |

### Forms

| Page         | Status      | Owner / review                                                                                                                                                                                           |
| ------------ | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Calendar     | In progress | Page commit `531e4b0`; source fix `319fc2c`; focused E2E passed 14/14; final integrated checks and route-registry commit pending                                                                         |
| Checkbox     | Done        | Initial audit passed; real focus-visible state verified on load and sidebar navigation; commit `e3c92b8`                                                                                                 |
| Color input  | Done        | Independent audit passed; page committed as `878eb1a`                                                                                                                                                    |
| Combobox     | In progress | Retrospective source-backed input/default map and self-review are present; parent rerun, baseline/visual review, and page commit pending                                                                 |
| Date picker  | In progress | Page commit `f59ef22`; source fix `bcbc8a7`; fresh SSR build and E2E passed 14/14; final integrated checks and route-registry commit pending                                                             |
| Field        | Done        | Source-backed audit and parent review passed; Signal Forms validation, scoped EN/RU errors, affix focus, and clear-keyboard behavior verified; 8 page E2E passed, screenshots reviewed; commit `1d051c4` |
| File upload  | In progress | Implementation and self-review delivered; parent added Forms route/scope; browser/SSR checks, screenshots, independent audit, and page commit pending                                                    |
| Group        | In progress | Implementation delivered; parent Forms route/scope and SSR registry integrated; browser checks, screenshots, independent audit, and page commit pending                                                  |
| Input        | In progress | Implementation delivered; Forms route/scope and shared SSR/adaptive registry integrated; parent review, serial browser/SSR checks, screenshots/visual review, and page commit remain pending             |
| Number input | In progress | Source-backed contract audit assigned; implementation waits for parent review and approval                                                                                                               |
| Radio        | Done        | Independent audit passed; 7/7 E2E, build/lint/format passed; desktop, 320px, and interaction screenshots reviewed; commit `b16fca8`                                                                      |
| Segmented    | In progress | Source-backed contract audit assigned; implementation waits for parent review and approval                                                                                                               |
| Select       | In progress | `/root/select_contract`; source-backed contract audit assigned; implementation waits for parent review                                                                                                   |
| Slider       | Queued      | —                                                                                                                                                                                                        |
| Switch       | Done        | Source-backed audit approved; independent static review passed; shared SSR/adaptive and page E2E passed 24/24; desktop/mobile states reviewed; page commit `49c3a03`                                     |
| Textarea     | Done        | Source-backed inventory approved; independent review passed; EN/RU parity and validation flows verified; shared SSR/adaptive and page E2E passed 24/24; screenshots reviewed; page commit `853c4b2`      |

### Surfaces

| Page        | Status      | Owner / review                                                                                                                                          |
| ----------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Accordion   | In progress | `/root/audit_accordion` implementation delivered; parent owns route integration, SSR/E2E execution, visual review, and independent audit                |
| Breadcrumbs | In progress | Implementation delivered; parent route/scope and SSR registry integrated; browser checks, screenshot review, independent audit, and page commit pending |
| Card        | In progress | `card_page`; parallel batch 2; route integration reserved for parent                                                                                    |
| Dialog      | In progress | `/root/dialog_contract`; source-backed contract audit assigned; implementation waits for parent review                                                  |
| Drawer      | Queued      | —                                                                                                                                                       |
| Dropdown    | Queued      | —                                                                                                                                                       |
| Popover     | Queued      | —                                                                                                                                                       |
| Separator   | Done        | Independent audit passed; 4/4 E2E and build passed; desktop and 320px screenshots reviewed; commit `158b776`                                            |
| Stepper     | Queued      | —                                                                                                                                                       |
| Tabs        | Queued      | —                                                                                                                                                       |

### Feedback

| Page        | Status      | Owner / review                                                                                                                                                                                                            |
| ----------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Badge       | Done        | Independent audit passed; 4/4 E2E, build/lint/format passed; desktop and 320px screenshots reviewed; commit `f630a5b`                                                                                                     |
| Empty state | Done        | Source-contract review passed; contexts, projected content, actions, sizes, keyboard interaction, and responsive layouts verified; 7 page E2E passed, screenshots reviewed; commit `d51d5e3`                              |
| Loader      | Done        | Source-backed audit passed; sizes, accessible consumer status, keyboard actions, scoped language, SSR, reduced motion, and responsive layouts verified; 7 page E2E passed; commit `1e5cddc`                               |
| Progress    | In progress | `/root/progress_page` implementation delivered; parent owns route integration, browser/SSR verification, and visual review                                                                                                |
| Skeleton    | In progress | Implementation delivered; parent integrated route. Browser/SSR checks, screenshots, independent audit, and page commit pending                                                                                            |
| Toast       | In progress | Implementation and teardown regression scenario delivered; parent Feedback route/scope and SSR registry integrated; serial browser checks, screenshots, independent audit, and page commit pending                        |
| Tooltip     | In progress | Implementation and parent Surfaces route/scope plus SSR/adaptive registry delivered; Prettier and translation checks pass; lint dependency issue, browser checks, screenshots, independent audit, and page commit pending |

### Data identity

| Page      | Status      | Owner / review                                                                                                                                                                                                                                          |
| --------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Avatar    | In progress | Implementation and Data identity route/scope plus SSR/adaptive registry delivered; parent static API, decomposition, accessibility, SSR, and translation review passed; browser/E2E, screenshot/visual review, and page commit remain pending           |
| Chip      | In progress | Long-label constraint and mobile overflow assertion added after parent review; Data identity route/scope and shared SSR/adaptive registry integrated; serial browser/screenshot verification, independent visual review, and page commit remain pending |
| Icon      | Done        | Independent static audit passed after page artwork switched to the shipped local `kikita-brand` SVG; shared SSR/adaptive and page E2E passed 24/24; screenshots reviewed; page commit `f1a78a2`                                                         |
| Scrollbar | In progress | `/root/scrollbar_contract`; verify whether this global CSS capability warrants a dedicated page; implementation waits for parent review                                                                                                                 |
| Table     | Queued      | —                                                                                                                                                                                                                                                       |
| Tree      | Queued      | —                                                                                                                                                                                                                                                       |

## Review Checklist

- [ ] Tracker covers every entry in the sidebar catalog exactly once.
- [ ] Owners, statuses, and evidence links reflect the current worktree.
- [ ] No page is marked done before independent visual and code review.
- [ ] Parent integration checks pass after each batch.

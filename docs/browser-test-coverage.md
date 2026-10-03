# Browser Test Coverage Map

This map states which evidence each public primitive has today and where the gaps are. A route
that loads is not evidence of behavior. A listed test is not a pass: results are recorded with
command, date and revision in [State Coverage](state-coverage.md).

Facts here were checked against the tests at revision `d640ed9` plus the Plan 11 changes on
2026-09-29, and updated for the Plan 10.2 Phase B retirement of the legacy Playground on 2026-10-01.
Counts are `it`/`test` declarations, not pass counts.

## Evidence levels

| Level         | Proves                                                                                                                    | Does not prove                                                                           |
| ------------- | ------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Unit          | Value math, signal state, host attributes, form integration, provider wiring, pure keyboard mapping.                      | Real focus, hit-testing, geometry, animation end, touch, the browser accessibility tree. |
| Browser       | Focus movement, Escape and backdrop dismissal, selection, disabled state, geometry, touch, computed name and description. | Assistive-technology announcements; other browsers (Chromium only).                      |
| Accessibility | Automated axe-core rules on a rendered page.                                                                              | Focus order, reading order, announcements, label quality. Manual review is separate.     |
| Responsive    | No horizontal document overflow at fixed widths, including a right-to-left layout smoke.                                  | Visual quality at those widths.                                                          |
| Visual        | A reviewed screenshot did not change.                                                                                     | Behavior. A baseline is a smoke check, not design approval.                              |
| SSR           | The server response contains the content, the DOM survives hydration, and the app stays interactive.                      | Runtime SSR safety of every primitive (Plan 12).                                         |

Automated accessibility is never reported as manual keyboard or screen-reader evidence. No real
screen-reader result has been recorded for any primitive; that gap is unowned and is listed below.

## Suites and commands

The Playground (`projects/kikita-ui-playground`) is the only browser verification surface. Its
Playwright suite lives in `projects/kikita-ui-playground/e2e/` and runs against the built SSR server
(`dist/kikita-ui-playground/server/server.mjs`), which serves both the server-rendered HTML and the
client scripts.

| Project    | Runs                                                  | Motion                           | Command                                                                            |
| ---------- | ----------------------------------------------------- | -------------------------------- | ---------------------------------------------------------------------------------- |
| `behavior` | Every test whose title does not carry `@visual`       | Production motion                | `pnpm.cmd test:browser` (builds first); `pnpm.cmd test:ssr` runs only the SSR spec |
| `visual`   | Tests titled `@visual`, which call `toHaveScreenshot` | `prefers-reduced-motion: reduce` | `pnpm.cmd test:visual` (Docker, Linux baselines)                                   |

Every run starts with a freshness guard (`tools/assert-playground-build.mjs`). It fails when the
build output is missing or older than the sources it is built from, and names the newest source.
The server is never reused, so a stale process cannot hide a stale bundle.

## Shared harness rules

- Import `test` and `expect` from `./support/fixtures`, not from `@playwright/test`. The
  `browserErrors` auto fixture records `console.error` and uncaught page errors for the whole test
  and fails it at teardown, after one timer turn and a page round-trip so an error raised by the
  last interaction is still counted.
- An exception is a `BrowserErrorAllowance` with a message or URL pattern and a written reason.
  The only default one is the Lucide CDN request that the library swallows on purpose. Set others
  with `test.use({ browserErrorAllowances })` next to the code that owns the exception. The collector
  throws for a missing pattern, a blank reason, a `g` or `y` flag, and an obvious catch-all pattern
  (one that matches the empty string or every string in `catchAllProbes`). A merely broad pattern such
  as `/error/i` is not detected and is left to review.
- `gotoReady` waits for the routed page and web fonts, not for `networkidle`. The Playground exposes
  no hydration marker, so hydration is proved by behavior in the SSR specs, using
  `openWithHeldScripts` to look at the server response before any client script runs.
- Locale is `en-US` and timezone is `UTC` for every suite. Tests that depend on the current date
  freeze it with `page.clock.setFixedTime`, which freezes `Date` only and leaves timers real.
- The behavior project runs with production motion. Only the visual project sets
  `prefers-reduced-motion: reduce`. A test whose title ends with `@visual` takes screenshots and runs
  in the `visual` project; every other test runs in `behavior`. Add `@visual` to any new test that calls `toHaveScreenshot`, directly or through a
  helper. A test that verifies a specific motion mode emulates it itself. Use `settleAnimations`
  before measuring layout or asserting that something did not change.
- Prefer exact locators. `.first()` is accepted only when the meaning really is "first in document
  order" inside a uniquely scoped container (first table row, first chart mark, first calendar row) or
  for a style-only assertion. If several elements share a name, scope to the one that matters. Do not
  use fixed sleeps; put a timer under test on `page.clock`.
- `projects/kikita-ui-playground/e2e/harness.spec.ts` protects the harness itself, including a `test.fail` case that goes
  red if the teardown assertion is weakened.
- A failing run keeps a trace (`trace: 'retain-on-failure'`). Open it with
  `pnpm.cmd exec playwright show-trace <trace.zip>`. Retries do not count as a fix.

## Minimum matrix by risk

| Tier | Primitives                                                                                                                  | Required evidence                                                                                                                                                                      |
| ---- | --------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | Dialog, Drawer, Popover, Dropdown, Select, Combobox, Menu, Command Palette, Date/Time pickers, Toast, Tooltip, Media Viewer | Unit for state. Browser for open, Escape, backdrop, focus trap or return, disabled and selection, plus one touch path. Axe. 320px overflow. SSR hydration for the shared overlay path. |
| 2    | Field, Input, Textarea, Checkbox, Radio, Switch, Number Input, Slider, OTP Input, File Upload, Color Input                  | Unit for host attributes and forms. Browser for label-to-focus, description and invalid wiring, disabled and readonly, keyboard. Axe. Visual only for distinct states.                 |
| 3    | Tabs, Accordion, Table, Tree, Pagination, Stepper, Breadcrumbs, Carousel, Splitter, Calendar, Segmented                     | Unit for the keyboard model where it is pure. Browser for real keyboard, focus and geometry. Axe. Responsive overflow.                                                                 |
| 4    | Badge, Card, Avatar, Chip, Separator, Skeleton, Loader, Icon, Typography, Empty State, Link, Group, Chart                   | Unit for host attributes. Axe. Visual smoke. Chart also follows Plan 24.                                                                                                               |

## Coverage by primitive

`Unit` is the number of unit tests. `Page` is the number of tests in the Playground specs for the
primitive (all run through the shared error fixture). Axe runs on every routed page in
`accessibility.spec.ts`; a known violation is tracked by exact rule id, so a new rule or a fix fails
the sweep until the list is updated.

| Primitive       | Unit | Page | Concrete gap                                                                                                                                                                                                                                                         |
| --------------- | ---- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Accordion       | 12   | 10   | None recorded.                                                                                                                                                                                                                                                       |
| Alert           | 12   | 17   | Page (10 visual, 7 behavior). Not verified: assistive-technology announcement.                                                                                                                                                                                       |
| Avatar          | 6    | 7    | None recorded.                                                                                                                                                                                                                                                       |
| Badge           | 1    | 4    | Presentational; low risk.                                                                                                                                                                                                                                            |
| Breadcrumbs     | 5    | 9    | Axe clean after Plan 10.3 (each example trail has a unique navigation name).                                                                                                                                                                                         |
| Button          | 8    | 10   | None recorded.                                                                                                                                                                                                                                                       |
| Calendar        | 11   | 16   | Axe clean after Plan 10.3 (complete `grid > row > gridcell` structure, `aria-selected` on the gridcell).                                                                                                                                                             |
| Calendar Range  | 10   | 32   | Page (29 run, 3 fixme). Fixme: arrow keys lag focus by one press, no tab stop outside today's month, live region only on month pick. Axe clean after Plan 10.3 (same grid structure as Calendar).                                                                    |
| Card            | 1    | 13   | None recorded.                                                                                                                                                                                                                                                       |
| Carousel        | 18   | 21   | Page (19 run, 2 fixme): mouse drag, wheel, CDP touch swipe, clock-driven autoplay. Fixme: Play/Pause label follows hover/focus; shared pause flag resumes autoplay while focus is inside. Axe clean after Plan 10.3 (the draggable track is a keyboard tab stop).    |
| Chart           | 107  | 18   | Focus-on-mark `test.fixme` and library defects belong to Plan 24.                                                                                                                                                                                                    |
| Checkbox        | 2    | 9    | Unit covers host attributes and field ids only; forms and disabled behavior are browser-only.                                                                                                                                                                        |
| Chip            | 5    | 11   | None recorded.                                                                                                                                                                                                                                                       |
| Color Input     | 8    | 17   | None recorded.                                                                                                                                                                                                                                                       |
| Combobox        | 11   | 25   | None recorded.                                                                                                                                                                                                                                                       |
| Command Palette | 8    | 11   | None recorded.                                                                                                                                                                                                                                                       |
| Date Picker     | 15   | 14   | "Today" is seeded from the server (`KuiClock`); SSR checks in UTC+14 cover the Calendar and Calendar Range routes and a Date Picker opened after hydration.                                                                                                          |
| Dialog          | 10   | 15   | Touch backdrop tap, locked dialog and an 8-press Tab/Shift+Tab focus cycle covered; nested dialogs are not covered.                                                                                                                                                  |
| Drawer          | 10   | 14   | No touch backdrop tap.                                                                                                                                                                                                                                               |
| Dropdown        | 16   | 16   | None recorded.                                                                                                                                                                                                                                                       |
| Empty State     | 2    | 7    | None recorded.                                                                                                                                                                                                                                                       |
| Field           | 20   | 10   | `required` is exposed to assistive technology as `aria-required` on the control (Plan 19B).                                                                                                                                                                          |
| File Upload     | 14   | 17   | Axe clean after Plan 10.3 (hidden input `aria-hidden`, presentational Choose file label).                                                                                                                                                                            |
| Group           | 4    | 9    | None recorded.                                                                                                                                                                                                                                                       |
| Icon Button     | 6    | 13   | None recorded.                                                                                                                                                                                                                                                       |
| Icon            | 12   | 7+6  | Axe clean after Plan 10.3 (page root is a tab stop). Default icons by name load from a CDN. `icon-structural.spec.ts` (6 behavior tests) covers server HTML, stroke tokens, constant stroke, `defaults.icons` scope and forced colors.                               |
| Input           | 7    | 8    | None recorded.                                                                                                                                                                                                                                                       |
| Link            | 10   | 38   | Page (37 run, 1 fixme). Composed typography line height is asserted for anchor and button hosts. Fixme: a consumer `(click)` handler still runs on a disabled anchor.                                                                                                |
| Loader          | 1    | 7    | None recorded.                                                                                                                                                                                                                                                       |
| Media Viewer    | 16   | 32   | Page (30 run, 2 fixme): keyboard, zoom, pan, wheel, real two-finger pinch. Fixme: focus lost and arrow keys dead after Zoom in disables while focused; light-theme chrome unreadable. Backdrop click is documented but unreachable in fullscreen (docs discrepancy). |
| Menu            | 9    | 19   | None recorded. The legacy demo's `aria-required-parent` finding does not occur on the page.                                                                                                                                                                          |
| Number Input    | 30   | 13   | None recorded.                                                                                                                                                                                                                                                       |
| OTP Input       | 19   | 38   | Page (36 run, 2 fixme). Fixme: every cell is a tab stop although the docs say Tab leaves the group; cells are not square at 320px in a long group. Size is not inherited from the Field (recorded, not asserted).                                                    |
| Pagination      | 12   | 16   | Page (15 run, 1 fixme). Fixme: focus falls to `<body>` when Next reaches the last page.                                                                                                                                                                              |
| Popover         | 20   | 13   | None recorded.                                                                                                                                                                                                                                                       |
| Progress        | 14   | 10   | Axe clean after Plan 10.3 (size rows are plain groups).                                                                                                                                                                                                              |
| Radio           | 2    | 9    | Unit covers host attributes and field ids only.                                                                                                                                                                                                                      |
| Segmented       | 8    | 9    | None recorded.                                                                                                                                                                                                                                                       |
| Select          | 26   | 25   | Touch tap, disabled-option click, Enter commit and Escape focus restore covered.                                                                                                                                                                                     |
| Separator       | 1    | 4    | Axe clean after Plan 10.3 (page root is a tab stop).                                                                                                                                                                                                                 |
| Skeleton        | 1    | 6    | None recorded.                                                                                                                                                                                                                                                       |
| Slider          | 19   | 11   | None recorded.                                                                                                                                                                                                                                                       |
| Splitter        | 13   | 27   | Page (25 run, 2 fixme): real mouse and CDP touch drag with geometry assertions, keyboard. Fixme: `collapsed()` desyncs after Home/keyboard. `aria-controls` target and axe clean (Plan 10.3).                                                                        |
| Stepper         | 7    | 7    | None recorded.                                                                                                                                                                                                                                                       |
| Switch          | 2    | 9    | Unit covers host attributes and field ids only.                                                                                                                                                                                                                      |
| Table           | 5    | 9    | None recorded.                                                                                                                                                                                                                                                       |
| Tabs            | 11   | 6    | None recorded.                                                                                                                                                                                                                                                       |
| Textarea        | 2    | 8    | Unit covers host attributes and field ids only.                                                                                                                                                                                                                      |
| Time Picker     | 32   | 30   | Page (30 run). Escape from inside the open panel returns focus to the input (Plan 10.3).                                                                                                                                                                             |
| Toast           | 10   | 12   | None recorded.                                                                                                                                                                                                                                                       |
| Tooltip         | 8    | 10   | None recorded.                                                                                                                                                                                                                                                       |
| Tree            | 21   | 8    | None recorded.                                                                                                                                                                                                                                                       |
| Typography      | 2    | 18   | Page: computed size/line-height/weight for all 11 roles, colour for all 7 tones. Axe clean after Plan 10.3 (page root is a tab stop).                                                                                                                                |

Every routed page is also covered by a server-response heading check, a hydration check and an axe
sweep (`component-pages.spec.ts`, `accessibility.spec.ts`), plus no-overflow checks at 320, 390, 768
and 1440px and a right-to-left layout smoke. Dialog and Select have the held-script hydration check;
`route-teardown.spec.ts` and `touch-playground.spec.ts` hold the cross-page lifecycle and touch checks.

## Known gaps and owners

Each item states its owner or decision. Decisions were made by Nikita on 2026-09-30 and are recorded
in the local v2 plan (`.local-notes/v2/PLAN.md` and the plan file named per item). Plan numbers are
the v2 queue ids. Items 2-7 and 9-11 need no further decision for Plan 11; the work they name happens
in the plan listed.

1. **Legacy Playground retired.** The ten pages added by Plan 10.2 Phase A (Alert, Calendar Range,
   Carousel, Link, Media Viewer, OTP Input, Pagination, Splitter, Time Picker, Typography) and the
   library suites that still ran against the old Playground app were reconciled in Phase B; see
   [Legacy Playground retirement](#legacy-playground-retirement-plan-102-phase-b).
2. **Automated axe violations.** The sweep asserts exact rule ids per route in the light and the dark
   theme, and the known list is empty: every routed page is free of automated violations, colour
   contrast included (item 3).
   Closed by queue item 10.3 on 2026-10-01 (`accessibility-remediation.md`). Automated results are not
   assistive-technology evidence; manual keyboard and screen-reader sessions remain part of the
   final v2 checklist.
3. **Axe rule exclusion**: none. Plan 14 re-enabled `color-contrast` in the Playground sweep (both
   themes) and in the Popover dialog check on 2026-10-02; the axe helper waits for finite animations
   before it measures, because contrast is computed from the colours on screen. Axe does not test
   borders, focus indicators or placeholders; the unit contract in
   `create-kui-theme.contrast.spec.ts` covers those pairs for any seed.
4. **Time Picker Escape from inside the panel** returned no focus to the input. Fixed in queue item
   10.3: `kui-dropdown` hands focus back to the field control when Escape closes a panel that held
   focus (regression tests in the Dropdown unit spec and the Time Picker and Date Picker pages).
5. **Field `required`** was not exposed to assistive technology. Fixed in Plan 19B (2026-10-03): `kui-field`
   puts the merged required state on the control as `aria-required`, and the former `test.fixme` in
   `field-playground.visual.spec.ts` is now a passing test. Unit coverage for every control is in
   `field/kui-field-control-wiring.spec.ts`.
6. **Right-to-left** is unsupported in v2 and is documented as such (see the roadmap's Deferred Feature
   Scope). No primitive has direction-aware behavior (no `rtl`, `dir` or `Directionality` use under
   `projects/ui/src/lib`), so arrow-key direction in Tabs, Slider, Segmented, Tree and Splitter is
   untested because it is unimplemented. Only a layout smoke exists (`component-pages.spec.ts`): no
   overflow on Field, Select, Table and Dialog, and an open Select list stays on screen. The final v2 checklist confirms the statement is in the release docs.
7. **Touch**: real taps are covered for Select and Dialog (`touch-playground.spec.ts`) and Avatar,
   Slider and Tooltip (their page specs). Accepted as representative coverage; Drawer, Menu, Popover, Combobox,
   pickers, Splitter and Carousel swipe have no touch check.
8. **SSR of date-dependent primitives**: `component-pages.spec.ts` checks the server heading and
   hydrated navigation of every routed page, and `ssr-hydration.spec.ts` the held-hydration flows
   (Dialog, Select, event replay, no-JavaScript Table, server ids). Calendar,
   Calendar Range and Date Picker have a UTC+14 time-zone check (`ssr-hydration.spec.ts`); a
   de-DE request is checked for the same weekday row on the server and after hydration (see
   `docs/ssr-lifecycle-register.md`). OTP Input and Time Picker read no date at render and have no
   dedicated SSR check beyond the per-page heading test. Owner: Plan 12 until it is closed.
9. **CDN dependence**: default Lucide icons by name load from `cdn.jsdelivr.net` (pinned version,
   converted to glyph data). Only three replacement specs stub it (`lucide-static@*`), so screenshots in
   the others need internet access. The harness allowance stops the console failure, not the missing
   pixels. This is a justified exception of Plan 20 for content icons by name only; structural icons
   never use the network. The allowance stays and is narrowed to the Lucide path by its URL pattern.
10. **No manual accessibility evidence**: no real keyboard-only or screen-reader session is recorded for
    any primitive. Scheduled at final v2 integration (`PLAN.md`); the assistive technology, browser and
    OS must be named. See [Accessibility Review Guide](accessibility.md).
11. **Chromium only**: Firefox and WebKit are not run. Accepted until release; the final v2 checklist
    adds WebKit and Firefox runs at release time.
12. **Hydration readiness** is inferred from behavior because the Playground exposes no marker.
    Owner: Plan 12 decides whether to add one (`ssr.md`, Phase 3). This caused real CI flakes: a key
    pressed before hydration finishes is captured by Angular event replay and delivered out of order
    (`preventDefault called during event replay`), so the control then ignores later input. The Link
    Enter test and the Select multiple-selection test failed this way and now open with a
    client-only interaction (the Count action button, the Select toggle) that only works on a live
    page. The `ngh` marker disappearing from the DOM is not enough: a 500 ms wait after it still
    changed the outcome. Other specs that press keys straight after `goto` may flake the same way.
    A marker set after `ApplicationRef.whenStable()` would remove the need for per-test probes.
13. **Dialog lifecycle on route change**: a dialog opened imperatively stays open after its opening
    route is destroyed, and `docs/dialog.md` does not say whether that is intended. A characterization
    test in `route-teardown.spec.ts` only guarantees no error. Owner: Plan 12 (`ssr.md`,
    Phase 3); changing the contract needs a decision from Nikita.
14. **Dropdown inside a Field** (an input-anchored list committed with a click, closed with Escape and
    returning focus to the input, shown in `docs/dropdown.md`) has no example on the Dropdown page.
    The behavior is exercised through Select (`select-playground.visual.spec.ts`), which uses the same
    primitive. Adding the example needs a page-contract decision.
15. **Token reference and density demo**: the legacy `/tokens` and `/density` routes had no component
    page to move to, and a new page needs an approved contract and design record. Their content is
    not reproduced. Owner: Plan 13 (token boundaries) decides whether a token reference page is wanted.

## Legacy Playground retirement (Plan 10.2 Phase B)

Decision D12 (2026-09-30): migrate the library browser suites onto the Playground pages, then delete
the legacy Playground app. Every library test was compared with the page specs first. A
behavior the pages already covered was not duplicated; the rest was ported.

| Library suite (removed)                      | Disposition                                                                                                                                                                                                                                             |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `behavior.spec.ts` (10)                      | Covered by the Command Palette, Dialog, Toast, Tooltip, OTP Input, Pagination and Time Picker page specs. Ported: Link composed line height (`link-playground`), Time Picker label focus (`time-picker-playground`).                                    |
| `interaction.spec.ts` (Dialog, Field, route) | Covered: backdrop dismissal and the locked dialog. Ported: 8-press Tab/Shift+Tab cycle (`dialog-playground`), Field label focus (`field-playground`), the `required` fixme (`field-playground`), both route-teardown checks (`route-teardown.spec.ts`). |
| `interaction-widgets.spec.ts`                | Covered by the Time Picker, Splitter, Calendar Range, Carousel and Media Viewer page specs, including the fixed-clock 12-hour picker and the Escape-focus check. Ported: Select disabled-option click, Enter commit and Escape focus restore.           |
| `touch.spec.ts` (3)                          | Ported to `touch-playground.spec.ts`.                                                                                                                                                                                                                   |
| `accessibility.spec.ts` (39 routes)          | Replaced by the axe sweep over every routed page (`accessibility.spec.ts`). Findings that came from legacy demo markup (`empty-table-header`, `label-title-only`, `aria-prohibited-attr`) do not exist on the pages and are not carried.                |
| `responsive.spec.ts`                         | Ported to `component-pages.spec.ts`: 390px added to the no-overflow sweep, and the right-to-left layout smoke (Field, Select, Table, Dialog, plus an on-screen Select list).                                                                            |
| `visual.spec.ts` (24 baselines)              | Retired, not moved. `/button`, `/field`, `/select`, `/dialog`, `/table` and `/calendar` each have section baselines in their own page spec; the legacy full-page captures of demo boards are not reproduced.                                            |
| `ssr-hydration.spec.ts` (25)                 | Covered by the per-route server heading and hydration check, the Dialog and Select held-script checks and the server-id checks. Ported: event replay of a click made before hydration and the no-JavaScript Table (`ssr-hydration.spec.ts`).            |
| `harness.spec.ts` and `support/`             | Moved to `projects/kikita-ui-playground/e2e/`. The reduced-motion check of the old visual suite is now an `@visual` case in `harness.spec.ts`.                                                                                                          |

The five legacy-only routes were handled by decision D12b: `/icons` and `/forms` are covered by the
Icon page and the Field, Input and Select pages; `/theme` by the shell palette and theme switch;
`/tokens` and `/density` are retired with their tests (gap 15).

Tooling changes: the Playwright config is `playwright.config.ts` (the former
`playwright.kikita-ui-playground.config.ts`); `playwright.ssr.config.ts`, `tools/serve-playground-dist.mjs`
and `tools/serve-playground-ssr.mjs` are gone; the freshness guard is `tools/assert-playground-build.mjs`.
The scripts `build:playground:ssr`, `build:kikita-ui-playground`, `serve:kikita-ui-playground`,
`test:e2e`, `test:a11y`, `test:responsive` and the `test:kikita-ui-playground:ssr|visual` variants were
removed; `build:playground`, `test:browser`, `test:ssr` and `test:visual` now target the Playground. The CI `ssr`
and `visual-library` jobs were removed because the `browser` and `visual` jobs already run the same
Playground specs. The static audit reads `PlaygroundRoute` and now fails, instead of passing, when
that file is missing.

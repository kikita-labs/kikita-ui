# Browser Test Coverage Map

This map states which evidence each public primitive has today and where the gaps are. A route
that loads is not evidence of behavior. A listed test is not a pass: results are recorded with
command, date and revision in [State Coverage](state-coverage.md).

Facts here were checked against the tests at revision `d640ed9` plus the Plan 11 changes on
2026-09-29. Counts are `it`/`test` declarations, not pass counts.

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

| Suite                  | Location                             | Runs against                                                                                                                     | Command                                                 |
| ---------------------- | ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Library browser (e2e)  | `tests/e2e/`                         | Library Playground (`dist/playground`), production motion                                                                        | `pnpm.cmd test:e2e`, `test:a11y`, `test:responsive`     |
| Library visual         | `tests/e2e/visual.spec.ts`           | Library Playground, reduced motion                                                                                               | `pnpm.cmd test:visual`                                  |
| Library SSR            | `tests/e2e/ssr-hydration.spec.ts`    | Library Playground SSR server                                                                                                    | `pnpm.cmd test:ssr` (builds first)                      |
| Replacement Playground | `projects/kikita-ui-playground/e2e/` | Replacement Playground SSR server; projects `behavior` (production motion) and `visual` (tests titled `@visual`, reduced motion) | `pnpm.cmd test:kikita-ui-playground:ssr` (builds first) |

Every suite starts with a freshness guard (`tools/assert-playground-build.mjs`). It fails when the
build output is missing or older than the sources it is built from, and names the newest source.
The SSR configs never reuse a running server, so a stale process cannot hide a stale bundle.

## Shared harness rules

- Import `test` and `expect` from `tests/e2e/support/fixtures`, not from `@playwright/test`. The
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
- Behavior, accessibility and responsive projects run with production motion. Only the visual
  projects set `prefers-reduced-motion: reduce`. In the replacement Playground a test whose title ends
  with `@visual` takes screenshots and runs in the `visual` project; every other test runs in
  `behavior`. Add `@visual` to any new test that calls `toHaveScreenshot`, directly or through a
  helper. A test that verifies a specific motion mode emulates it itself. Use `settleAnimations`
  before measuring layout or asserting that something did not change.
- Prefer exact locators. `.first()` is accepted only when the meaning really is "first in document
  order" inside a uniquely scoped container (first table row, first chart mark, first calendar row) or
  for a style-only assertion. If several elements share a name, scope to the one that matters. Do not
  use fixed sleeps; put a timer under test on `page.clock`.
- `tests/e2e/harness.spec.ts` protects the harness itself, including a `test.fail` case that goes
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

`Unit` is the number of unit tests. `Page` is the number of tests in the replacement Playground spec
for the primitive (all run through the shared error fixture). `Library suite` lists the library
browser evidence: B behavior, A axe, R responsive, V visual, S SSR; `A!` means axe currently fails
and the route is tracked as a known violation whose exact rule ids are asserted, so a new rule or
a fix fails the test until the list is updated.

| Primitive       | Unit | Page | Library suite | Concrete gap                                                                                                                                                                                                   |
| --------------- | ---- | ---- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Accordion       | 12   | 10   | A             | None recorded.                                                                                                                                                                                                 |
| Alert           | 12   | -    | A             | No replacement page. Dismissal is unit-only; no visual.                                                                                                                                                        |
| Avatar          | 6    | 7    | -             | None recorded.                                                                                                                                                                                                 |
| Badge           | 1    | 4    | -             | Presentational; low risk.                                                                                                                                                                                      |
| Breadcrumbs     | 5    | 9    | -             | Replacement axe sweep: `landmark-unique` (moderate) on the demo.                                                                                                                                               |
| Button          | 8    | 10   | A R S V       | None recorded.                                                                                                                                                                                                 |
| Calendar        | 11   | 16   | V, A!         | Critical axe violations (`aria-allowed-attr`, `aria-required-children`, `aria-required-parent`) in both Playgrounds; the exact rule list is asserted in both.                                                  |
| Calendar Range  | 10   | -    | B, A!         | No replacement page. Axe `aria-required-children` and `aria-required-parent` (both critical), asserted exactly. No visual, no SSR, no touch.                                                                   |
| Card            | 1    | 13   | -             | None recorded.                                                                                                                                                                                                 |
| Carousel        | 18   | -    | B, A          | No replacement page. Previous/Next covered; swipe, loop wrap and autoplay pause are not browser-tested.                                                                                                        |
| Chart           | 107  | 18   | A R S         | Focus-on-mark `test.fixme` and library defects belong to Plan 24.                                                                                                                                              |
| Checkbox        | 2    | 9    | A             | Unit covers host attributes and field ids only; forms and disabled behavior are browser-only.                                                                                                                  |
| Chip            | 5    | 11   | -             | None recorded.                                                                                                                                                                                                 |
| Color Input     | 8    | 17   | -             | None recorded.                                                                                                                                                                                                 |
| Combobox        | 11   | 25   | A             | None recorded.                                                                                                                                                                                                 |
| Command Palette | 8    | 11   | B A           | None recorded.                                                                                                                                                                                                 |
| Date Picker     | 15   | 14   | A R           | No SSR check although "today" is time-zone dependent (Plan 12).                                                                                                                                                |
| Dialog          | 10   | 14   | B A R V S     | Touch backdrop tap covered; nested dialogs are not covered.                                                                                                                                                    |
| Drawer          | 10   | 14   | A             | Focus trap and backdrop only in the replacement page; no touch backdrop tap.                                                                                                                                   |
| Dropdown        | 16   | 16   | B A R S       | None recorded.                                                                                                                                                                                                 |
| Empty State     | 2    | 7    | -             | None recorded.                                                                                                                                                                                                 |
| Field           | 20   | 8    | B A R V S     | `required` renders only an `aria-hidden` marker; the control gets no `aria-required` (Plan 19B).                                                                                                               |
| File Upload     | 14   | 17   | A!            | Axe `label` (critical) and `nested-interactive` (serious), asserted exactly in both Playgrounds.                                                                                                               |
| Group           | 4    | 9    | -             | None recorded.                                                                                                                                                                                                 |
| Icon Button     | 6    | 13   | -             | None recorded.                                                                                                                                                                                                 |
| Icon            | 12   | 7    | -             | Replacement axe sweep: `scrollable-region-focusable`. Default icons load from a CDN.                                                                                                                           |
| Input           | 7    | 8    | A R S         | None recorded.                                                                                                                                                                                                 |
| Link            | 10   | -    | B A R         | No replacement page; only line height is browser-tested.                                                                                                                                                       |
| Loader          | 1    | 7    | -             | None recorded.                                                                                                                                                                                                 |
| Media Viewer    | 16   | -    | B A           | No replacement page. Open, Escape and focus return covered; keyboard next/previous, zoom, swipe are not.                                                                                                       |
| Menu            | 9    | 19   | A!            | Axe `aria-required-parent` (critical) on the library Playground, asserted exactly.                                                                                                                             |
| Number Input    | 30   | 13   | S             | None recorded.                                                                                                                                                                                                 |
| OTP Input       | 19   | -    | B A           | No replacement page; no visual, no SSR.                                                                                                                                                                        |
| Pagination      | 12   | -    | B A R         | No replacement page; no visual.                                                                                                                                                                                |
| Popover         | 20   | 13   | A S           | None recorded.                                                                                                                                                                                                 |
| Progress        | 14   | 10   | -             | Replacement axe sweep: `landmark-unique` (moderate).                                                                                                                                                           |
| Radio           | 2    | 9    | A             | Unit covers host attributes and field ids only.                                                                                                                                                                |
| Segmented       | 8    | 9    | A             | None recorded.                                                                                                                                                                                                 |
| Select          | 26   | 23   | B A R V S     | None recorded.                                                                                                                                                                                                 |
| Separator       | 1    | 4    | -             | Replacement axe sweep: `scrollable-region-focusable`.                                                                                                                                                          |
| Skeleton        | 1    | 6    | -             | None recorded.                                                                                                                                                                                                 |
| Slider          | 19   | 11   | A             | None recorded.                                                                                                                                                                                                 |
| Splitter        | 13   | -    | B, A!         | No replacement page. Axe `aria-valid-attr-value` (critical) and `nested-interactive` (serious), asserted exactly. Pointer and touch drag, vertical orientation and the collapse button are not browser-tested. |
| Stepper         | 7    | 7    | A             | None recorded.                                                                                                                                                                                                 |
| Switch          | 2    | 9    | A             | Unit covers host attributes and field ids only.                                                                                                                                                                |
| Table           | 5    | 9    | A R V S       | None recorded.                                                                                                                                                                                                 |
| Tabs            | 11   | 6    | A             | None recorded.                                                                                                                                                                                                 |
| Textarea        | 2    | 8    | A             | Unit covers host attributes and field ids only.                                                                                                                                                                |
| Time Picker     | 32   | -    | B A R         | No replacement page. Escape from inside the open panel drops focus to `<body>` (fixme, queue item 10.3).                                                                                                       |
| Toast           | 10   | 12   | B A           | None recorded.                                                                                                                                                                                                 |
| Tooltip         | 8    | 10   | B A           | None recorded.                                                                                                                                                                                                 |
| Tree            | 21   | 8    | A             | None recorded.                                                                                                                                                                                                 |
| Typography      | 2    | -    | -             | No page and no browser or axe evidence at all.                                                                                                                                                                 |

Every replacement page is also covered by a server-response heading check and, since Plan 11, an axe
sweep. Only Dialog and Select have the held-script hydration check.

## Known gaps and owners

Each item states its owner or decision. Decisions were made by Nikita on 2026-09-30 and are recorded
in the local v2 plan (`.local-notes/v2/PLAN.md` and the plan file named per item). Plan numbers are
the v2 queue ids. Items 2-7 and 9-11 need no further decision for Plan 11; the work they name happens
in the plan listed.

1. **Replacement pages missing** for Alert, Calendar Range, Carousel, Link, Media Viewer, OTP Input,
   Pagination, Splitter, Time Picker and Typography. A Playground catalogue gap, not a harness gap:
   the replacement Playground's rollout tracker covers 43 sidebar entries and none of these ten is in
   it. Owner: Plan 10.2, "Playground parity and legacy retirement", after Plan 11 closes and before
   Plan 12 is completed. The legacy Playground stays until 10.2 migrates or explicitly resolves its
   test, build, server, tooling and documentation dependencies. Until then the library suite is the
   only browser evidence for these ten and none has a visual baseline.
2. **Automated axe violations.** Both suites assert exact rule ids per route. Library routes with
   known violations: Calendar, Calendar Range, Splitter, Menu, File Upload (critical) and Tokens,
   Field, Input, Table, OTP Input, Pagination, Time Picker, Carousel, Tabs, Checkbox, Radio, Switch,
   Segmented (`empty-table-header`, `scrollable-region-focusable`, `label-title-only` or
   `aria-prohibited-attr`). Replacement pages: Breadcrumbs, Calendar, File Upload, Icon, Progress,
   Separator. A probe on 2026-09-30 also found violations on library routes the sweep does not include
   (`/icons`, `/card`, `/badge`, `/breadcrumbs`, `/group`). Owner: queue item 10.3, an accessibility
   remediation follow-up after Plan 10.2 (`accessibility-remediation.md`): critical routes first,
   lesser findings with their component slices. Not part of Plan 11 or 10.2.
3. **Axe rule exclusion**: only `color-contrast` is excluded, in both suites. The four rules the
   library suite used to exclude blanket-wide are now asserted per route (item 2). Owner: Plan 14
   re-enables `color-contrast` after the contrast work (`solid-shape-contrast-defect.md`).
4. **Time Picker Escape from inside the panel** loses focus to `<body>`. `test.fixme` in
   `tests/e2e/interaction-widgets.spec.ts`. Owner: queue item 10.3 (item 2).
5. **Field `required`** is not exposed to assistive technology. `test.fixme` in
   `tests/e2e/interaction.spec.ts`. Owner: Plan 19B, Phase B
   (`autofocus-and-base-input-directive.md`).
6. **Right-to-left** is unsupported in v2 and is documented as such (see the roadmap's Deferred Feature
   Scope). No primitive has direction-aware behavior (no `rtl`, `dir` or `Directionality` use under
   `projects/ui/src/lib`), so arrow-key direction in Tabs, Slider, Segmented, Tree and Splitter is
   untested because it is unimplemented. Only a layout smoke exists: no overflow and an open Select
   list stays on screen. The final v2 checklist confirms the statement is in the release docs.
7. **Touch**: real taps are covered for Select and Dialog (library suite) and Avatar, Slider and
   Tooltip (replacement pages). Accepted as representative coverage; Drawer, Menu, Popover, Combobox,
   pickers, Splitter and Carousel swipe have no touch check.
8. **SSR of date-dependent primitives**: the library suite checks server content and held hydration
   for 11 routes; the replacement suite checks 44 headings plus two held-hydration flows. Pickers that
   read the current date, OTP Input and Time Picker have no SSR check. Owner: Plan 12 (`ssr.md`
   Phase 2, "resolve locale/time/ID seeds consistently per request").
9. **CDN dependence**: default Lucide icons load from `cdn.jsdelivr.net`. Only three replacement
   specs stub it, so screenshots in the others need internet access. The harness allowance stops the
   console failure, not the missing pixels. Owner: Plan 20, extended to default content icons
   (`icon-architecture-v2-research.md`); the harness allowance is removed with it.
10. **No manual accessibility evidence**: no real keyboard-only or screen-reader session is recorded for
    any primitive. Scheduled at final v2 integration (`PLAN.md`); the assistive technology, browser and
    OS must be named. See [Accessibility Review Guide](accessibility.md).
11. **Chromium only**: Firefox and WebKit are not run. Accepted until release; the final v2 checklist
    adds WebKit and Firefox runs at release time.
12. **Hydration readiness** is inferred from behavior because the Playground exposes no marker.
    Owner: Plan 12 decides whether to add one (`ssr.md`, Phase 3).
13. **Dialog lifecycle on route change**: a dialog opened imperatively stays open after its opening
    route is destroyed, and `docs/dialog.md` does not say whether that is intended. A characterization
    test in `tests/e2e/interaction.spec.ts` only guarantees no error. Owner: Plan 12 (`ssr.md`,
    Phase 3); changing the contract needs a decision from Nikita.
14. **Legacy SSR server** (`projects/playground/src/server.ts`) serves no client scripts. The SSR gate
    uses `tools/serve-playground-ssr.mjs` instead; the app server itself is unchanged. Before Plan 11
    the suite ran against the app server, so its "hydrates without console errors" tests never
    hydrated anything. Informational; Plan 10.2 Phase B accounts for the server and this wrapper when
    it retires the legacy Playground.

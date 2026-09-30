# SSR, hydration and lifecycle register

Scope: `projects/ui/src/lib`, static sweep of 2026-09-30 on `release/2.x`. This is a file-level
inventory of every non-test source file that touches an environment-dependent API, plus the
behavior verified for the places that produced defects or decisions. It is not a per-line proof
that every remaining call is safe; entries marked "not analysed per call" still need that pass.

## Inventory by API

| API                     | Files                                                                                                                                                                                                                                                |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `window`                | `components/chart/chart-tooltip.util.ts`                                                                                                                                                                                                             |
| `document` / `DOCUMENT` | chart tooltip util, command palette, dialog and drawer services, dropdown, menu, number input, popover, slider, toast region and service, tooltip, `provide-kikita-ui.ts`, `provide-kui-theme.ts`, `utils/kui-floating-panel.util.ts`                |
| `navigator`             | `color-input` (EyeDropper feature test), `i18n/kui-locale.token.ts`                                                                                                                                                                                  |
| storage                 | none                                                                                                                                                                                                                                                 |
| observers               | `tabs` (`ResizeObserver`)                                                                                                                                                                                                                            |
| `requestAnimationFrame` | donut chart, segmented, tabs                                                                                                                                                                                                                         |
| timers                  | carousel, color input, combobox, dropdown-for, field, number input, popover, select, slider, time picker panel, toast region, tooltip                                                                                                                |
| random ids              | none (`Math.random` / `crypto` are not used)                                                                                                                                                                                                         |
| clocks                  | calendar, calendar range, date picker, time picker (format util, panel, directive), donut chart, toast region, calendar locale text, `kui-clock.service.ts`                                                                                          |
| platform hooks          | button, calendar, carousel, chart tooltip util, chip, color input, drawer container, option, group, icon button, link, number input, otp input, slider, splitter, tabs, time picker panel, toast region and service, tooltip, `kui-clock.service.ts` |

Not analysed per call: timer and observer cleanup on destroy for each file above, and the
document-level listeners of the overlay families. Existing cleanup tests are listed in
`docs/state-coverage.md`.

## Confirmed and fixed

| Defect                                                                                                            | Phase                           | Effect                                                                                                                                                                              | Fix                                                                                                                                                                                          | Evidence                                                                                                                            |
| ----------------------------------------------------------------------------------------------------------------- | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Module-level id counters in 23 components and directives                                                          | module evaluation, constructors | Server ids depended on how many requests the process had already served and never matched the browser's restarted counter. Two requests produced different HTML for the same route. | `KuiIdSequences` root `@Service`, per-application sequences (`utils/kui-id.util.ts`)                                                                                                         | `kui-id.util.spec.ts`; e2e "server-generated ids" (identical ids across requests and through hydration for carousel, chart, select) |
| `data-kui-scrollbars` set only in the browser                                                                     | app initializer                 | Server HTML lacked the global scrollbar mode.                                                                                                                                       | The initializer runs on both platforms through the injected `DOCUMENT`                                                                                                                       | `provide-kikita-ui.spec.ts` (server platform), e2e "server HTML already carries the global scrollbar mode"                          |
| Calendar, Calendar Range and Date Picker computed "today" and the initial month from `new Date()` while rendering | field initializers              | With a server day or time zone different from the browser's, hydration kept the server-set today class and added another, so two days were marked.                                  | `KuiClock` seeds the browser's first render from the server date through `TransferState`, then moves to the real date after the first render (stale seeds older than 10 minutes are ignored) | `kui-clock.service.spec.ts`; e2e "marks exactly the browser day after hydration" in UTC+14                                          |

Known limitation of the clock fix: the visible month stays the server's month after hydration, so a
page rendered just before a month boundary and hydrated just after it keeps showing the old month
until the user navigates.

## Decisions needed (contract is ambiguous; nothing invented)

1. **Default locale.** `KUI_LOCALE` reads `navigator.language`. Node defines `navigator`, so the
   server renders in the host locale and the browser hydrates in its own. Reproducer:
   `test.fixme` "renders the same calendar title on the server and in the browser" in
   `projects/kikita-ui-playground/e2e/ssr-hydration.spec.ts`. Options: (a) fixed `en-US` default
   with `kuiProvideLocale` for SSR apps, (b) seed the browser locale through `TransferState` and
   switch after render, (c) keep the behavior and document it.
2. **Dialog whose opener is destroyed.** An imperatively opened dialog outlives its route; the
   characterization test is in `tests/e2e/interaction.spec.ts`. Suggested contract: tie the dialog
   to the opener's `DestroyRef`, with an opt-out.
3. **Hydration readiness marker.** The Playground exposes none, so the harness proves hydration by
   switching the theme (`waitForShellHydration`). A stable marker such as `data-kui-hydrated`
   would remove that indirection.

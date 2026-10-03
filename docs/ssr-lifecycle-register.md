# SSR, hydration and lifecycle register

Scope: `projects/ui/src/lib`, sweep of 2026-09-30 on `release/2.x`. It has three parts: a file-level
inventory of every non-test source file that touches an environment-dependent API, a per-call
analysis of the timers, frames, observers and listeners in it, and the behavior verified for the
places that produced defects or decisions. The analysis covers each call site found by searching
for the APIs below; it is not a proof for code that reaches the environment indirectly through a
third-party API such as CDK.

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

The per-call analysis follows in "Per-call analysis". Existing cleanup tests are listed in
`docs/state-coverage.md`; the destroy and baseline checks are in
`projects/ui/src/lib/resource-lifecycle.spec.ts`.

## Per-call analysis

Columns: **Phase** is when the call runs; **Guard** is what keeps it off the server; **Hydration**
is the effect on the first client render; **Owner** is what releases the resource; **Test** is the
evidence. "RL" means a case in `resource-lifecycle.spec.ts`, which mounts the component, exercises
the resource, destroys it and expects the `document`/`window` listener ledger and the fake-timer
queue to return to the baseline.

### Timers

| Place                                        | Phase                                | Guard                            | Hydration                 | Owner and late-callback behavior                                                                                                                  | Test                         |
| -------------------------------------------- | ------------------------------------ | -------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| Carousel autoplay `setInterval`              | effect                               | `isBrowser`                      | none (no markup)          | effect cleanup and `DestroyRef`; no callback survives                                                                                             | RL carousel; unit specs      |
| Carousel scroll-sync and snap-restore timers | event handlers                       | handlers run in the browser      | none                      | cleared in `DestroyRef`; the `scrollend` listener is removed by `cancelPendingSnapRestore`                                                        | RL carousel; unit specs      |
| Color input tooltip hide (200 ms)            | event handler                        | browser-built DOM                | none                      | fires once and disposes an overlay ref (idempotent) after destroy                                                                                 | none needed                  |
| Combobox, Select, Dropdown-for, Field focus  | keydown handler, `setTimeout(0)`     | keydown only                     | none                      | not cancelled; after destroy the panel lookup returns `null` and the callback returns, so it is a harmless no-op                                  | RL dropdown trigger          |
| Number input press delay and repeat          | mousedown handler                    | browser-built DOM                | none                      | `ngOnDestroy` calls `_clearPress`; a held button cannot keep stepping                                                                             | RL number input              |
| Popover hover close timer                    | hover handler                        | handler                          | none                      | `ngOnDestroy` clears it                                                                                                                           | RL popover hover             |
| Popover focus-trap timer                     | open                                 | handler                          | none                      | not cancelled; queries the disposed overlay, finds nothing, no-op                                                                                 | RL popover trap              |
| Slider and Tooltip hide (200 ms)             | pointer handler, destroy             | browser-only handlers            | none                      | `ngOnDestroy` hides; the 200 ms timer only disposes an overlay ref                                                                                | RL slider, tooltip           |
| Time picker panel centering                  | constructor and dropdown-open effect | `isBrowser` inside the callback  | none (scroll offset only) | not cancelled; reads the detached host, finds nothing to center, no-op                                                                            | RL time picker panel         |
| Toast auto-dismiss                           | `addToast`                           | region exists only where mounted | none                      | `ngOnDestroy` clears every timer                                                                                                                  | RL toast                     |
| Toast close animation (200 ms)               | `dismiss`                            | as above                         | none                      | not cancelled on purpose: the timer removes the toast and completes `closed$` and `action$`, so a consumer waiting on a ref is never left hanging | RL toast close after destroy |

### Animation frames and observers

| Place                                     | Phase              | Guard                                             | Hydration                     | Owner and late-callback behavior                                | Test                  |
| ----------------------------------------- | ------------------ | ------------------------------------------------- | ----------------------------- | --------------------------------------------------------------- | --------------------- |
| Donut chart tween `requestAnimationFrame` | effect             | `typeof requestAnimationFrame` and reduced motion | the first render has no tween | `DestroyRef` cancels the frame                                  | RL donut chart        |
| Segmented and Tabs first-render frame     | `afterEveryRender` | render hooks run in the browser only              | none                          | one-shot; writes a style on the element after destroy, harmless | RL segmented and tabs |
| Tabs `ResizeObserver`                     | `afterNextRender`  | render hook                                       | none                          | `DestroyRef` disconnects                                        | RL tabs               |

### Document and window listeners

| Place                                                  | Phase             | Guard                           | Hydration | Owner                                                                               | Test                                                        |
| ------------------------------------------------------ | ----------------- | ------------------------------- | --------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Dropdown, Menu, Popover (`wireFloatingPanelDismissal`) | open              | opening needs a click or key    | none      | `_cleanup()` on close and `ngOnDestroy`; every open registers, every close releases | RL dropdown, menu, popover; open and close cycle; remount   |
| Tooltip document tap dismissal                         | touch tap         | handler                         | none      | `stopTapDismissal` from `hide()`, which `ngOnDestroy` calls                         | RL tooltip; tooltip spec                                    |
| Slider scroll tracking                                 | hover             | handler                         | none      | `stopScrollTracking` in `ngOnDestroy`                                               | RL slider                                                   |
| Chart tooltip `window` blur and document dismissal     | constructor, show | `isPlatformBrowser`             | none      | `destroy()` from each chart's `DestroyRef`                                          | RL donut chart (bar, line and scatter share the controller) |
| Command palette                                        | open              | the overlay exists once opened  | none      | `detachOverlay` in `ngOnDestroy`                                                    | RL command palette; unit specs                              |
| Color input pointer drag on `window`                   | pointerdown       | handler                         | none      | the drag abort runs in `ngOnDestroy`                                                | color input spec                                            |
| Dialog and Drawer services                             | imperative open   | `DOCUMENT` only inside handlers | none      | the overlay owns them; a dialog deliberately outlives its opener (decision 2)       | `route-teardown.spec.ts`                                    |

### Render-time environment

| Place                       | Phase               | Guard                                             | Hydration                                                                                   | Owner           | Test                                                                                   |
| --------------------------- | ------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------- | --------------- | -------------------------------------------------------------------------------------- |
| `provideKuiTheme`           | app initializer     | injected `DOCUMENT`, so it runs on both platforms | reuses the `<style id>` the server wrote, so no second sheet; `<head>` is outside hydration | the document    | `provide-kui-theme.spec.ts` (both platforms, style reuse); SSR e2e loads styled routes |
| Locale token                | first injection     | request `Accept-Language`, else `en-US`           | the browser reuses the transferred server value, so the first render matches (decision 1)   | `KUI_LOCALE`    | unit spec; `test.fixme` locale reproducer                                              |
| Icons and the icon registry | render              | no DOM access                                     | none; the registry data is static                                                           | none            | icon specs; SSR route loads                                                            |
| Splitter gutters            | `afterNextRender`   | render hook, so browser only                      | gutters are added after hydration; pane `flex-basis` is computed identically on both sides  | `DestroyRef`    | splitter spec; Splitter page SSR                                                       |
| Link and Button icon slots  | constructor effects | `isBrowser` early return                          | icon markup is inserted after hydration, never during it                                    | view container  | link and button specs; page SSR                                                        |
| Calendar family "today"     | field initializers  | `KuiClock`                                        | seeded from the server date, then the real date                                             | `TransferState` | `kui-clock.service.spec.ts`; e2e for Calendar, Calendar Range, Date Picker             |

### Findings

The per-call pass found no leaked listener, timer, observer or animation frame, and no late
callback that throws, in the components above. The destroy checks in `resource-lifecycle.spec.ts`
were proven able to fail by deleting the `ngOnDestroy` cleanup of Tooltip, Slider and Number input
in turn. Two facts are recorded as risks rather than defects:

- Dropdown-family panels finish closing on the `animationend` of their exit animation. The shipped
  CSS keeps that animation under reduced motion (0.01 ms), but a consumer stylesheet that removes it
  would leave the panel in its closing state. Not reproduced with the library CSS; no change made.
- The 0 ms focus timers and the Toast close timer are not cancelled on destroy. They are no-ops or
  complete pending refs, so cancelling them would be a behavior change with no user benefit.

## Confirmed and fixed

| Defect                                                                                                            | Phase                           | Effect                                                                                                                                                                              | Fix                                                                                                                                                                                          | Evidence                                                                                                                            |
| ----------------------------------------------------------------------------------------------------------------- | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Module-level id counters in 23 components and directives                                                          | module evaluation, constructors | Server ids depended on how many requests the process had already served and never matched the browser's restarted counter. Two requests produced different HTML for the same route. | `KuiIdSequences` root `@Service`, per-application sequences (`utils/kui-id.util.ts`)                                                                                                         | `kui-id.util.spec.ts`; e2e "server-generated ids" (identical ids across requests and through hydration for carousel, chart, select) |
| `data-kui-scrollbars` set only in the browser                                                                     | app initializer                 | Server HTML lacked the global scrollbar mode.                                                                                                                                       | The initializer runs on both platforms through the injected `DOCUMENT`                                                                                                                       | `provide-kikita-ui.spec.ts` (server platform), e2e "server HTML already carries the global scrollbar mode"                          |
| `data-kui-density` and the layered theme style (a rule of the design, not a fixed defect)                         | app initializer                 | A density or theme chosen only in the browser would change padding and colours after hydration.                                                                                     | `provideKuiTheme` sets the attribute and installs the style through the injected `DOCUMENT` on both platforms                                                                                | `provide-kui-theme.spec.ts` (server platform), e2e "server HTML already carries the density and the layered theme"                  |
| Calendar, Calendar Range and Date Picker computed "today" and the initial month from `new Date()` while rendering | field initializers              | With a server day or time zone different from the browser's, hydration kept the server-set today class and added another, so two days were marked.                                  | `KuiClock` seeds the browser's first render from the server date through `TransferState`, then moves to the real date after the first render (stale seeds older than 10 minutes are ignored) | `kui-clock.service.spec.ts`; e2e "marks exactly the browser day after hydration" in UTC+14                                          |

The visible month and the focused day follow the same rule: the server's values are shown first,
then, after the first browser render, they move to the browser's date, but only while they are still
the untouched seeded values (`KuiClock.followBrowserDate`). A month the app bound or the user
navigated is never overwritten. This was found by the Calendar visual suite, which freezes the
browser clock in another month than the server's and showed the server's month after the first
version of the clock fix.

## Decisions taken

1. **Locale.** `KUI_LOCALE` is resolved from the request's `Accept-Language` header (Angular's
   `REQUEST` token) on the server, with `en-US` when there is no request (prerendering) or no usable
   header. It never reads the host's `navigator`, so output does not depend on the machine. The
   server stores the value in `TransferState` and the browser's first render reuses it, so the
   server HTML and the hydrated DOM agree for every language; a client-only app still follows
   `navigator.language`. The header is untrusted, so tags are canonicalized with
   `Intl.getCanonicalLocales` and malformed ones are ignored. Server responses now vary by
   `Accept-Language`: a cache in front of the server must send `Vary: Accept-Language`, and an app
   that wants one fixed locale provides it with `kuiProvideLocale`. Evidence: `kui-locale.token.spec.ts`,
   `kui-locale-seed.util.spec.ts`, and the e2e "renders the request language on the server and keeps
   it through hydration" (de-DE). This replaces the earlier interim rule that the server always
   rendered `en-US`. Since Plan 21 components read the effective locale through `KuiI18n`, which
   checks the tag against the runtime's `Intl` (an unsupported language falls back to `en-US`, never
   to the host's default locale) and keeps every formatter cache in the injector. The calendar-name
   cache that used to live in module scope grew with each distinct request locale; it is gone.
2. **Dialog whose opener is destroyed.** Kept as is and now documented: a dialog belongs to the
   application overlay and outlives the component that opened it, because confirmations are
   commonly opened from route guards and other short-lived callers. Closing is explicit (result,
   Escape, backdrop, close button). Callers unsubscribe from the result with `takeUntilDestroyed`.
   The characterization test is in the Playground's `route-teardown.spec.ts`.
3. **Hydration readiness marker.** Not added. It would be public Playground behavior with no user
   value; `waitForShellHydration` proves hydration by a client-only action and stays the harness's
   single readiness check.

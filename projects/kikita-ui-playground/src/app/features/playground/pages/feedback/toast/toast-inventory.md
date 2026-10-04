# Toast Contract Inventory

This inventory maps the public Toast service contract to the page's real examples. Toast is an
imperative service that creates a viewport region only after a browser call; the visible samples
are opened by named native buttons so the initial server render remains safe.

## Public API and defaults

There are no Toast component inputs, outputs, or models. The public API is `kuiToast()`,
`KuiToastService`, `provideKuiToastOptions()`, and the `KuiToastAppearance`, `KuiToastConfig`,
`KuiToastOptions`, `KuiToastPosition`, and `KuiToastRef` types. `KuiToastRegionComponent` is internal. The public component and root barrels re-export the supported
symbols.

| Contract item                                  | Type and resolution                                                                                                                                                                                                                                                                     | Visible page coverage                                                                                                                                                                                                                                                                                                 |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `title`                                        | Required `string`.                                                                                                                                                                                                                                                                      | Minimal default opens `{ title }`; named examples use localized titles.                                                                                                                                                                                                                                               |
| `message`                                      | Optional `string`.                                                                                                                                                                                                                                                                      | Default is title-only; the content example opens a translated title and wrapping supporting message.                                                                                                                                                                                                                  |
| `appearance`                                   | One of `neutral`, `success`, `warning`, `danger`, or `info`; default `neutral`. Accent and icon colors come from shipped Toast CSS and semantic tokens.                                                                                                                                 | Controls open each supported value. Neutral is the minimal default; update changes an info toast to success.                                                                                                                                                                                                          |
| `actionLabel`                                  | Optional `string`; its button emits through `KuiToastRef.action$`.                                                                                                                                                                                                                      | The action example opens a persistent toast with an Undo button; keyboard activation updates a visible consumer result.                                                                                                                                                                                               |
| `duration`                                     | Optional milliseconds. Effective default is `options.duration ?? 5000`; `Infinity` keeps the toast persistent only when `persistent` is not explicitly false. Finite values are clamped to at least zero for the timer; non-finite duration resolves to 5000 when a timer is scheduled. | Minimal default verifies no progress bar is shown and uses fake time to confirm the default 5000ms auto-dismiss; progress and lifecycle cases use fixed longer durations; capacity examples use `Infinity`. The `persistent: false` plus `Infinity` edge is documented below and omitted as a misleading combination. |
| `persistent`                                   | Optional `boolean` or `Signal<boolean>`, default false. `true` pauses auto-dismiss; a signal can release into the configured timer.                                                                                                                                                     | Signal lifecycle opens persistent, releases persistence, then updates to a timed success toast. `duration: Infinity` is used for eviction samples.                                                                                                                                                                    |
| `closable`                                     | Optional `boolean`, default true.                                                                                                                                                                                                                                                       | Default/appearance samples keep the close button; the no-close sample sets `false` and exposes a separate reference-close button.                                                                                                                                                                                     |
| `showIcon`                                     | Optional `boolean`, default true. Neutral has no icon even when true.                                                                                                                                                                                                                   | Appearance samples show source-owned icons where supported; success without icon demonstrates `false`. Neutral with `true` is omitted because it is visually identical to the default.                                                                                                                                |
| `showProgress`                                 | Optional `boolean`, default false. It renders only for a non-persistent toast.                                                                                                                                                                                                          | Timed progress example plus signal release/update show the bar. E2E asserts the Signal-backed toast has no bar while persistent and shows it after release. Hovering the timed toast pauses/resumes the actual timer and bar. Persistent with progress is omitted because the bar is hidden while persistent.         |
| `position`                                     | Global `KuiToastOptions` value; six combinations of `top` or `bottom` with `start`, `center`, or `end`; default `bottom-center`. `setPosition()` updates the running region.                                                                                                            | Position controls use the public service method and open one persistent toast at each location. The default shows bottom-center.                                                                                                                                                                                      |
| `duration` option                              | Global default duration, default 5000ms; per-call `config.duration` wins.                                                                                                                                                                                                               | Minimal sample omits it; timed examples supply per-call durations. Provider-only overrides are not configured by this page.                                                                                                                                                                                           |
| `maxVisible` option                            | Maximum active toasts, default 3; adding another dismisses the oldest active toast.                                                                                                                                                                                                     | Four-toasts scenario confirms the first item leaves and the last three remain. A larger simultaneous appearance matrix is omitted because it would change the default being demonstrated.                                                                                                                             |
| `showProgress`, `closable`, `showIcon` options | Each option supplies the corresponding default (`false`, `true`, `true`) before per-call config wins.                                                                                                                                                                                   | Minimal and appearance examples exercise the defaults; option overrides are demonstrated through per-call config. App-wide provider-only overrides are omitted because the route does not own the root injector.                                                                                                      |
| `provideKuiToastOptions(options)`              | Public helper for position, duration, visible capacity, progress, closability, and icon defaults in the current injector scope.                                                                                                                                                         | Not configured by the page: it cannot alter the app-wide provider without changing shared shell behavior. Per-call behaviors demonstrate the corresponding options where safe to override.                                                                                                                            |
| `KuiToastService.open(config)`                 | Creates a toast and returns `KuiToastRef`; on the server it returns id `-1` with no-op methods and empty observables.                                                                                                                                                                   | All live examples open through `kuiToast()`; SSR check confirms no server region and a working client toast.                                                                                                                                                                                                          |
| `KuiToastService.setPosition(position)`        | Public position setter for the live region.                                                                                                                                                                                                                                             | Position catalogue moves a single open region through all six supported values.                                                                                                                                                                                                                                       |
| `KuiToastRef.id`                               | Stable number within the owning service.                                                                                                                                                                                                                                                | Dismiss-by-id button closes the active lifecycle sample. The numeric value is not rendered because it has no visual contract.                                                                                                                                                                                         |
| `KuiToastRef.close()`                          | Starts the exit lifecycle; the toast is removed after 200ms.                                                                                                                                                                                                                            | Tracked ref close and non-closable programmatic close examples.                                                                                                                                                                                                                                                       |
| `KuiToastRef.update()`                         | Merges a partial config in place and re-evaluates timer state.                                                                                                                                                                                                                          | Lifecycle example updates title, message, appearance, persistence, duration, and progress from sync/info to success.                                                                                                                                                                                                  |
| `closed$`                                      | Emits once after removal and completes.                                                                                                                                                                                                                                                 | The non-closable and lifecycle examples display a translated completion result after reference close.                                                                                                                                                                                                                 |
| `action$`                                      | Emits on action-button activation and completes when the toast closes.                                                                                                                                                                                                                  | Action example uses keyboard Enter and reports the event while leaving the toast open. Repeated clicks are possible in source.                                                                                                                                                                                        |
| `KuiToastService.dismiss(id)` / `dismissAll()` | Dismiss one toast by id or all toasts owned by the service.                                                                                                                                                                                                                             | Tracked-by-id and dismiss-all buttons; dismiss-all is also the cleanup step after the capacity sample.                                                                                                                                                                                                                |
| `kuiToast()`                                   | Injection-context helper returning the service.                                                                                                                                                                                                                                         | All service calls originate in page-private components during injection.                                                                                                                                                                                                                                              |

## Rendered behavior and accessibility

- The service lazily creates a single fixed region in `document.body` after the first browser `open()`.
  The outer element has `role="region"`, the accessible name “Notifications”, and polite live
  semantics. Each child toast is atomic; non-danger toasts use `role="status"`/polite and danger
  uses `role="alert"`/assertive. The page tests the role and live value with public controls.
- Appearance icons are decorative. Native action and close buttons are keyboard reachable. Toast
  appearance does not move focus or trap it; the default interaction checks focus remains on the
  invoking button. There is no Toast-owned Escape behavior. The region name “Notifications” and
  close-button name “Close” are hardcoded in library source with no localization API. The close
  target is library-owned at 20×20px, below the Playground's 44×44px touch-target guideline; this
  page records that limitation rather than overriding Toast styling.
- Page-owned action and close results use native paragraph semantics with `role="status"`, so
  consumer feedback is announced independently from the Toast live region.
- Toast hover pauses its timer and progress animation; pointer leave resumes with the remaining
  delay. The progress example uses a real hover interaction and fake-clock assertions that a full
  duration does not dismiss while hovered, then the toast expires after its remaining duration
  following pointer leave. The page does not simulate hover or focus using custom styles.
- Stack order depends on position: top stacks downward and bottom stacks upward. Because new
  items append to the list, the oldest still-visible toast stays nearest the viewport edge in both
  cases. The position catalogue opens one toast at a time. A dense stack of all appearances is
  omitted because the default cap is three.
- At widths up to 480px the Toast region is inset on both horizontal sides and stretches cards.
  Its selected vertical edge remains in effect (`top` stays at the top and `bottom` stays at the
  bottom); only horizontal alignment collapses. The visual spec captures all six positions on
  desktop and captures the distinct top and bottom mobile placements at 320px, alongside toast
  bounds and page-overflow assertions.
- Toast has no browser DOM in server markup. `open()` on the server returns id `-1`, no-op methods,
  and empty observables. This page does not call `open()` during server rendering, so the SSR check
  does not exercise that server-only return value. It asserts that the server response has the page
  heading and no toast region, then verifies a client-side toast after hydration; direct server
  `open()` behavior remains covered only by source/unit evidence, not this page.
- The page styles only arrange examples with Kikita spacing tokens. Shipped Toast CSS owns colors,
  surface, icons, sizing, placement, reduced-motion behavior, and animation.
- The Toast service is application-scoped and its region is mounted in `document.body`. When the
  route is destroyed, the page dismisses all page-owned notifications and the position example
  restores `bottom-center` if it changed the global region position. The browser spec verifies both
  effects by navigating to another component route while a persistent position toast is open.

## Source audit and discrepancies

- Public exports and types: `projects/ui/src/lib/components/toast/index.ts`,
  `projects/ui/src/lib/components/index.ts`, `projects/ui/src/public-api.ts`,
  `projects/ui/src/lib/components/toast/kui-toast.types.ts`.
- Service resolution and SSR boundary: `projects/ui/src/lib/components/toast/kui-toast.service.ts`.
- Region roles, icons, timers, eviction, update, and close lifecycle:
  `projects/ui/src/lib/components/toast/kui-toast-region.component.ts`.
- Defaults and provider: `projects/ui/src/lib/components/toast/kui-toast.token.ts`.
- Consumer documentation and tokens: `docs/toast.md`, `projects/ui/src/lib/components/toast/kui-toast.css`, and
  `projects/ui/src/lib/theme/create-kui-theme.ts`.
- Existing unit evidence: `projects/ui/src/lib/components/toast/kui-toast-region.component.spec.ts`
  covers status/alert roles, persistent close, signal release, update, `Infinity`, hover pause/resume,
  and dismiss-all. `kui-toast.service.spec.ts` covers dismiss-by-id and dismiss-all. There is no
  existing replacement Playground Toast route/spec or Toast scope catalogue. The old
  `projects/playground/src/app/pages/toast/` is a separate legacy app.
- `docs/toast.md` describes a polite live region, but implementation also gives each danger toast
  assertive alert semantics; this is covered by the unit spec and `docs/accessibility.md` severity
  guidance. The page checks that current source behavior without modifying the library.
- `docs/toast.md` says mobile ignores the position side and aligns at the bottom. Shipped CSS only
  overrides horizontal alignment at 480px and preserves the selected top/bottom edge; the page
  tests that source behavior rather than repeating the stale documentation claim.
- `docs/toast.md` says the newest toast is closest to the viewport edge for bottom positions. The
  region appends notifications and uses `column-reverse`, so the oldest still-visible toast remains
  closest to the bottom edge; the capacity scenario asserts the rendered order through accessible
  status roles and their geometry. This page records shipped behavior without changing library code.
- `KuiToastService.setPosition()` is a public JSDoc method (`kui-toast.service.ts`) but is absent
  from the API tables in `docs/toast.md`. Position controls use it as shipped.
- The `KuiToastRef.action$` JSDoc/docs describe a single emission; source calls `next()` on every
  action click and completes only when the toast is dismissed. The page presents a real action
  result and does not claim automatic close or one-shot enforcement.
- The `duration: Infinity` docs/comment say it keeps the toast open, but source gives an explicit
  `persistent: false` precedence over that rule; that combination then schedules the fallback
  5000ms timer. The page omits that contradictory combination.
- `maxVisible` has no range validation; zero or negative values are not meaningful supported
  configurations and are omitted. No component stylesheet or library source was changed.

`docs/design-provenance.md` has no Toast-specific approved visual record. The page follows the
parent-approved scope: preserve the already shipped Toast appearance and use the agreed
`PlaygroundExampleCard` layout without changing or inventing Toast styling.

## Browser evidence coverage

| Catalogue section   | Desktop evidence                                                   | 320px evidence                                                                                                   |
| ------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| Default             | Neutral toast in dark and light themes                             | Minimal neutral toast                                                                                            |
| Appearances         | Neutral, success, warning, danger, and info                        | Each of the five appearances                                                                                     |
| Content and options | Message, action, hidden icon, no close button, timed progress      | The same five states; progress is paused by real hover                                                           |
| Positions           | All six positions                                                  | Viewport captures show top and bottom placements; horizontal alignment is intentionally collapsed by shipped CSS |
| Lifecycle           | Signal-persistent state, update, and three-visible eviction result | Signal-persistent state, update, and the full page viewport with the three-toast stack                           |

The spec also exercises the mobile position controls and asserts the Toast region remains inside
the 16px viewport insets with no document-level horizontal overflow.

Verification 2026-09-28: the mobile placement test was flaky for two reasons. The shell header
theme icon is fetched from the jsDelivr CDN at runtime and raced page-level captures, and a click
on a not-yet-stable button retried with Playwright's forced scroll alignments, leaving the shell
workspace at an arbitrary offset. The spec now serves the shell's Lucide icons from verbatim
`lucide-static@*` fixtures (the default set is read at a pinned version), waits for every `kui-icon` to render before page captures, and pins
the workspace scroll before every capture. The `toast-persistent-signal-320` and
`toast-reference-update-320` baselines were regenerated after a pixel diff showed only the single
page row behind each toast's fractional box changed; the toast content is identical. With a fresh
`dist/kikita-ui-playground` build, the mobile placement test passed 10/10 with `--repeat-each=10`
and the full Toast spec passed 60/60 with `--repeat-each=5 --workers=1`. Only the changed captures
and the failing `toast-position-bottom-320` artifacts were visually inspected in that pass; this
does not replace the parent-owned full Playground gate.

## Self-review checklist

- [x] Every public config field, option, service method, reference member, type domain, and default is mapped above.
- [x] The page includes a minimal `{ title }` default and the appearance, content, option, position, stack, and lifecycle cases supported by Toast.
- [x] Every omitted combination has a concrete reason: neutral icon is visually suppressed; provider-only options have no route-owned provider surface; only horizontal position distinctions collapse on mobile; larger stacks would override the default cap; persistent progress is hidden; non-finite/invalid cases are not useful supported configurations.
- [x] Action, timer, signal, close, update, dismissal, eviction, keyboard, focus, and position interactions use the public service API.
- [x] Page copy uses the Toast locale scope; Toast button naming remains owned by library source.
- [x] Layout CSS uses Kikita spacing tokens and does not restyle Toast.
- [x] Parent added the Feedback Toast route, scope provider, and shared SSR route registration.
- [x] Route teardown dismisses page-owned notifications and restores the global position example;
      the navigation behavior has a dedicated E2E scenario.
- [x] The 12-test visual spec, including the new 320px captures for every named catalogue section, passes in the parent-owned Playwright gate.
- [x] The generated desktop and 320px screenshots have been opened and visually inspected for clipping, overlap, overflow, and stale baselines.
- [x] SSR/hydration and route teardown checks have been rerun and pass in the parent-owned browser gate.
- [ ] Independent accessibility/assistive-technology review remains pending; this page checks DOM roles and keyboard interaction only.

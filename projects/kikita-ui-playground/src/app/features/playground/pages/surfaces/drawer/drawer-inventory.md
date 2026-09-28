# Drawer page contract inventory

This page follows the reviewed contract for docs/drawer.md, the public Drawer exports and types,
kuiDrawer(), its CDK overlay service and container, the container/ref unit specs, and
projects/ui/src/styles/drawer.css. Drawer is an imperative overlay API. The page uses a private
typed host component and does not invent component inputs, outputs, or projection slots.

## Public contract map

| Public contract               | Type, default, or resolution                                                                                                                                                                                                                                                                                                                                                                                       | Page example and browser evidence                                                                                                               |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| kuiDrawer(component, config?) | Called in an injection context; returns an opener (data) => Observable<Result \| undefined>.                                                                                                                                                                                                                                                                                                                       | Placement, sizes, content, and dismissal groups open the page-owned host through typed openers.                                                 |
| KuiDrawerConfig.data          | Optional TData; passed as the opener argument and defaults to undefined at the service boundary.                                                                                                                                                                                                                                                                                                                   | Seeded TCK-1042 metadata appears in the default drawer.                                                                                         |
| side                          | 'right' \| 'left' \| 'bottom' \| 'top'; default 'right'.                                                                                                                                                                                                                                                                                                                                                           | Default right/md and each other side are opened; E2E checks data-kui-side.                                                                      |
| size                          | 'sm' \| 'md' \| 'lg' \| 'full' \| 'auto'; default 'md'. Horizontal sides size by width and vertical sides by height.                                                                                                                                                                                                                                                                                               | All five presets are opened on right and bottom; E2E checks data-kui-size and viewport bounds.                                                  |
| closeOnBackdropClick          | Boolean; default true; only a pointer interaction that starts on the backdrop dismisses.                                                                                                                                                                                                                                                                                                                           | Default and no-close-button cases dismiss by backdrop; disabled and locked cases stay open.                                                     |
| closeOnEscape                 | Boolean; default true; the service stops propagation when it handles Escape.                                                                                                                                                                                                                                                                                                                                       | Default case closes; disabled and locked cases stay open; focus returns after close.                                                            |
| closable                      | Boolean; default true; controls the container-owned top-right close button independently of other dismissal settings.                                                                                                                                                                                                                                                                                              | Default shows the button; the no-close-button and locked cases omit it.                                                                         |
| KuiDrawerHost<TResult, TData> | Custom component exposes public readonly drawerContext.                                                                                                                                                                                                                                                                                                                                                            | DrawerExampleContent implements the host contract with DrawerExampleData and DrawerExampleResult.                                               |
| KuiDrawerContext              | Exposes readonly data, resolved side, size, closable, and close(result?).                                                                                                                                                                                                                                                                                                                                          | Host shows seeded data, translated side/size values, and the resolved close-button flag; footer actions resolve saved, cancelled, or continued. |
| Opener result                 | One-shot Observable<TResult \| undefined>; close result is emitted after the exit animation, then the observable completes. Built-in close, Escape, and backdrop close with undefined.                                                                                                                                                                                                                             | Each group announces saved/cancelled/dismissed outcomes in a role=status region.                                                                |
| KuiDrawerRef<TResult>         | Exported class with afterClosed(); the public kuiDrawer() factory returns an Observable rather than this ref.                                                                                                                                                                                                                                                                                                      | Recorded here; no page example claims the ref is returned by kuiDrawer().                                                                       |
| Content structure             | The host supplies optional .kui-drawer-header, .kui-drawer-title, .kui-drawer-subtitle, .kui-drawer-body, and .kui-drawer-footer; the container supplies backdrop, panel, and close button. There are no component slots. The implementation mounts the host with ComponentPortal through CdkPortalOutlet; docs describe the content as “projected here,” which is wording rather than Angular content projection. | Private host uses the documented CSS structure and leaves .kui-drawer-close to the library.                                                     |
| Public outputs / models       | None; this is an injection-function/host-context API.                                                                                                                                                                                                                                                                                                                                                              | The page observes the opener Observable, not a component output or open model.                                                                  |

## States and behavior

| State or edge case        | Page mapping                                                                                                                                                                                                                     | Browser evidence                                                                                                                              |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Minimal configuration     | kuiDrawer(DrawerExampleContent) omits every config option and opens right/md.                                                                                                                                                    | Default trigger checks resolved side and size, content data, close button, dialog semantics, focus containment, and focus restoration.        |
| Every side                | Right is the minimally configured default; left, top, and bottom use explicit side values.                                                                                                                                       | Named triggers open each edge.                                                                                                                |
| Every size                | sm, md, lg, full, and auto are shown on right and bottom to expose width-vs-height sizing.                                                                                                                                       | E2E opens each pairing, checks resolved attributes, and checks auto minimum bounds. Responsive bounds are checked for default and full sizes. |
| Auto size                 | Left/right auto width has a 320px minimum; top/bottom auto height has a 200px minimum.                                                                                                                                           | Right and bottom auto examples assert the documented minimum geometry.                                                                        |
| Close button hidden only  | closable: false, with default Escape/backdrop behavior.                                                                                                                                                                          | E2E verifies no Close button and confirms Escape and backdrop still close.                                                                    |
| Escape disabled only      | closeOnEscape: false, with default close button and backdrop behavior.                                                                                                                                                           | E2E confirms Escape leaves it open and backdrop closes it.                                                                                    |
| Backdrop disabled only    | closeOnBackdropClick: false, with default close button and Escape behavior.                                                                                                                                                      | E2E confirms backdrop leaves it open and Escape closes it.                                                                                    |
| Locked drawer             | closable: false, closeOnEscape: false, and closeOnBackdropClick: false.                                                                                                                                                          | E2E verifies all three dismissal methods stay disabled and the in-drawer Continue action resolves the result.                                 |
| Backdrop drag boundary    | Container tracks whether pointerdown began on the backdrop; starting inside the panel should not dismiss when a drag ends outside.                                                                                               | Browser scenario checks a panel-to-backdrop drag; unit test covers the underlying pointer-start distinction.                                  |
| Long title                | sm right drawer with documented header/title classes and auto close button.                                                                                                                                                      | E2E checks title and close button do not overlap.                                                                                             |
| Missing title             | Host omits .kui-drawer-title; container keeps fallback aria-label=\"Drawer\".                                                                                                                                                    | E2E checks the fallback accessible name.                                                                                                      |
| Long body                 | Fixed translated copy fills the body beyond available vertical space.                                                                                                                                                            | E2E checks .kui-drawer-body scrolls internally while the footer remains visible.                                                              |
| Modal semantics and focus | Container renders role=dialog and aria-modal=true, traps/autocaptures focus, labels from .kui-drawer-title when present, and restores the opener if it remains connected.                                                        | E2E checks title and fallback names, focus containment while tabbing, and focus restoration.                                                  |
| Close lifecycle           | Container closes once, waits for kui-drawer-out-\* animationend, emits its result, then service detaches/disposes the overlay.                                                                                                   | E2E waits for overlay removal and checks result status.                                                                                       |
| Reduced motion            | Drawer/backdrop animations use 1ms duration under prefers-reduced-motion.                                                                                                                                                        | E2E checks computed duration; no local motion override is added.                                                                              |
| Responsive geometry       | Left/right panels clamp to 100vw; top/bottom panels clamp to 100vh; body overflow remains internal.                                                                                                                              | E2E checks document-level horizontal overflow and opened side/full drawers at 768px and 320px, including bottom/full viewport bounds.         |
| SSR and hydration         | kuiDrawer() is created with the page, but the overlay is attached only after an opener is called. The service injects Angular DOCUMENT; open() reads its active element, and the container performs portal DOM work when opened. | E2E checks server HTML and initial hydrated page contain no overlay, then opens/closes after hydration with no console errors.                |

## Known limits and unsupported cases

- Drawer has no public component open input/model, outputs, template slots, arbitrary width/height config,
  loading state, or built-in navigation/content behavior. None are represented as Drawer API.
- The public docs and types agree on config values/defaults. The exported KuiDrawerRef is not the
  result of kuiDrawer(); the low-level service is internal.
- The container labels the dialog from its title or fallback but does not configure
  `aria-describedby` or automatically associate `.kui-drawer-body` as its description. The public
  config has no description relationship option, so consumers should not assume body copy is
  announced as the dialog description.
- The library close button's accessible label (Close) and untitled-panel fallback name (Drawer) are
  hard-coded English. There is no locale input/configuration for these strings. The page translates
  its own controls/content and tests the library strings honestly in Russian mode.
- Source provides a focus trap and restores focus, but does not itself set the background inert. The
  page does not claim background inertness or complete assistive-technology verification.
- The library close target is 28px square in create-kui-theme.ts, below this app's 44px touch-target
  guidance. The page leaves the library visual unchanged and records the inherited limitation.
- The unit specs cover close-button rendering, close-animation start, backdrop-start handling, and
  afterClosed() emission/completion. They do not test service configuration resolution, focus,
  accessible naming, or SSR.
- Nested/concurrent drawers and host components with their own legacy .kui-drawer-close are not
  consumer examples; the latter is a compatibility branch in the container, not a recommended
  composition.

## Locale keys

The page copy lives in the drawer scope with matching English and Russian key paths:

- The title, examples, and accessibility keys identify the page, cards, and named groups.
- The actions keys label every trigger and page-owned footer action.
- The labels keys provide custom host content, reference metadata, and long-body copy.
- The values.sides and values.sizes keys translate the resolved context values shown in the drawer.
- The status keys report close outcomes through live status regions.

Example components retain the result as a status key and render it with TranslocoPipe, so a visible
result updates when the runtime locale changes. This does not localize the library-owned Close or
untitled fallback labels.

The library-owned Close and untitled fallback Drawer labels remain English in both languages.

## Page and browser ownership

Owned page files are this directory and its private components/, helpers/, and types/ folders;
the locale files are projects/kikita-ui-playground/public/i18n/drawer/{en,ru}.json. The E2E spec is
projects/kikita-ui-playground/e2e/drawer-playground.visual.spec.ts; its 28 named desktop, tablet,
mobile, and open-panel screenshot baselines have passed comparison and visual review. Route, lazy
locale scope, and SSR integration are verified by the page-owned browser suite. This page does not
modify the Surfaces route fragment, sidebar, global page registry, SSR registry, or state tracker.

Verification 2026-09-28: the side-placement capture failed once in the full serial Playground gate.
The trace showed the left panel captured about 20ms after its click, while the composited 280ms
slide-in was still running. Playwright's `animations: 'disabled'` finished the animation, and the
layout box used for the crop was already final (480px at x=0). However, Chromium kept painting the
panel about 323px to the left, and two captures 230ms apart were identical. Icons, locale loading,
and the previous drawer were ruled out: the close icon is inline SVG, the text matched, and the
previous dialog was detached before the click. The spec now waits for every finite panel and
backdrop entrance animation to finish naturally before each open-panel capture. The original
test did not reproduce in isolation (20/20 passed); the fixed test passed 20/20 with
`--repeat-each=20 --workers=1`, and the whole Drawer suite passed 14/14 without baseline changes.

## Self-review checklist

- [x] Parent reviewed the source-backed Drawer audit before implementation.
- [x] The visible catalogue has a minimally configured default, all sides, and every size on horizontal and vertical edges.
- [x] Context data/result, close-button visibility, Escape, backdrop, locked action, long title, untitled fallback, and internal body scroll have real interactions.
- [x] All page-owned labels and group names use matching English/Russian scope keys.
- [x] Page styles control layout only; Drawer appearance comes from library styles and tokens.
- [x] E2E source uses named groups and accessible trigger/dialog roles and includes responsive, focus, dismissal, runtime locale-change, and SSR scenarios.
- [x] Parent route/scope integration is verified by the direct route, runtime locale switch, and SSR tests.
- [x] Parent verification: scoped lint, format, Playground production build, all 14 E2E/SSR tests, and review of all 28 screenshot baselines passed.
- [x] Manual screen-reader, contrast, and forced-colors review is explicitly not claimed; the inherited 28px close target and hard-coded English library labels remain documented limitations.

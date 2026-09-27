# Dialog page contract inventory

This page follows the accepted source-backed audit for `docs/dialog.md`, the public Dialog
types and context, `kuiDialog()` / `kuiConfirm()`, the CDK container and service, unit tests,
and `projects/ui/src/styles/dialog.css`. The Dialog page is an imperative consumer showcase:
it does not invent component inputs, outputs, or Angular projection slots.

## Public contract map

| Public contract                                                 | Type, default, or resolution                                                                                                                                                                                                                          | Page example and verification                                                                                                                                                                          |
| --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `kuiDialog(component, config?)`                                 | Created in an injection context; returns `(data) => Observable<TResult \| undefined>`. The public opener receives `data` as its function argument.                                                                                                    | Size and appearance groups open the page-owned content component with typed data.                                                                                                                      |
| `InferDialogData<TComponent>` / `InferDialogResult<TComponent>` | Exported conditional types that infer the data and result types from a component's `KuiDialogHost` contract; compile-time only.                                                                                                                       | The page's `kuiDialog(DialogExampleContent)` openers use the inferred types; there is no separate runtime or visual state to demonstrate.                                                              |
| `KuiDialogHost<TResult, TData>`                                 | Custom content exposes public readonly `dialogContext`.                                                                                                                                                                                               | Shared private `DialogExampleContent` implements the host contract.                                                                                                                                    |
| `dialogContext.data`                                            | `TData` supplied to the opener function; service config `data` is optional and defaults to `undefined`.                                                                                                                                               | Titles, body copy, and action labels are passed to the custom content.                                                                                                                                 |
| `dialogContext.close(result?)`                                  | Resolves the close result after the exit animation; built-in close, Escape, and backdrop close resolve `undefined`.                                                                                                                                   | Footer actions resolve `saved` or `cancelled`; result text appears in a live status.                                                                                                                   |
| `dialogContext.closable`                                        | Boolean mirroring `config.closable`; informational for custom layout.                                                                                                                                                                                 | The `closable: false` example verifies that the container omits its close button.                                                                                                                      |
| `dialogContext.appearance`                                      | `default \| danger \| warning`, mirroring config.                                                                                                                                                                                                     | Appearance examples render the optional icon so the token-driven icon color is visible.                                                                                                                |
| `KuiDialogConfig.size`                                          | `auto \| sm \| md \| lg \| fullscreen`; default `md`. Presets are auto/min-width 320px, 400px, 560px, 720px, or viewport-filling fullscreen.                                                                                                          | Size group includes the minimally configured default and every explicit size. The source docs now list fullscreen; the shared `docs/state-coverage.md` row still omits it.                             |
| `KuiDialogConfig.appearance`                                    | `default \| danger \| warning`; default `default`. It changes `.kui-dialog-icon` color, not the panel.                                                                                                                                                | Default, danger, and warning examples include an actual icon.                                                                                                                                          |
| `KuiDialogConfig.dismissable`                                   | Boolean; default `true`. Controls Escape and backdrop dismissal.                                                                                                                                                                                      | The default and `closable: false` examples dismiss through Escape/backdrop; the locked example stays open until an action.                                                                             |
| `KuiDialogConfig.closable`                                      | Boolean; default `true`. Controls the automatically rendered close button independently of `dismissable`.                                                                                                                                             | Default close button and `closable: false` examples; E2E checks the latter still accepts Escape/backdrop.                                                                                              |
| Content anatomy                                                 | CSS class hooks: `.kui-dialog-header`, `.kui-dialog-title`, optional `.kui-dialog-icon`, `.kui-dialog-body`, `.kui-dialog-footer`. Content is attached as a component portal, not projected through slots.                                            | Titled page content keeps `.kui-dialog-title` in its initial template so the container can bind `aria-labelledby` during portal attachment; the intentionally titleless example uses separate content. |
| `kuiConfirm()`                                                  | Returns `Observable<boolean>`. Requires `title`; `message` defaults to `undefined`; `appearance` defaults to `default`; `confirmLabel` defaults to `OK`; `cancelLabel` defaults to `Cancel`. Fixed `sm`, `closable: false`, and `dismissable: false`. | Default, danger, warning, and header-only examples; E2E checks locked behavior and true/false results. Page instances pass translated labels instead of using the hard-coded English fallback.         |
| Public outputs / models                                         | None.                                                                                                                                                                                                                                                 | The page observes the opener result; it does not claim a component output or open model.                                                                                                               |

## States and behavior

| State or edge case                  | Page mapping                                                                                                                                                                                                                  | Browser evidence                                                                                                                                                                                                                |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Minimal configuration               | Default `kuiDialog(DialogExampleContent)` omits size, appearance, closable, and dismissable options; only typed content data is supplied.                                                                                     | Accessible default trigger opens the `md` / `default` panel.                                                                                                                                                                    |
| All sizes                           | `auto`, `sm`, `md`, `lg`, and `fullscreen`.                                                                                                                                                                                   | Named open-panel screenshots; panel class and viewport bounds are checked.                                                                                                                                                      |
| All appearances and optional icon   | `default`, `danger`, and `warning`; icon is rendered for each.                                                                                                                                                                | Icon, `data-kui-appearance`, and screenshot assertions.                                                                                                                                                                         |
| Close and dismissal are independent | `closable: false` with default dismissal; both options false with in-dialog actions.                                                                                                                                          | Escape and backdrop close the first; both leave the locked example open.                                                                                                                                                        |
| Title and close-button clearance    | The page-owned `sm` example uses a concise title and checks its rendered text against the close button. The library's header-reserve selector expects a direct panel child, which a component portal host does not provide.   | E2E compares rendered title text and close-button bounds for the concise example; arbitrary long portal titles are a documented limitation and are not claimed to be reserved automatically.                                    |
| Long body                           | Repeated fixed translated copy exceeds available panel height.                                                                                                                                                                | E2E checks internal body overflow while footer actions remain visible.                                                                                                                                                          |
| Missing title                       | `DialogUnnamedContent` omits `.kui-dialog-title`; container uses its generic `aria-label="Dialog"` fallback.                                                                                                                  | Focused E2E assertion; this is an accessible-name edge case, not the default composition.                                                                                                                                       |
| Modal semantics and focus           | Container provides `role="dialog"`, `aria-modal`, `aria-labelledby` when the title node exists at attachment, CDK focus trap/autocapture, and opener focus restoration.                                                       | E2E checks the named role and `aria-labelledby` for titled content, the fallback label for titleless content, focus stays in the dialog while tabbing, Escape close, and focus restoration.                                     |
| Overlay lifecycle                   | Custom Dialog and content components attach in the CDK overlay container under `document.body`; the service requests CDK's block-scroll strategy; close completes after the exit animation.                                   | E2E asserts the overlay container's body placement. The Playground scrolls inside `.playground-shell__workspace`, so this page does not claim or assert a root scroll-lock class.                                               |
| Reduced motion                      | Shipped CSS switches dialog keyframes to opacity-only under `prefers-reduced-motion`.                                                                                                                                         | E2E requests reduced motion and checks that the dialog entrance keyframes omit transforms.                                                                                                                                      |
| Responsive bounds                   | Standard panels max out at viewport width minus 32px; `auto` has a 320px minimum width, which takes precedence over that margin at a 320px viewport; fullscreen uses viewport dimensions. Body scroll stays inside the panel. | Responsive E2E checks document-level horizontal overflow and verifies default/auto/fullscreen bounds at 768px and 320px after entrance animation, including the full-width `auto` edge and full viewport height for fullscreen. |
| Theme                               | Dialog uses existing `--kui-dialog-*` / theme tokens; page changes only catalogue layout.                                                                                                                                     | E2E captures catalogue groups, all appearances, default/fullscreen open states, and 768px/320px layouts in both shell themes.                                                                                                   |

The E2E suite also clicks the enabled container close button, checks the
`undefined` result surfaced as “dismissed,” and verifies focus returns to its opener.

## Confirm behavior and known limits

- The appearance examples use the same triangle-alert SVG paths as the shipped `kuiConfirm()`
  content (`projects/ui/src/lib/utils/kui-chrome-icon-paths.util.ts`); they remain page-owned
  consumer content and do not import that internal utility.
- `kuiConfirm()` shows an icon for non-default appearance. Its confirm button becomes danger only
  for `appearance: 'danger'`; warning keeps the default button appearance. This differs from the
  broad wording in the `KuiConfirmConfig` docs and is represented honestly in the page.
- `kuiConfirm()` always opens at `sm`; the page E2E asserts that fixed preset. Its built-in English
  `OK` / `Cancel` fallback is intentionally not shown because every page-owned confirm action uses
  the translated labels from the route scope.
- The built-in Dialog close button has the fixed English accessible name `Close`. The titleless
  fallback name is also fixed English `Dialog`. The confirm page passes translated button labels
  explicitly, avoiding the component's English `OK` / `Cancel` fallbacks. Russian tests cover the
  translated page and titled content, not the untranslated library close control or confirm-label
  fallback.
- `KuiDialogRef` is exported, but `kuiDialog()` returns an observable and the page does not expose
  or demonstrate the internal service handle.
- Dialog has no arbitrary width, template `open` control, public component output, appearance tint
  for the panel, or projected content API. Concurrent/nested dialog behavior is undocumented and
  is omitted.
- The container suppresses its own close button if legacy custom content includes a
  `.kui-dialog-close` element to avoid duplicates. The page uses the documented container-owned
  close button and omits this legacy content hook.
- The service uses CDK's block-scroll strategy, which only adds the root scroll-block class when
  the document root overflows the viewport. This Playground page scrolls inside
  `.playground-shell__workspace`, so the page does not claim that opening a Dialog locks that
  shell's custom scroll container.
- The shipped long-title header spacing selector targets a direct `.kui-dialog-header` child of
  `.kui-dialog`. Dialog content is attached through a component portal host, so the page's header
  is nested under that host and the selector does not match. The sample title is kept to a
  non-overlapping length; this page does not claim automatic close-button clearance for arbitrary
  long portal titles.
- There is no non-modal mode or `modal` input/config option. The shipped panel always has
  `aria-modal="true"`; `dismissable: false` only blocks Escape/backdrop dismissal and does not
  make the dialog non-modal.
- The container associates its accessible name with `.kui-dialog-title` (or its generic label
  fallback) synchronously once when the content portal attaches. Page content that provides a
  title must include its `.kui-dialog-title` node in the initial template; a title inserted later
  may leave the panel on the generic `aria-label="Dialog"` fallback. This page uses static title
  markup for titled content and a separate component for the titleless case. The container has no
  `aria-describedby` config or automatic association to `.kui-dialog-body`; custom content remains
  responsible for any additional description relationship it needs.
- The Dialog CSS sets its close target to 28x28px; this is below the Playground accessibility
  guidance of 44x44px touch targets. The page does not conceal this library-owned limitation with
  overrides or claim a completed assistive-technology review.
- The Dialog type and container support `fullscreen`; the source docs now document it, while the
  shared `docs/state-coverage.md` Dialog row still omits it. That shared coverage update remains
  parent-owned.

## Locale keys

The route-owned copy lives in the `dialog` scope with structurally matching English and Russian
catalogues:

- `title`, `examples.*`, and `accessibility.*` identify the page, example cards, and groups.
- `actions.*` labels every trigger and custom/confirm action.
- `labels.*` supplies custom dialog titles and body copy, confirm text, and the repeated long-body
  paragraph.
- `status.*` reports custom dialog and confirmation results through a live status.
- Dialog opener data and result messages use `selectTranslate` with the explicit `dialog` scope,
  and open only after the required values resolve; synchronous service lookup can return keys while
  the lazy route catalogue is loading.

## Page and browser ownership

Page-owned files are this directory, its private `components/` and `types/` folders, the E2E spec
`projects/kikita-ui-playground/e2e/dialog-playground.visual.spec.ts`, its generated snapshot folder,
and `projects/kikita-ui-playground/public/i18n/dialog/{en,ru}.json`. The page does not modify the
Surfaces route fragment, shared route/sidebar registries, or shared SSR registry.

## Self-review checklist

- [x] Parent reviewed the source-backed contract audit before implementation.
- [x] The catalogue has a minimally configured default and covers each Dialog size and appearance.
- [x] Built-in close and dismiss options, long body content, concise-title fit, title fallback, and `kuiConfirm()` outcomes
      have named real interactions.
- [x] Page copy and accessible group names use matching English/Russian scope keys.
- [x] Page styles arrange examples only; Dialog visuals come from the library.
- [x] E2E scenarios use named groups and role-based triggers, including keyboard/focus,
      portal attachment, backdrop-drag, reduced-motion, SSR, narrow viewport, and explicit
      light/dark theme assertions.
- [x] Parent route and Dialog translation-scope integration are present in the Surfaces route
      fragment; this page leaves the shared route file unchanged.
- [x] Focused Dialog lint, Prettier, diff checks, fresh Playground build, and the clean Dialog
      E2E/SSR suite pass (14/14); all 44 owned visual baselines are generated.
- [x] Inspected every generated baseline for panel bounds, text, clipping, and layout across
      desktop, 768px, and 320px captures and both shell themes.
- [ ] Independent parent review and scoped commit remain pending.
- [ ] Formal assistive-technology review remains pending; the 28px close target is an inherited
      limitation.

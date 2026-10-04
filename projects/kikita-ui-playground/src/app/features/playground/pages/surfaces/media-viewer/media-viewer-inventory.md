# Media Viewer page contract inventory

Status: implemented after the parent accepted the contract audit. This file is the durable
contract-to-example map. The implementation review below found the additional library observations
recorded as discrepancies 9 to 13.

The Media Viewer page is an imperative consumer showcase. `kuiMediaViewer()` is an opener over
`KuiDialogService` (size `fullscreen`, `dismissable: true`, `closable: false`); the public surface
has no component inputs, models, or outputs. The page never invents any.

## Public contract map

| Public contract                             | Type, default, or resolution                                                                                                                                  | Planned example and verification                                                                                                                             |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `kuiMediaViewer()`                          | Injection-context factory; returns `(data: KuiMediaViewerData) => Observable<void \| undefined>`. The observable completes on close and carries no value.     | Every example calls the opener from a page-owned component field initializer. E2E asserts the dialog disappears and the trigger regains focus.               |
| `KuiMediaViewerData.items`                  | `readonly KuiMediaViewerItem[]`, required, at least one item. `items.length > 1` is a gallery; one item is single-photo mode.                                 | Default and grid open six items; the single-photo example opens one.                                                                                         |
| `KuiMediaViewerData.index`                  | `number`, default `0`, clamped to `[0, items.length - 1]` once at open.                                                                                       | Grid tiles open at their own index. A dedicated out-of-range example passes an index past the end and shows the last photo.                                  |
| `KuiMediaViewerData.maxZoom`                | `number`, default `3`; Zoom in disables at this value.                                                                                                        | Default reaches 3x; the custom-bounds example caps at 1.5x.                                                                                                  |
| `KuiMediaViewerData.zoomStep`               | `number`, default `0.5`; step per Zoom in/out click and per wheel event; results rounded to 2 decimals.                                                       | Default steps 1 to 1.5 to 2; the custom-bounds example steps 0.25.                                                                                           |
| `KuiMediaViewerData.ariaLabel`              | `string`, default `'Photo viewer'`; gallery appends `, photo N of total`.                                                                                     | Default example keeps the English default; a translated custom label example shows the base name replaced (EN and RU).                                       |
| `KuiMediaViewerData.onIndexChange`          | `(index: number) => void`; fires once at open with the clamped index and again on every navigation that changes the index. Not called for a no-op navigation. | Grid and default examples write "Last viewed: photo N" to a live status; E2E checks the value after open, arrow, Home/End, and thumbnail navigation.         |
| `KuiMediaViewerItem.id`                     | `string?`, defaults to `src`. Keys thumbnails and per-photo load state.                                                                                       | Page items carry explicit ids. One example uses two items without an id to prove the `src` fallback keeps both thumbnails and their independent load states. |
| `KuiMediaViewerItem.src`                    | `string`, never fetched or transformed by the viewer. Loaded by the browser `<img>`.                                                                          | Deterministic local sources only: inline SVG data URIs, plus static SVG files added under `public/media-viewer/`.                                            |
| `KuiMediaViewerItem.alt`                    | `string`, required; `''` is a deliberate decorative choice. Applied to the main image; thumbnails use `alt=""`.                                               | Page alt text is translated (EN/RU). E2E finds the main photo by its alt text.                                                                               |
| `KuiMediaViewerData` / `KuiMediaViewerItem` | Public types, JSDoc present.                                                                                                                                  | Type-only; the page uses them for typed data. No visual state.                                                                                               |
| Public outputs / models                     | None.                                                                                                                                                         | Not claimed.                                                                                                                                                 |

Not public and therefore not demonstrated as API: `KuiMediaViewerComponent` (`@internal`),
`KuiDialogService` handle, `KuiDialogRef`.

## States and behavior

| State or edge case                      | Source of truth                                                                                                  | Page mapping and browser evidence                                                                                                                                                                                                                                                  |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Open from a tile (pointer and keyboard) | docs Usage; `KuiDialogService.open`                                                                              | Grid of native `<button>` tiles. E2E opens by click and by focus + Enter/Space.                                                                                                                                                                                                    |
| Modal semantics                         | Container: `role="dialog"`, `aria-modal="true"`; hidden `h2.kui-dialog-title`                                    | E2E asserts `getByRole('dialog', { name: 'Photo viewer, photo 2 of 6' })` and `aria-modal`. Single photo name is just `Photo viewer`.                                                                                                                                              |
| Counter                                 | `aria-live="polite"`, `N / total`; absent for one photo                                                          | E2E asserts the counter text after each navigation and its absence for a single photo.                                                                                                                                                                                             |
| Previous/Next, bounds                   | native `disabled` at 0 and last; not rendered for one photo                                                      | E2E: Previous disabled on photo 1, Next disabled on the last, neither rendered in single-photo mode.                                                                                                                                                                               |
| Keyboard navigation                     | host `keydown`: Left/Right, Home/End; no wrap                                                                    | E2E presses ArrowRight/ArrowLeft/End/Home and asserts the counter, and that ArrowLeft on photo 1 and ArrowRight on the last stay put.                                                                                                                                              |
| Escape, Close button, focus return      | `overlayRef.keydownEvents`, `close()`, `previouslyFocused.focus()`                                               | E2E closes by Escape and by the "Close photo viewer" button; asserts the opening tile is focused again. Backdrop dismissal is documented, but the fullscreen panel fills the viewport so no backdrop is reachable (see discrepancies); not tested.                                 |
| Focus trap                              | CDK focus trap in the container                                                                                  | E2E tabs forward and backward repeatedly and asserts focus never leaves the dialog.                                                                                                                                                                                                |
| Thumbnail strip                         | `button` per photo, `aria-label="Go to photo N of total"`, `aria-current="true"` on active; absent for one photo | E2E clicks a thumbnail, asserts `aria-current` and counter; strip scrolls internally at 320px with no page overflow.                                                                                                                                                               |
| Zoom in/out buttons                     | `zoom` clamped `[1, maxZoom]`; native `disabled` at bounds; pan resets at 1x                                     | E2E clicks Zoom in until disabled, then Zoom out until disabled; verifies the photo's rendered box grows and shrinks.                                                                                                                                                              |
| Wheel / trackpad-pinch zoom             | `wheel` handler: `deltaY < 0` zooms in, `> 0` out, one `zoomStep` per event                                      | E2E dispatches real `page.mouse.wheel` over the photo and asserts the rendered size and toolbar button state.                                                                                                                                                                      |
| Drag pan while zoomed                   | pointer down/move/up with pointer capture; limit `120px * (zoom - 1)`                                            | E2E zooms, drags with real mouse input, asserts the photo box moved and was clamped; stopping when the pointer leaves the window is covered by a mouse release outside the viewport.                                                                                               |
| Two-finger touch pinch                  | two concurrent pointer ids scale from start distance and zoom                                                    | E2E dispatches two-finger touch through a CDP touch session (real pointer events) on a touch-enabled context and asserts continuous zoom. If CDP multi-touch proves unreliable it is recorded as an unverified limitation, not faked.                                              |
| Swipe navigation                        | Not implemented (no swipe handler, `touch-action: none`)                                                         | Omitted: unsupported. The inventory records it; no example claims swipe.                                                                                                                                                                                                           |
| Loading placeholder                     | `kuiSkeleton` shown while status is `loading`, image `visibility: hidden`                                        | Static SVG file served from `public/media-viewer/`; E2E holds the file request with `page.route`, asserts the skeleton is visible, releases it, asserts the photo appears.                                                                                                         |
| Error placeholder                       | `kui-empty-state context="error"` when `<img>` errors; status is per item                                        | Example whose item points at a missing same-origin path (404, deterministic, no remote host). Gallery variant has one broken item between two good ones: the error placeholder shows for that item only and the neighbours load normally; returning to it keeps the error status.  |
| Single-photo mode                       | `items.length === 1` hides counter, Prev/Next, strip                                                             | Dedicated example; E2E asserts only Zoom out, Zoom in, and Close remain.                                                                                                                                                                                                           |
| Index clamping                          | `clamp(index, 0, len - 1)`                                                                                       | Dedicated out-of-range example opens on the last photo; the `onIndexChange` status shows the clamped index.                                                                                                                                                                        |
| Navigating resets zoom and pan          | `goTo` resets `zoom`, `panX`, `panY`                                                                             | E2E zooms, navigates, asserts Zoom out is disabled again.                                                                                                                                                                                                                          |
| Reduced motion                          | image transform transition is 150ms; dialog animation from dialog.css                                            | Visual tests run with reduced motion. One behavior test emulates `reducedMotion: 'reduce'` and asserts the dialog still opens and closes (no motion-dependent assertions).                                                                                                         |
| Consumer multi-select composition       | docs "Multi-select composition"; consumer-owned `input[kuiCheckbox]`                                             | Second tile grid: checkbox beside (not inside) the cover button. E2E asserts checking selects without opening the viewer, and the cover button opens without toggling selection; count in a live status.                                                                           |
| Localization                            | viewer chrome strings are fixed English in the library                                                           | Page copy, group names, item alt text, and the custom `ariaLabel` are translated (RU). Library-owned strings (Zoom in, Zoom out, Previous photo, Next photo, Close photo viewer, Go to photo N of M, counter, error text) stay English, recorded here and asserted in the RU test. |
| SSR                                     | Overlay only opens on user action                                                                                | E2E: server markup contains the h1 and tiles, no overlay markup; hydration keeps a marked node; no console errors.                                                                                                                                                                 |
| Responsive                              | panel is `100vw x 100vh`; frame `min(80vw, 900px) x min(70vh, 600px)`; strip scrolls                             | E2E at 320px, 768px, and desktop: page has no horizontal overflow; viewer stays within the viewport; screenshots of the open viewer.                                                                                                                                               |
| Theme                                   | viewer scrim is a fixed dark literal; buttons use ghost tokens on it                                             | Open viewer captured under both shell themes; expected to look the same, which is the documented contract.                                                                                                                                                                         |

## Planned catalogue (cards)

1. Default: one tile opening `kuiMediaViewer()({ items })` with no options (six photos, index 0, all defaults). Last-viewed status.
2. Grid: six tiles, each opening at its own index, with `onIndexChange` readout.
3. Options: single photo; index past the end; custom `ariaLabel`; `maxZoom: 1.5` with `zoomStep: 0.25`.
4. Photo states: loading (held local file), error (single broken photo), gallery with one broken photo, items without `id`.
5. Multi-select composition: tile grid with per-tile checkbox and selected count.

Each card is wrapped in `section[role="group"]` with a translated `aria-label`. Photos are inline SVG
data URIs generated by a page helper (numbered tiles on distinct hues, fixed dimensions), so the
result is identical in SSR, Playwright, and offline. The loading example uses one static SVG file
under `public/media-viewer/`. No remote URLs.

## Source audit

- Docs: `docs/media-viewer.md`; shared row `docs/state-coverage.md` (Media Viewer).
- Implementation: `projects/ui/src/lib/components/media-viewer/kui-media-viewer.ts`,
  `kui-media-viewer.component.ts`, `kui-media-viewer.types.ts`, `index.ts`.
- Dialog base: `projects/ui/src/lib/components/dialog/kui-dialog.service.ts`,
  `kui-dialog-container.component.ts`, `projects/ui/src/lib/components/dialog/kui-dialog.css`
  (`.kui-dialog--fullscreen`).
- Styles: `projects/ui/src/lib/components/media-viewer/kui-media-viewer.css`.
- Unit specs: `kui-media-viewer.component.spec.ts` (15 specs: title, clamping, `onIndexChange`,
  bounds, keyboard no-wrap, close, zoom bounds, skeleton, error, `src` key fallback, single photo,
  thumbnail, wheel, pan, pan-stop, pinch).
- Legacy scenarios only (not modified): `projects/playground/src/app/pages/media-viewer`
  (grid, multi-select, trigger button, single photo, custom zoom, broken URL).

## Discrepancies between docs, implementation, tests, and types

1. Docs and `state-coverage.md` say the lightbox is dismissed by "backdrop click". `kuiMediaViewer()`
   always opens at `fullscreen` (`100vw x 100vh`), so the backdrop is fully covered by the panel and
   cannot be clicked. Dismissal in practice is Escape or the Close button. The page tests those two.
2. Docs: focus restore is "to the trigger element". The service restores focus to
   `getFocusableElement(document.activeElement)` captured at open, so a trigger that is not the
   active element at open (programmatic open) is not restored. Tile clicks and Enter/Space keep the
   tile active, so the page's real interactions are covered.
3. Docs list Prev/Next/Zoom "native `disabled` at their bounds". A focused button that becomes
   disabled (for example keyboard Enter on Zoom in until max) may drop focus; the host `keydown`
   handler only sees events from inside the host, so Arrow/Home/End could stop working until focus
   is moved back into the dialog. Reproduced in Chromium: after Enter on the focused Zoom in button
   reaches the maximum, `document.activeElement` is `<body>` and ArrowRight does not navigate. It is
   recorded as a library defect with `test.fixme('keeps arrow keys working after Zoom in becomes
disabled while focused')`. Escape still closes the viewer because the CDK dispatcher listens on
   the document.
4. All viewer chrome strings (Zoom in/out, Previous/Next photo, Close photo viewer, Go to photo N of
   M, Photo viewer default name, error placeholder text) are hard-coded English with no input for
   localization; only `ariaLabel` is configurable. The RU page cannot translate them.
5. `state-coverage.md` says "manually reviewed ... Committed visual regression baselines and a formal
   assistive-technology review are not yet run". This page adds baselines; it does not perform an
   assistive-technology review.
6. Docs claim swipe is not part of the contract and list pinch only; no swipe navigation exists.
   The task brief mentioned touch swipe "if supported": it is not supported.
7. Thumbnails always use `loading="lazy"` with `alt=""`; only the current photo has real alt text.
   Documented behavior, not a defect.
8. Pan clamp is a fixed `120px * (zoom - 1)` budget, not the photo's rendered size (documented in
   "Explicitly Not Included").
9. Light theme: `KuiMediaViewerComponent`'s host is `display: contents` (set by the dialog
   container), so `.kui-media-viewer`'s dark scrim background never paints. In the light theme the
   white chrome (counter, zoom, close, Prev/Next) sits on the light dialog panel with a measured
   contrast ratio of about 1.03. Recorded as a library defect with
   `test.fixme('keeps the viewer chrome readable in the light theme')`; the page therefore has no
   light-theme viewer baseline (it would enshrine the defect).
10. The error placeholder (`kui-empty-state`) is not centered inside the photo frame: at 1440px it
    sits at the left of the frame. Visual observation only, no test; it is visible in the error
    baselines.
11. A failed photo's thumbnail shows the browser's broken-image icon because the strip renders the
    same `src`. Visible in the error baselines; no test.
12. Synthetic mouse drags are not exact: Chrome may coalesce the last pointer moves, so the pan
    test asserts a range for the small drag and exact clamping (120px at 2x) for the large drag.
13. `docs/media-viewer.md` and `state-coverage.md` claim dismissal by backdrop click; unreachable in
    fullscreen (discrepancy 1). Docs are not edited by this page; the parent decides.

## Omitted or partial coverage

- Video, per-component multi-select props, gallery-group linking: documented as not included.
- Swipe navigation: unsupported.
- Arbitrary `ariaLabel` combinations, extreme `maxZoom` values: only default, one custom pair, and one
  custom label are shown; further values add no distinct behavior.
- Backdrop click: unreachable (see discrepancy 1).
- Formal screen-reader, forced-colors, and contrast measurement: not claimed.

## Locale keys (scope `media-viewer`, alias `mediaViewer`)

- `title`, `examples.*`, `accessibility.*` name the page, cards, and groups.
- `actions.*` label the triggers (tiles use `Open photo N of total`).
- `labels.*` carry photo alt text, custom aria label, and status lead-ins.
- `status.*` carry the live "Last viewed" and "Selected" readouts.
- Sidebar label: `playground.components.mediaViewer` in root `en.json` and `ru.json`.

## Planned file list

Shared registry single-line additions:

- `projects/kikita-ui-playground/src/app/enums/playground-route.enum.ts` (`MediaViewer = 'media-viewer'`)
- `projects/kikita-ui-playground/src/app/features/playground-shell/components/component-sidebar/constants/component-groups.const.ts`
- `projects/kikita-ui-playground/src/app/features/playground/pages/surfaces/surfaces.routes.ts`
- `projects/kikita-ui-playground/public/i18n/en.json` and `ru.json` (`playground.components.mediaViewer`)

Page-owned:

- `projects/kikita-ui-playground/src/app/features/playground/pages/surfaces/media-viewer/` (`media-viewer.ts`, `.html`, `.scss`, `index.ts`, this inventory, page `components/` with barrels, `helpers/` for the photo factory, `types/` if needed)
- `projects/kikita-ui-playground/public/i18n/media-viewer/en.json`, `ru.json`
- `projects/kikita-ui-playground/public/media-viewer/*.svg` (local static photo for the loading scenario)
- `projects/kikita-ui-playground/e2e/media-viewer-playground.visual.spec.ts` and its generated snapshot folder

Shared files the parent must update at integration (not edited by this page): `docs/state-coverage.md`
(Media Viewer row already exists; needs the Playground page evidence), the rollout tracker
`projects/kikita-ui-playground/.agents/component-page-rollout.md` (Surfaces table), and
`projects/kikita-ui-playground/e2e/component-pages.spec.ts` (the h1 will read `Media viewer`).

## Self-review checklist

- [x] Every public field of `KuiMediaViewerData` and `KuiMediaViewerItem` is mapped or has an omission reason.
- [x] Every documented interaction (open, keys, zoom, wheel, pan, pinch, thumbnails, close, focus return) is mapped to a real-input test.
- [x] Discrepancies between docs, implementation, tests, and types are listed.
- [x] Parent accepted the audit before implementation.
- [x] Touch pinch is verified with two real touch points through a CDP touch session on a
      touch-enabled context; wheel zoom uses `page.mouse.wheel`; there is no synthetic non-pointer
      event anywhere in the spec.
- [x] Swipe navigation and backdrop click are not tested because they are unsupported or
      unreachable.
- [ ] Formal assistive-technology review is not part of this page.

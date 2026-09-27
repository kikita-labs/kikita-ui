# Popover Playground inventory

The route is a fixed catalogue for the public `@kikita-labs/ui` Popover API. It keeps the default
panel closed, shows examples on one scrollable page, and uses the persistent Playground shell for
theme and language. The page composes existing Kikita UI primitives and keeps its SCSS limited to
catalogue layout.

## Source audit and public contract mapping

Source checked: `docs/popover.md`, the public component and directive barrels, `kui-popover.component.ts`,
`kui-popover-for.directive.ts`, `kui-popover.types.ts`, `popover.css`, `kikita-ui.css`, theme token
defaults, and `kui-popover.component.spec.ts`.

| Public surface                                 | Type, default, and observed behavior                                                                                                                                                                                                                                                          | Page mapping and omission                                                                                                                                                                                                                                                |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `placement`                                    | `KuiPopoverPlacement`: `top`, `bottom`, `left`, or `right`; default `bottom`. The CDK strategy tries the preferred side, then its opposite.                                                                                                                                                   | The position card has all four sides crossed with each alignment. Browser checks verify each requested side when it has room, keep every compact panel inside the viewport, and force a bottom-to-top flip.                                                              |
| `align`                                        | `KuiPopoverAlign`: `start`, `center`, or `end`; default `center`. The resolved alignment follows the chosen connection pair after a flip.                                                                                                                                                     | All 12 side/alignment pairs appear in the position card and have named browser assertions and screenshots.                                                                                                                                                               |
| `arrow`                                        | Boolean-attribute input; default `false`. When true, it renders an `aria-hidden` caret and adds 6 px to `offset`.                                                                                                                                                                             | The default and arrow-off examples omit it; the arrow-on example binds true. Browser checks compare the panel gap and caret presence, and capture both open states.                                                                                                      |
| `triggerType`                                  | `KuiPopoverTriggerType`: `click` or `hover`; default `click`. Click toggles and supports outside-mousedown/Escape dismissal. Hover opens on pointer entry or focus entry and schedules close after trigger or panel pointer/focus exit.                                                       | Click examples use native buttons. A descriptive-only hover example uses the 180 ms delay and has pointer travel, keyboard focus, and delayed-close coverage. Invalid values are not useful visual examples and are omitted.                                             |
| `ariaLabel`                                    | `string`; default `Popover`. It names the rendered `role="dialog"` panel.                                                                                                                                                                                                                     | The minimal default omits it; all other panels use content-specific translated names. Browser checks query the default and custom dialog names in English and Russian.                                                                                                   |
| `hoverDelay`                                   | `number`; default `100` ms. `numberAttribute` parses it; finite values at least zero are floored, while invalid, non-finite, or negative values fall back to 100.                                                                                                                             | The hover example binds 180 ms and labels the delay. Browser interaction verifies pointer travel, an open state before expiry, and close after expiry. Coercion boundaries are omitted because they are not meaningful visual states.                                    |
| `offset`                                       | `number`; default `8` px. `numberAttribute` parses it; finite values are accepted, including negatives, while invalid or non-finite values fall back to 8. An arrow adds 6 px.                                                                                                                | Default and arrow comparison examples use the default offset; another example binds 24 px. Browser geometry checks the arrow increment and larger gap. Negative and invalid offsets are omitted as edge inputs with no useful page state.                                |
| `trapFocus`                                    | Boolean-attribute input; default `false`. When true, CDK traps focus and the first matching focusable descendant is focused after opening.                                                                                                                                                    | The reminder form binds true. Browser checks initial focus, Tab/Shift+Tab cycling, submit dismissal, and focus restoration. The default and other examples omit it.                                                                                                      |
| `open` model and generated `openChange` output | `ModelSignal<boolean>`; default `false`. Component interactions update it, and Angular exposes `openChange`. Setting the model alone does not attach or dispose the lazy overlay, so it is not a standalone controlled API despite the implementation JSDoc wording.                          | Real trigger, dismissal, and form/action paths change the model; browser checks `aria-expanded` and the live panel relationship. There is no manual model editor or separate output log because either would imply controlled behavior and duplicate the visible state.  |
| `panelId`                                      | Public stable ID per component instance; the directive uses it for `aria-controls` only while the panel is attached.                                                                                                                                                                          | Browser checks the open trigger points to the rendered dialog ID and that the closed default has no stale reference.                                                                                                                                                     |
| `kuiPopoverFor` directive input                | Optional `KuiPopoverComponent` reference; default `undefined`. Adds `aria-haspopup="dialog"`, reflects `open()` in `aria-expanded`, and exposes open-only `aria-controls`. Native buttons provide keyboard activation. A non-button host gets Enter/Space handling but no role or `tabindex`. | Every trigger is a native button with `kuiButton size="lg"`. Browser checks the default trigger's relationships, native Space activation, and 44 × 44 px minimum targets at 320 px. Non-button hosts are omitted because their role and tab stop belong to the consumer. |
| Public methods                                 | `openFor(anchor)`, `toggleFor(anchor)`, `close()`, `scheduleClose(delay)`, and `cancelClose()`. The directive routes click/hover/focus through these methods; `close()` plays the exit animation before detaching.                                                                            | Click/keyboard/hover exercise `openFor` and `toggleFor`; confirmation and form actions call `close`; hover travel exercises scheduled close and cancellation. A low-level imperative-method editor is omitted because real trigger paths cover those behaviors.          |
| Projected content and CSS helpers              | Free `<ng-content>`; optional `.kui-popover-title` and `.kui-popover-desc` styles. Helpers do not create heading semantics or an accessible name.                                                                                                                                             | The page shows descriptive content, a named information panel, a confirmation with native buttons, and a Signal Forms form inside `kui-field`. Titles use native headings; dialog names are supplied independently.                                                      |

There are no Popover-owned disabled, invalid, loading, selected, empty, size, appearance, density, or
backdrop inputs/states. They are omitted because they are not part of the public contract; content and
trigger styling remain consumer-owned. The trigger buttons use the public Button `size="lg"` only to
provide a comfortable target. Runtime styles use Popover and semantic KUI variables for surface,
border, radius, shadow, padding, width, caret, and motion. `--kui-z-popover` is declared in theme
defaults but is not consumed by `popover.css`; CDK overlay stacking owns the pane.

## Behavior, accessibility, and rendering evidence

- The route has one translated `Popover` heading and compact labelled cards. All examples stay
  visible without tabs or disclosure controls.
- The default SSR state has no panel DOM. Hydration is checked before opening the default example;
  opening then verifies the dialog ID and trigger ARIA. The live browser check collects console and
  page errors.
- Click behavior covers native Space activation, trigger toggle, Escape, outside dismissal, focus
  return, confirmation cancellation and confirmation, and form-submit dismissal. The confirmation
  removes its seeded sample view from the example and reports the result in a live status region;
  the form reports the submitted reminder name after closing.
- Hover content has no interactive descendants. Browser coverage exercises pointer travel into the
  panel, the configured close delay, focus entry, and focus exit. Focus restoration is not claimed
  for hover mode because the implementation skips it to avoid reopening on the trigger's `focusin`.
- The form example uses Signal Forms inside `kui-field` and owns submission with an async `form()`
  action; it does not add a parallel submit handler. Focus-trap coverage checks initial focus and
  both ends of the Tab cycle. It is a Popover composition example, not an additional
  form-validation state catalogue.
- Browser coverage checks preferred-side flipping, viewport resize repositioning, anchor-offscreen
  dismissal, reduced motion, and no document horizontal overflow at 320 px. Responsive screenshots
  cover named catalogue cards at 1440 × 1000, 768 × 900, and 320 × 844. Axe scans cover the closed
  catalogue and open default and form dialogs, using the playground's existing baseline exclusions.
  No real screen-reader/assistive-technology, forced-colors, or separate contrast review is recorded;
  the Axe scans exclude `color-contrast` and do not replace those checks.
- English and Russian text live in matching `public/i18n/popover/en.json` and `ru.json` scopes. The
  route loads the Popover scope and browser checks switch the persistent shell to Russian.

## Source discrepancies and page boundaries

- `kui-popover.component.ts` describes `open` as controlled, but `openFor` creates the overlay and
  `close` detaches it only after animation. The docs correctly caution against using the model as a
  standalone controlled API; the page treats it as observed interaction state.
- `docs/popover.md` says placement auto-flips “to fit.” The implementation tries only the preferred
  and opposite pair and calls `withPush(false)`, so it does not push or clamp a panel if neither
  position fits. The page keeps examples compact and does not claim arbitrary edge fitting.
- The docs describe hover as mouse-only and panel leave as immediate. The directive also opens and
  schedules close on focus entry/exit, and panel leave uses the configured delay. The page's hover
  example and interaction checks follow the implementation.
- The docs describe focus return without the hover exception. The component skips trigger focus for
  hover mode so focus restoration cannot immediately reopen it.
- Responsive screenshots show the catalogue layout at narrow widths. Popover CSS has no viewport
  width/height clamp and disables CDK push, so screenshots and interaction checks do not promise
  that arbitrary long content fits at every viewport edge.
- Stable Chromium checks at 1440 × 1000 observe two otherwise-fitting right pairs resolving to
  `data-side="left"`: `rightStart` (`data-align="start"`) has trigger bounds `{x: 365, y: 527.594,
width: 309.328, height: 44}` and panel bounds `{x: 31, y: 527.594, width: 320, height: 74.281}`;
  `rightCenter` (`data-align="center"`) has trigger bounds `{x: 690.328, y: 527.594,
width: 309.328, height: 44}` and panel bounds `{x: 356.328, y: 512.453, width: 320,
height: 74.281}`. Both have a 340 px required-space threshold and more room on the right
  (765.672 px and 440.344 px respectively), with viewport `{width: 1440, height: 1000}`, no page
  scroll, no `dir` attribute, and computed direction `ltr`. The implementation orders the requested
  right pair before its left fallback and disables push. The matrix test explicitly expects the
  observed left result for these two cases, keeps strict preferred-side assertions for other pairs
  with sufficient measured space and strict opposite-side assertions when there is not enough, and
  preserves screenshots showing the mismatches. This records the unresolved public positioning
  behavior without changing it in the playground page.
- Nested KUI overlays are ignored by the shared floating-panel dismissal utility and have focused
  component-unit coverage. The page does not add a nested overlay scenario because it would test a
  second entity instead of Popover's own contract.

## Screenshot and test plan

`e2e/popover-playground.visual.spec.ts` uses named accessible groups and triggers. Closed catalogue
snapshots are:

- `popover-default-{desktop,768,320}.png`
- `popover-arrow-offset-{desktop,768,320}.png`
- `popover-positions-{desktop,768,320}.png`
- `popover-content-{desktop,768,320}.png`
- `popover-form-{desktop,768,320}.png`
- `popover-hover-{desktop,768,320}.png`

Interaction screenshots cover all 12 positions, arrow off/on, 24 px offset, forced flip, default
keyboard open, confirmation open and resulting deleted state, saved form outcome, focus-trapped
form, hover open, and reduced motion. The suite also asserts SSR/hydration, EN/RU labels, ARIA relationships, click/hover
interactions, focus behavior, offset geometry, viewport repositioning, offscreen-anchor dismissal,
and narrow-page overflow, plus Axe scans of closed and open dialog states. The root gate on
2026-09-28 passed a fresh production SSR build, the shared 43-route SSR/adaptive suite (2/2), and
the focused Popover E2E suite (13/13). The parent visually reviewed the default and 320px captures,
all placement groups at desktop/768/320, the documented `rightStart`/`rightCenter` outcomes, forced
flip, form/focus trap, hover, reduced motion, arrow/offset, and confirmation states; no clipping,
overlap, or misleading baseline was found. The matrix records the current `rightStart` and
`rightCenter` behaviors and retains strict preferred-side or ordinary-flip expectations for all
other placements. All 41 owned snapshots passed comparison.

## Self-review checklist

- [x] One compact scrollable Popover catalogue with a minimally configured closed default.
- [x] Every public input, generated model output, directive input, public method, default, and
      helper-content contract maps to an example or a specific omission reason.
- [x] All 12 placement/alignment values, arrow behavior, offset, trigger types, delay, accessible
      names, focus trapping, projected content, and meaningful dismissal paths are represented.
- [x] User-facing page strings use the Popover EN/RU locale scope.
- [x] Triggers use native button semantics; panels have names and open-only control references.
- [x] Scoped formatting, locale parity, SSR/hydration, browser/Axe/responsive checks, and all 41
      screenshot baselines pass and were visually reviewed.
- [x] Scoped lint and static audit pass on this revision.

# Carousel Contract Inventory

Status: implemented. The audit was reviewed and approved by the parent before implementation; findings 1 and 2 were
reproduced with real input and are recorded as `test.fixme`. Findings 8 and 9 below were verified or revised during implementation.

Carousel is a native scroll-snap strip of consumer-owned slides with Previous/Next arrows, a dot
picker, optional autoplay, and a two-way `index` model. The consumer owns slide content; the
component owns navigation, keyboard handling, autoplay, and index/scroll synchronization.

## Public inputs, models, outputs, and resolution

| Surface                       | Public type and default                           | Resolution and observed behavior                                                                                                                                                                                                                                                                                                 | Planned coverage                                                                                                                                          |
| ----------------------------- | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `itemsPerView`                | positive integer; `1`; `positiveIntegerAttribute` | Non-numeric, `< 1`, or non-finite values become `1`; decimals floor. Sets `--kui-carousel-items-per-view` on the track (slide flex-basis). `maxIndex = max(0, slideCount - itemsPerView)`; dots render `maxIndex + 1` buttons.                                                                                                   | Default (1) plus explicit 2 and 3 with five slides; edge case where `itemsPerView === slideCount` (one dot, both arrows disabled).                        |
| `loop`                        | boolean; `false`; `booleanAttribute`              | `false`: Prev disabled at clamped index 0, Next disabled at `maxIndex` (native `disabled`). `true`: `goTo` wraps modulo `maxIndex + 1`, arrows never disabled.                                                                                                                                                                   | Side-by-side non-loop and loop examples; E2E asserts disabled boundaries and wrap from first to last and last to first.                                   |
| `autoplay`                    | boolean; `false`; `booleanAttribute`              | Renders a Play/Pause icon button (top-right). Browser-only `setInterval(goNext)` runs while `autoplay && !manuallyPaused && !hoverPaused`. Without `loop` it never wraps: at the last reachable index `goNext` is a no-op while the control still reports playing.                                                               | Autoplay example (loop on, so it visibly cycles) and a no-loop autoplay example to record the stall at the end; interval driven by `page.clock`.          |
| `autoplayInterval`            | positive number (ms); `4000`; custom transform    | Non-finite or `<= 0` becomes `4000`. Timer is recreated when the effect re-runs.                                                                                                                                                                                                                                                 | Explicit value on the autoplay examples; `runFor` of exactly one interval advances one slide. Invalid values omitted (documented fallback, unit-covered). |
| `showArrows`                  | boolean; `true`                                   | `false` removes Prev/Next from the DOM. Swipe/scroll and keyboard still work.                                                                                                                                                                                                                                                    | Dots-only example.                                                                                                                                        |
| `showDots`                    | boolean; `true`                                   | `false` removes the dot tablist. Arrows/keyboard/swipe still work.                                                                                                                                                                                                                                                               | Arrows-only example.                                                                                                                                      |
| `showArrows` + `showDots` off | combination                                       | "Swipe only": drag/scroll and region keyboard keys are the only navigation. Documented as not WCAG 2.5.7 self-sufficient.                                                                                                                                                                                                        | Swipe-only example, labeled by name only; keyboard (region focus + arrows) and drag evidence in E2E.                                                      |
| `draggable`                   | boolean; `true`                                   | `true`: mouse drag-to-scroll (pointer events, touch excluded), `cursor: grab/grabbing`. `false`: `cursor: default`, `data-kui-locked` (`overflow-x: hidden`) so wheel/trackpad scroll is blocked too.                                                                                                                            | Default draggable plus explicit `false` example; E2E: real mouse drag changes index on draggable, no change on `false`; wheel scroll blocked on `false`.  |
| `ariaLabel`                   | string; `'Slides'`                                | Region `aria-label`; `aria-roledescription="carousel"` is fixed. Must not contain "carousel".                                                                                                                                                                                                                                    | Every page carousel has a translated content-specific name; the omitted default (`Slides`) is asserted once by the minimal default example.               |
| `index`                       | number; `model(0)`                                | Two-way model. Displayed/selected position is `clampedIndex = clamp(index, 0, maxIndex)`, but the model value itself is not clamped or normalized (an out-of-range consumer value stays in the model). Programmatic changes scroll smoothly to the slide's `offsetLeft`; manual scroll settles (120ms debounce) and writes back. | Two-way example with a visible readout and external Go-to/Reset buttons; out-of-range values omitted (no documented semantics).                           |
| `indexChange`                 | implicit model output, `number`                   | Emitted on every model write: arrows, dots, keyboard, autoplay, scroll/drag sync.                                                                                                                                                                                                                                                | The two-way readout is driven by it; E2E asserts readout after each input method.                                                                         |
| `kuiCarouselSlide`            | directive, no inputs                              | Host gets class `kui-carousel__slide`, `role="group"`, `aria-roledescription="slide"`, and `id`/`aria-label="N of total"` assigned by the parent effect. `id`/`ariaLabel` are `@internal`.                                                                                                                                       | Used for every slide; E2E asserts `N of total` names and dot `aria-controls` targets.                                                                     |

Public exports: `KuiCarouselComponent`, `KuiCarouselSlideDirective` (via `projects/ui/src/lib/components/carousel/index.ts`).
Not public: track/dot refs, timers, `hoverPaused`, `manuallyPaused`, and drag state. The component
declares no explicit `output()` and no form integration. Prev/Next/Play use `button[kuiIconButton]`
with inline SVG chrome, so no icon CDN request occurs and no Lucide stub is needed.

## State, interaction, and accessibility behavior

- Region: `role="region"`, `aria-roledescription="carousel"`, `aria-label`. Track has `aria-live`:
  `off` while autoplay is actually advancing, `polite` otherwise (including non-autoplay carousels).
- Slides: `role="group"`, `aria-roledescription="slide"`, `aria-label="N of total"`, stable id
  `kui-carousel-<n>-slide-<i>`; the counter id is module-global, so ids depend on instantiation
  order (deterministic on server and client for the same page render).
- Dots: `role="tablist"` (`aria-label="Choose slide"`), each `role="tab"` with `aria-selected`,
  `aria-controls` (slide id), `aria-label="Go to slide i of total"`, roving `tabindex`; Arrow/Home/End
  in the dot list move focus and selection (wraps around regardless of `loop`). Dots are 8px
  (`--kui-carousel-dot-size`), far below the 44px touch-target guidance; recorded as a shipped
  limitation, not resized by the page.
- Region keyboard: ArrowLeft/ArrowRight/Home/End on anything inside the region (arrows, Play/Pause,
  slide content) move the current slide; Home/End go to `0` / `maxIndex`. Prev/Next/Play buttons are
  native buttons (Enter/Space).
- Autoplay pause: `mouseenter`/`focusin`/`touchstart` set one shared `hoverPaused` flag to true;
  `mouseleave`/`focusout`/`touchend` set it to false (last event wins).
- Drag: mouse only (`pointerType !== 'touch'`), pointer capture on the track, snap disabled during the
  drag and restored on `scrollend` or a 500ms fallback. Touch swipe is native `overflow-x` scroll +
  scroll-snap. A 120ms debounced `scroll` handler writes the nearest slide back to `index`.
- Library-owned strings (`Previous slide`, `Next slide`, `Pause autoplay`, `Resume autoplay`,
  `Choose slide`, `Go to slide i of n`, `Slides`, `N of total`) are hard-coded English; the page
  records this and only localizes page-owned copy plus the `ariaLabel` it passes.
- SSR: timers, scroll, and drag are guarded by `isPlatformBrowser`; the server renders slides, arrows
  (Prev disabled), dots, and the Play/Pause control with no timer.

## Discrepancies and candidate findings (to verify with real browser input during implementation)

1. **Play/Pause label reflects hover/focus, not the user's choice (reproduced defect, `test.fixme`).** The label
   is `effectivePlaying() ? 'Pause autoplay' : 'Resume autoplay'`, and `effectivePlaying` includes
   `hoverPaused`. Reaching the button with a pointer or with the keyboard always sets `hoverPaused`
   (`mouseenter`/`focusin`), so the button shows "Resume autoplay" and the play icon even when
   autoplay has not been manually paused. Pressing it sets `manuallyPaused` but the label does not
   change (still hover/focus paused), and pressing it again does not resume autoplay while focus is
   inside. The unit test only passes because `click()` dispatches no hover/focus event. To be
   reproduced with real hover and keyboard input; if confirmed it is recorded here and reported with a
   `test.fixme`, not fixed.
2. **Pause-on-hover/focus uses one shared flag (reproduced defect, `test.fixme`).** `mouseleave` clears it while
   focus is still inside, and `focusout` clears it while the pointer is still inside, so autoplay
   resumes although the docs say it pauses "while the pointer, focus, or a touch interaction is
   inside". To be reproduced (hover, focus a control, leave with the pointer, advance the clock).
3. **Dot count wording.** `docs/carousel.md` says the picker renders "exactly that many dots" as
   `slideCount - itemsPerView`; the implementation renders `slideCount - itemsPerView + 1` (one per
   reachable index; the unit test with 3 slides and `itemsPerView=2` expects 2 dots). Docs text is
   off by one; behavior is the reachable-index count.
4. **`index` is not clamped in the model.** Docs describe it as the index of the first visible slide;
   an out-of-range consumer value is displayed clamped but stays in the model. Not exposed by the page
   (only valid indices are used).
5. **Autoplay without `loop` stalls.** At `maxIndex` the timer keeps firing a no-op `goNext`, and the
   control still says Pause. Docs do not describe the end-of-range behavior.
6. **Docs coverage claims.** `docs/carousel.md` says a narrow mobile viewport was never verified; the
   page adds 320px checks. `docs/state-coverage.md` still lists the legacy `/carousel` route.
   `docs/browser-test-coverage.md` says swipe, loop wrap, and autoplay pause are not browser-tested;
   this page adds those.
7. **Play/Pause DOM order.** The button follows the arrows in the DOM but is positioned top-right;
   APG recommends it first in tab order. Recorded only.
8. **Leading slide padding differs between scrollable and non-scrollable tracks (verified in captures).** The
   track has padding equal to the gap and snaps the first slide at `scrollLeft = 16`, so whenever the track can
   scroll the first slide sits flush against the region's left edge (the padding is scrolled away), while a track
   that cannot scroll (`itemsPerView` equal to the slide count) shows the 16px leading padding. Returning to slide 0
   after navigating gives the same flush position as the initial render, so there is no jump. Not changed.
9. **Slides with focusable content.** Off-screen slides stay in tab order and focus moves the scroller
   natively; the region keydown handler also captures Arrow keys from inside slide content. Not
   demonstrated (slide content is non-interactive text); recorded only.

## Visual contract and tokens

Component visuals come from `projects/ui/src/styles/carousel.css` (`--kui-carousel-*` tokens: gap,
region/slide radius, backgrounds, border, control background/shadow, dot size/colors). Height is
entirely slide content; the component never fixes a block size. Page SCSS only lays out the example
grid with `--kui-space-*` tokens and gives slide content padding; it does not restyle Carousel. No
Carousel-specific approved design record exists in `docs/design-provenance.md`; this page makes no
visual changes and reports any visual concern instead.

Slides use local deterministic text cards (translated "Slide N" heading plus a short line), no
images or external URLs.

## Contract-to-example map (proposed)

| Example (card heading) | Visible coverage and interaction                                                                                                            | Browser evidence                                                                                                                                                                                                |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Default                | Minimal `kui-carousel`, three slides, all defaults except a translated `ariaLabel` (the built-in `Slides` fallback is recorded, not shown). | Server-rendered heading, region name/roledescription, slide names, Prev disabled, dot 1 selected; desktop and 320px captures, both themes for the default.                                                      |
| Index model            | `[(index)]` with a visible readout, external Go-to-slide-3 and Reset buttons.                                                               | Real clicks on arrows, dots, and external buttons update the readout and dot selection; captures before/after.                                                                                                  |
| Loop                   | Non-loop and loop carousels side by side.                                                                                                   | Non-loop Prev disabled at start, Next disabled at end; loop wraps both ways.                                                                                                                                    |
| Items per view         | 2 and 3 of five slides, plus 3 of three slides (one dot, both arrows disabled).                                                             | Dot counts (4, 3, 1), visible slide widths, End reaches last reachable index.                                                                                                                                   |
| Navigation visibility  | Dots only, arrows only, swipe only.                                                                                                         | Presence/absence of controls; swipe-only region keyboard and drag still change slides.                                                                                                                          |
| Autoplay               | Looping autoplay with visible Play/Pause; no-loop autoplay.                                                                                 | With `page.clock`: `runFor(interval)` advances one slide; Pause stops it; Resume restarts; hover and focus pause it; no-loop autoplay stalls on the last slide. Findings 1 and 2 as `test.fixme` if reproduced. |
| Draggable              | Default draggable and `draggable=false`.                                                                                                    | Real mouse drag changes index on the default and not on `false`; wheel scroll blocked on `false`; touch swipe via CDP touch gesture if supported by the harness.                                                |
| Keyboard               | Region arrows/Home/End, dot-picker roving arrows/Home/End; Enter/Space on buttons.                                                          | Real key presses with focus location asserted; screenshot with real focus ring on a dot and on an arrow.                                                                                                        |
| SSR and translations   | Route server-renders, hydrates, and loads the `carousel` EN/RU scope.                                                                       | Server HTML heading and region markup, language switch both ways, clean console, 320px/768px/desktop overflow (also after Russian).                                                                             |

Omissions: out-of-range `index` and invalid `itemsPerView`/`autoplayInterval` (no documented
semantics beyond unit-covered coercion); slide counts of 0 or 1 (dots and arrows degenerate, no
documented promise); CSS-token overrides and provider size (entity catalogue only, no size/density
prop); slides with interactive content (finding 9); the WCAG 2.2.2 "autoplay without any manual
control" combination is not shown as a separate example (autoplay + all controls off still exposes
the Play/Pause control, which the legacy page label misrepresents), but it is covered as an E2E
assertion that the Play/Pause control stays visible.

## Source audit

- `docs/carousel.md` — usage, API table, accessibility, keyboard, tokens, known gaps.
- `projects/ui/src/lib/components/carousel/kui-carousel.component.ts` and
  `kui-carousel-slide.directive.ts` — inputs, model, effects, timers, keyboard, drag, roles, labels.
- `projects/ui/src/lib/components/carousel/kui-carousel.component.spec.ts` — unit coverage: labels,
  scroll sync, cursor/lock, touch exclusion, mouse drag, snap-restore race, boundaries, loop, keyboard,
  Play/Pause label (via `click()` only).
- `projects/ui/src/styles/carousel.css` — layout, tokens, dots, control slots, scrollbar hiding.
- `projects/ui/src/lib/utils/kui-input-transform.util.ts` — `positiveIntegerAttribute`.
- `projects/playground/src/app/pages/carousel/carousel.page.*` — legacy scenarios only (reference for
  scenarios; its slides are local SVG data URIs, not reused).
- `docs/state-coverage.md`, `docs/browser-test-coverage.md`, `CHANGELOG.md` — existing coverage records.

## Implementation notes and verified observations

- Slides are local text cards (`Slide N`); the page adds vertical padding so the absolutely positioned
  Play/Pause and Next controls do not collide on a short slide.
- The autoplay examples use a 30000ms interval so a live page or a capture never advances by itself; tests drive
  the interval with `page.clock`. The fake clock does not stall Angular or Transloco timers here, but the 120ms
  scroll-sync debounce is a faked timer too: advancing the clock while a smooth scroll is still in flight reads a
  mid-flight `scrollLeft` and moves `index` backwards, so tests wait for the scroll to finish before each `runFor`.
- `kui-carousel` has no `min-inline-size: 0`. As a grid item its automatic minimum width is the sum of its slides'
  content widths, so at 320px it overflowed the example card until the page's example grid used
  `minmax(0, 1fr)`. Recorded as a library observation, worked around in page layout SCSS only.
- At 320px with `itemsPerView` 2 or 3 the arrows overlay slide content and the slide text wraps or is covered;
  this is shipped behavior and is shown, not hidden.
- Swipe-only has no focusable element, so the region keyboard handler is unreachable there (documented WCAG 2.5.7
  trade-off); drag and touch are the only operation paths.
- Touch swipe is exercised with real touch events dispatched through the browser input pipeline (CDP
  `Input.dispatchTouchEvent`, Chromium only). The track moves and `index` follows; the final resting position
  after the synthetic release was observed between slides and is therefore not asserted. Touch on a
  `draggable=false` track does not move it.
- The Play/Pause label and pause-on-hover findings are asserted as `test.fixme` with the expected behavior; the
  passing autoplay tests avoid depending on the defective label.
- Axe: see the final report for the route's rule ids.

## Self-review checklist (final)

- [x] Parent reviewed this audit.
- [x] Every input/model/output mapped to an example or omission.
- [x] Findings 1 and 2 reproduced with real input; finding 8 verified in captures.
- [x] Desktop and 320px captures opened and inspected; interaction captures inspected.
- [ ] Real assistive-technology review: not performed.

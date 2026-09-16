# Carousel

Horizontal strip of arbitrary-content slides with Prev/Next arrows, a dot picker, and optional
autoplay. New pattern (not among the kit's pre-existing primitives), built from Claude Design spec
`07 Carousel.dc.html`.

The slide track is native scroll + `scroll-snap`, scrolled programmatically to the current slide --
not a hand-rolled transform animation -- so trackpad/touch swipe and its inertia come from the
browser for free. `[kuiCarouselSlide]` marks projected slide content (`role="group"` +
`aria-roledescription="slide"`), the same content-projection shape `kuiTab`/`kuiTabPanel` use for
`kui-tabs`. Prev/Next/Play/Pause reuse `button[kuiIconButton]` with static inline SVG chrome
(`kui-chrome-icon-paths.util`) instead of the network-dependent, name-resolved `icon` input -- the
same treatment `kui-pagination` and `kui-media-viewer` already give their own essential-to-operate
controls.

## Import

```ts
import { KuiCarouselComponent, KuiCarouselSlideDirective } from '@kikita-labs/ui';
```

Import runtime styles once:

```ts
import '@kikita-labs/ui/styles';
```

## Usage

```html
<kui-carousel ariaLabel="Product photos" [(index)]="slide">
  <div kuiCarouselSlide><img src="photo-1.jpg" alt="" /></div>
  <div kuiCarouselSlide><img src="photo-2.jpg" alt="" /></div>
  <div kuiCarouselSlide><img src="photo-3.jpg" alt="" /></div>
</kui-carousel>
```

```ts
protected readonly slide = signal(0);
```

`ariaLabel` is required and must not contain the word "carousel" -- the region's own
`aria-roledescription="carousel"` already announces that to screen readers.

## itemsPerView

```html
<kui-carousel ariaLabel="Two at a time" [itemsPerView]="2">...</kui-carousel>
```

How many slides are visible at once. Defaults to `1`. The highest reachable `index` is
`slideCount - itemsPerView` (clamped to `0`), and the dot picker renders exactly that many dots --
not one per slide -- since intermediate positions past that point are unreachable.

## Loop

```html
<kui-carousel ariaLabel="Looping slides" loop>...</kui-carousel>
```

Defaults to `false`, which disables Prev at `index === 0` and Next at the last reachable index
(native `disabled`, removed from tab order). `loop` wraps navigation at the edges instead.

## Autoplay

```html
<kui-carousel ariaLabel="Autoplay slides" autoplay [autoplayInterval]="4000">...</kui-carousel>
```

Defaults to `false`. When enabled, a Play/Pause control is always visible (never hidden behind
`autoplay`, per the design spec) and autoplay pauses while the pointer, focus, or a touch
interaction is inside the region -- a deliberate compromise with the general accessibility guidance
to avoid autoplay entirely. The track's `aria-live` toggles between `off` while autoplay is actually
advancing and `polite` whenever it is paused (manually, by hover, or by focus), so manual navigation
is still announced.

## Manual scroll, swipe, and drag

```html
<kui-carousel ariaLabel="No manual drag" [draggable]="false">...</kui-carousel>
```

Touch swipe and trackpad/wheel scroll are not separate features to turn on -- they always work
via the track's native `overflow-x: auto`. `draggable` (default `true`) adds a pointer-based mouse
drag-to-scroll on top for desktop, since a mouse has no native swipe gesture; it is one flag for
both touch swipe and mouse drag, since they are the same "drag the track" action from different
input devices, not two independent features. A debounced `scroll` listener snaps `index` to the
nearest slide once scrolling settles (after a swipe, a mouse drag, or programmatic `scrollLeft`),
so the dot picker, Prev/Next disabled state, and any `[(index)]` binding stay in sync with wherever
the user actually moved the track.

Setting `draggable` to `false` also switches the track to `overflow-x: hidden`, since blocking only
the drag gesture would still leave wheel/trackpad scroll able to move it (matching a known gap in
some other kits' carousels, where a single "draggable" boolean doesn't stop native container
scroll on its own).

Mouse drag disables `scroll-snap-type` for the gesture's duration and restores it only once the
release's snap-to-nearest-slide scroll has actually settled (`scrollend`, with a timeout fallback),
not immediately on release: flipping snapping back on while `scrollLeft` isn't already at a snap
point makes the browser correct the position itself as an instant jump instead of letting the
animated `scrollTo` play out. A new drag starting before that restore fires cancels it, so a quick
release-then-redrag can't get the track stuck fighting a stale `mandatory` snap re-enabled mid
gesture. This is a deliberate, narrower deviation from the Claude Design spec's own reference
implementation, which restores `scroll-snap-type` unconditionally and immediately on release --
that produces the same instant-jump artifact.

## Navigation visibility

```html
<kui-carousel ariaLabel="Dots only" [showArrows]="false">...</kui-carousel>
<kui-carousel ariaLabel="Arrows only" [showDots]="false">...</kui-carousel>
```

`showArrows`/`showDots` both default to `true`. Swipe/scroll works regardless of either setting.
`showArrows=false, showDots=false` ("swipe only") is left reachable as a configurable combination
even though it is not self-sufficient under WCAG 2.5.7 (Dragging Movements) -- an explicit,
documented open question in the design spec, not an oversight.

## API

| Input              | Type          | Default       | Description                                                             |
| ------------------ | ------------- | ------------- | ----------------------------------------------------------------------- |
| `itemsPerView`     | `number`      | `1`           | How many slides are visible at once.                                    |
| `loop`             | `boolean`     | `false`       | Wraps navigation at the edges instead of disabling Prev/Next there.     |
| `autoplay`         | `boolean`     | `false`       | Advances automatically on a timer; always shows Play/Pause.             |
| `autoplayInterval` | `number` (ms) | `4000`        | Autoplay delay between slides.                                          |
| `showArrows`       | `boolean`     | `true`        | Shows the Prev/Next arrow controls.                                     |
| `showDots`         | `boolean`     | `true`        | Shows the dot picker below the track.                                   |
| `draggable`        | `boolean`     | `true`        | Enables mouse drag-to-scroll; `false` also locks wheel/trackpad scroll. |
| `ariaLabel`        | `string`      | -- (required) | Accessible name for the carousel region. Must not contain "carousel".   |
| `index`            | `number`      | `0`           | Index of the first visible slide. Two-way model.                        |

| Output        | Payload  | Description                                      |
| ------------- | -------- | ------------------------------------------------ |
| `indexChange` | `number` | Emitted whenever `index` changes (model output). |

`[kuiCarouselSlide]` has no inputs -- apply it to the element wrapping each slide's content.

## Accessibility

- The outer element is `role="region"` with `aria-roledescription="carousel"` and the required
  `ariaLabel`, per the W3C ARIA APG "grouped carousel" pattern.
- Each slide is `role="group"` with `aria-roledescription="slide"` and an `aria-label` of
  `"N of total"`.
- The dot picker follows the "tabbed carousel" variant: `role="tablist"`/`role="tab"`,
  `aria-selected`, `aria-controls` pointing at the corresponding slide's `id`, and roving
  `tabindex` (only the selected dot is in the natural tab order; arrow keys/`Home`/`End` move
  both focus and selection between dots).
- The region itself also responds to `ArrowLeft`/`ArrowRight`/`Home`/`End` to move the current
  slide, independent of dot focus.
- Prev/Next/Play/Pause are `button[kuiIconButton]` with a required `aria-label`, no visible text.
- Range boundaries (when `loop` is `false`) use the native `disabled` attribute on Prev/Next,
  removing them from tab order, not just dimming them.
- Play/Pause order and pausing autoplay on hover/focus follow the W3C APG "Auto-Rotating Image
  Carousel Example".
- Mouse drag-to-scroll (`draggable`, default `true`) is an added affordance on top of the required
  non-drag alternatives (Prev/Next buttons, dots, keyboard) -- never the only way to navigate,
  except in the same intentionally-noncompliant `showArrows=false, showDots=false` combination
  already called out above.
- Combining `autoplay` with `showArrows=false`, `showDots=false`, and `draggable=false` leaves no
  way to pause a self-updating carousel by hand, which conflicts with WCAG 2.2.2 (Pause, Stop,
  Hide) for content that auto-updates for longer than 5 seconds. Every one of those props is
  reachable individually for other reasons; this specific combination is a deliberate, documented
  spec trade-off (see the design spec's own open questions), not a recommended production pattern
  -- only use it for purely decorative rotation that carries no information a user would need to
  pause and read.

| Key                      | Where       | Action                                      |
| ------------------------ | ----------- | ------------------------------------------- |
| `ArrowLeft`/`ArrowRight` | Region      | Previous/next slide.                        |
| `Home`/`End`             | Region      | Jump to the first/last reachable slide.     |
| `ArrowLeft`/`ArrowRight` | Dot picker  | Move focus and selection between dots.      |
| `Home`/`End`             | Dot picker  | Move focus and selection to first/last dot. |
| `Enter`/`Space`          | Any control | Activates the focused button.               |

## CSS custom properties

| Token                                                    | Default                                                                     | Description                               |
| -------------------------------------------------------- | --------------------------------------------------------------------------- | ----------------------------------------- |
| `--kui-carousel-gap`                                     | `--kui-space-4`                                                             | Gap between slides / track padding.       |
| `--kui-carousel-radius` / `-slide-radius`                | `--kui-radius-lg` / `--kui-radius-md`                                       | Region / slide corner radius.             |
| `--kui-carousel-bg` / `-border` / `-slide-bg`            | `--kui-color-surface` / `--kui-color-border` / `--kui-color-surface-sunken` | Region background/border, slide backdrop. |
| `--kui-carousel-control-bg` / `-control-shadow`          | `--kui-color-surface` / `--kui-shadow-lg`                                   | Prev/Next/Play backdrop circle.           |
| `--kui-carousel-dot-bg` / `-dot-bg-active` / `-dot-size` | `--kui-color-border` / `--kui-color-primary-fill` / `--kui-space-2`         | Dot picker.                               |

## Height

The component never fixes `block-size` on the track or a slide -- height comes entirely from slide
content, or from a `block-size` the consumer sets on the carousel's own root with ordinary CSS, the
same way other token overrides work. A compact 100px-tall strip at `itemsPerView=1` needs no special
prop -- just slide content that is 100px tall.

## Known gaps

- No responsive `itemsPerView` (per-breakpoint values) -- it is a plain number, matching the design
  spec's own scope cut.
- No size/compact prop for the whole carousel -- matching every researched kit (Ant Design,
  NG-ZORRO, PrimeNG/PrimeVue/PrimeReact, Taiga UI), none of which give their own Carousel a size
  prop either: the component always sizes to its container, and Prev/Next/Play inherit their size
  from the kit's own size/density DI context (the same mechanism `data-kui-density` uses), not from
  a prop threaded through by `kui-carousel` itself.
- Browser-smoke-checked at desktop width (1920px window) in both dark and light theme:
  navigation, keyboard, dot picker, autoplay toggle, manual-scroll-to-index sync, no console
  errors, no page-level horizontal overflow. Narrow mobile width was not verified in a real
  viewport -- the review session's `resize_window` tool did not actually change the browser
  window size (confirmed via `window.innerWidth` staying at the desktop value across repeated
  attempts and a fresh tab), so mobile is untested rather than passing; the CSS itself uses no
  media queries or fixed pixel widths that would be expected to break narrower, but that is not a
  substitute for an actual narrow-viewport check.
- Not part of the curated Playwright visual-regression baseline set (`docs/visual-regression.md`
  lists specific representative routes; newer primitives including Pagination, Time Picker, Link,
  and Media Viewer are likewise not in that list) -- no committed baseline gap here, by the same
  precedent.
- No formal assistive-technology review (real screen reader) has been run -- this requires
  NVDA/JAWS/VoiceOver, which was not available in the review environment. DOM smoke (roles,
  labels, no stale ARIA refs) and a full keyboard-only walkthrough have been done; AT review is a
  genuine open gap, not merely undocumented.

# Design Provenance and Portable Handoff

## Existing Baseline

[The design-system specification](design-system-spec.md) records the Ember token
and visual foundations derived from the original Claude Design exports.
Component documents record the implemented API, states, and known limits.
Source CSS and tests provide the reproducible implementation baseline.

These records do not retroactively approve every implementation detail. In
particular, the line, scatter, and donut loading placeholders have no recorded
approved loading design, and chart marker-shape and center-content designs remain
unresolved. Preserve these gaps when changing the affected visuals.

Historical exports were local authoring inputs, not distributed package assets.
An unavailable export is not review evidence. Existing nonvisual maintenance can
use the tracked contract; new or changed visuals require the approved design
record described below. Do not infer missing visuals from another library.

## Required Record for Visual Changes

Before implementation, add the relevant approved requirements to the matching
component document or a linked tracked design document. Record:

- origin and approval evidence, with an accessible source or tracked excerpt;
- anatomy, native semantics, projected content, and component-owned chrome;
- variants, sizes, density, and default values;
- rest, hover, focus, active, selected, disabled, invalid, loading, and empty states
  where applicable;
- semantic/component token mappings, light/dark and forced-colors treatment;
- narrow layouts, text wrapping, overflow, zoom, and touch behavior;
- motion, reduced motion, keyboard interaction, and accessibility constraints;
- unresolved questions and explicit exclusions.

A functional request in [the design brief](design-brief.md) is not by itself
approval of appearance. Local exports may help prepare this record, but the
record must be usable from a clean checkout. If the source or approval is missing,
stop the affected visual work and report the exact gap. Continue independent
nonvisual work; do not weaken the design gate or invent a replacement.

## Preserved Component Decisions

| Surface      | Durable requirement / limitation                                                                                                                                             |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Link         | Real anchors navigate; action buttons retain native button semantics; typography variant and interactive tone have separate owners. See [Link](link.md).                     |
| Alert        | Title is optional for message-only notices; close emits an event and the consumer owns removal. See [Alert](alert.md).                                                       |
| Pagination   | Compose existing button/icon-button/select controls; current page has aria-current; the consumer owns slicing. See [Pagination](pagination.md).                              |
| Time Picker  | Cell selection stays open for choosing other fields; completion/dismissal closes the panel; column centering must not scroll the page. See [Time Picker](time-picker.md).    |
| Media Viewer | Photos only; fullscreen dialog preset; consumer owns triggers and selection; pan uses a fixed offset budget per zoom step. See [Media Viewer](media-viewer.md).              |
| Carousel     | Native scrolling and snap; explicit playback control; breakpoint-specific items-per-view remains outside the API. See [Carousel](carousel.md).                               |
| Splitter     | Adjacent panes resize together; hydrate before inserting internal gutters; no persistence or custom-thumb contract. See [Splitter](splitter.md).                             |
| Chart        | Nominal SVG sizing; positive/negative stacks separated; hidden donut slices excluded from totals; one tooltip overlay; exact-value alternative table. See [Chart](chart.md). |

This table preserves requirements already recorded in source documentation; it
does not replace a missing detailed visual specification or certify a new review.

## Colour System Decisions

The maintainer approved these colour requirements on 2026-10-02 (Plan 14). They are verifiable
from the repository: `projects/ui/src/lib/theme/create-kui-theme.contrast.spec.ts` measures every pair
for the default theme and for any seed, and the Playground axe sweep runs `color-contrast` in both
themes. They change how existing components look; there is no earlier pixel-level design record
for these surfaces to preserve.

| Surface                                                                                                                                  | Durable requirement                                                                                                                                                                                                                                                                                                                                                                                                     |
| ---------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Solid fills (Button, Icon Button, Alert, Badge-like fills, Calendar and Time Picker selection, Segmented, Stepper, Table and form marks) | The text, icon or mark on a fill uses the on-fill colour of the same accent (`--kui-color-<role>-on-fill`): white or near-black, whichever reaches 4.5:1. The fill is the same brand colour in light and dark mode, so the text colour is the same in both: white on every default accent; a consumer seed that is too light for white text gets near-black text. Hover and active move the fill away from that colour. |
| Accent text and icons                                                                                                                    | Text and icons coloured by an accent read `--kui-color-<role>-text` (4.5:1); an accent fill is only a background.                                                                                                                                                                                                                                                                                                       |
| Accent borders, marks and bars                                                                                                           | Borders, outlines, spinners, status dots, slider and progress fills and tab indicators read `--kui-color-<role>-indicator` (3:1).                                                                                                                                                                                                                                                                                       |
| Control boundary                                                                                                                         | Interactive controls draw their rest border with `--kui-color-border-control` (3:1 on every surface) and their hover border with `--kui-color-border-control-hover`; `--kui-color-border` stays for dividers and cards.                                                                                                                                                                                                 |
| Focus indicator                                                                                                                          | Every focusable part draws a solid outline in `--kui-color-focus`; a translucent halo is optional. Rings made only with `box-shadow` are not used.                                                                                                                                                                                                                                                                      |
| Placeholder and muted text                                                                                                               | Placeholders read `--kui-color-text-placeholder`; de-emphasised but active text reads `--kui-color-text-secondary`; `--kui-color-text-disabled` is reserved for disabled controls.                                                                                                                                                                                                                                      |
| Neutral solid Alert                                                                                                                      | Reads `--kui-color-neutral-fill` with `--kui-color-neutral-on-fill`.                                                                                                                                                                                                                                                                                                                                                    |
| Text over a scrim                                                                                                                        | Media Viewer and picker thumbs read `--kui-color-on-scrim` (white in both modes).                                                                                                                                                                                                                                                                                                                                       |

| Hover, pressed and highlighted rows | Hover and pressed fills of list options, menu items, calendar days and cells, tabs and ghost buttons use `--kui-color-state-hover` and `--kui-color-state-active`, a translucent layer of the text colour. A listbox option or menu item that has keyboard focus adds the same inset 2px focus frame. |
| Forced colors | State-bearing parts (checked Checkbox, Radio and Switch, Slider, Progress, selected Calendar and Time Picker cells, Tabs, Segmented, pressed Chip, Stepper) show their state with system colours: selected or filled parts use `Highlight` with `HighlightText`, tracks and connectors use `GrayText`, marks and thumbs use `ButtonText`. Every focusable part keeps a visible outline. |

## Shared Token Decisions

The maintainer instructed on 2026-10-05 (Plan 16, final sweep) to settle every remaining design literal
by best practice. The decisions are verifiable from the repository: `pnpm audit:static` fails on a
literal that bypasses a shared token, and the Docker visual baselines were reviewed side by side before
they were refreshed. They change how some surfaces look; there is no earlier pixel-level design record to
preserve.

| Surface                              | Durable requirement                                                                                                                                                                                                                 |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Disabled controls, cells and options | One opacity, `--kui-opacity-disabled` (`0.5`). Decorative de-emphasis (separators, sort glyphs) is a different thing and keeps its own value.                                                                                       |
| Focus ring size                      | Standalone controls `--kui-focus-ring-width` (3px) at `--kui-focus-ring-offset` (2px); parts inside a composite `--kui-focus-ring-width-sm` (2px); rows and cells in a scroll container draw it at `--kui-focus-ring-offset-inset`. |
| Motion                               | Enter and state changes use `--kui-duration-fast`, `-base` or `-normal` with `--kui-ease`; exits use `--kui-duration-quick` with `--kui-ease-exit`. Loops and reduced-motion idioms keep their own values.                          |
| Text line height and weight          | Headings, titles and body copy read the `--kui-type-*` roles; single-line control and label text reads `--kui-line-height-control`; weights read `--kui-font-weight-*`. Uppercase labels use `--kui-type-overline-letter-spacing`.  |
| Scrim                                | `--kui-color-scrim` behind Dialog, Drawer and Command Palette, `--kui-color-scrim-strong` behind the fullscreen Media Viewer, `--kui-color-on-scrim` on top of both.                                                                |
| Radius                               | Every corner radius reads the `--kui-radius-*` scale, so it follows the radius seed; `50%` stays for circles.                                                                                                                       |

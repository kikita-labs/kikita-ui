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

# Splitter Contract Inventory

This inventory maps the public Splitter contract to the page examples and browser checks. `kui-splitter` lays out two or more `kui-splitter-pane` children and generates one gutter (an inner `role="separator"` element plus an optional collapse button) between each adjacent pair (after `afterNextRender`, so the server response contains panes but no gutters). The audit was reviewed by the parent integrator before implementation; questions answered in review are recorded under "Review decisions".

## Public inputs, outputs, and members

### `kui-splitter`

| Member                                                                                                                 | Type, default, and resolution                                                                                                                                                                                                                        | Page coverage                                                                                                                                                                                                                                                                                |
| ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `orientation`                                                                                                          | `KuiSplitterOrientation` (`'horizontal' \| 'vertical'`); `input('horizontal')`, no transform. Host gets `data-kui-orientation`; the gutter `aria-orientation` is the perpendicular axis.                                                             | The default example omits it. The Orientation card shows both values. Browser: gutter `aria-orientation`, pane layout axis, arrow-key axis (wrong-axis arrows do nothing), mouse drag along the block axis.                                                                                  |
| `disabled`                                                                                                             | `boolean`; `input(false, { transform: booleanAttribute })`. Host gets `data-kui-disabled`. Every gutter gets `aria-disabled="true"` and `tabindex="-1"`; the gutter has `pointer-events: none`.                                                      | Disabled card with a native button in a pane. Browser: not reachable by Tab, arrows and End leave `aria-valuenow`, mouse drag leaves pane geometry unchanged, the pane button still works.                                                                                                   |
| `sizesChange`                                                                                                          | `output<readonly number[]>()`. Emits the full sizes array (percentages) on each drag move and on each keyboard or collapse resize that changes a size. Not emitted on initial layout, on a clamped zero-delta step, or when `Escape` reverts a drag. | Resize output card: last emitted sizes and an emission counter. Browser: keyboard step emits `52 / 48`, End emits `90 / 10`, a clamped step emits nothing, a mouse drag emits and the readout equals the measured geometry, and the silent `Escape` revert is recorded as observed behavior. |
| `panes`                                                                                                                | `contentChildren(KuiSplitterPaneComponent)`, public on the class, not in the docs tables.                                                                                                                                                            | Not shown directly. Browser: gutter count equals `panes - 1` for 2, 3, and 4 panes.                                                                                                                                                                                                          |
| `sizes`, `draggingIndex`, `sizeOf`, `minSizeOf`, `collapseTargetFor`, `isPaneCollapsed`, `toggleCollapse`, `onGutter*` | Public members that satisfy the internal `KuiSplitterContext`; undocumented; the context interface and token are not exported from the barrel (`splitter/index.ts` exports the two components and the orientation type).                             | Omitted as consumer API. Their observable effects are covered through the DOM (`data-kui-dragging`, sizes, collapse).                                                                                                                                                                        |

### `kui-splitter-pane`

| Member             | Type, default, and resolution                                                                                                                                                                                                                                                                       | Page coverage                                                                                                                                                                                                                           |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `size`             | `number \| undefined`; `input<number \| undefined>(undefined, { transform })`. The transform maps undefined, null, `''`, negative and non-finite values to `undefined` and clamps above 100. Read at initial layout and when the pane count changes only. Panes without a size share the remainder. | Default (50/50), 30/70, one explicit 20 of three (20/40/40). Browser: pane geometry equals `(container - gutters) * percentage`. Templates must bind `[size]="30"`: see finding 8.                                                      |
| `minSize`          | `number`; `input(10, { transform })`. `numberAttribute(value, 10)` clamped to 0..100. Clamps drag, arrows, Home, End for the two panes at a gutter, and is the collapse floor.                                                                                                                      | Default 10 (default example) and `[minSize]="40"` on both panes (limits 40/60). Browser: `aria-valuemin` and `aria-valuemax`, Home and End stop at the limits, drag past the limit clamps at 10.                                        |
| `collapsible`      | `boolean`; `input(false, { transform: booleanAttribute })`. Effective only on the first or last pane; a middle pane flag is silently ignored. Renders a `button` in the adjacent gutter.                                                                                                            | First pane, last pane, vertical last pane, and a three-pane example with a collapsible middle pane that shows no button. Browser: click, Enter, and touch tap toggle; the button label flips between "Collapse pane" and "Expand pane". |
| `currentSize`      | `Signal<number>`, live percentage.                                                                                                                                                                                                                                                                  | "Size" readout under the first and last collapsible examples through a template reference. Browser: readout equals the measured size after collapse and expand.                                                                         |
| `collapsed`        | `Signal<boolean>`; set only inside `toggleCollapse()`.                                                                                                                                                                                                                                              | "Collapsed" readout beside "Size". Two fixme tests record where it disagrees with the layout (finding 2).                                                                                                                               |
| `toggleCollapse()` | Method; no-op when not collapsible or a middle pane.                                                                                                                                                                                                                                                | Exercised through the gutter button and `Enter`; a page-level call adds nothing.                                                                                                                                                        |
| `id`, `elementRef` | Public readonly fields. `id` (`kui-splitter-pane-N`) feeds the gutter `aria-controls`.                                                                                                                                                                                                              | Omitted as consumer API; see finding 4.                                                                                                                                                                                                 |

There are no models. `KuiSplitterOrientation` is the only exported type. The page binds the orientation as a literal attribute.

## Keyboard, pointer, and touch behavior

| Key                                         | Behavior (implementation)                                                                                                          | Browser check                                                                                        |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Left/Right (horizontal), Up/Down (vertical) | Move the before-pane edge by 2 points, `Shift` by 10, clamped by both panes' `minSize`; wrong-axis arrows do nothing; no RTL flip. | Per orientation, including wrong-axis arrows, Shift, and clamped steps.                              |
| `Home`, `End`                               | Before pane to `minSize`, or to `100 - after.minSize`.                                                                             | `aria-valuenow` equals `aria-valuemin` and `aria-valuemax`.                                          |
| `Enter`                                     | Toggles collapse of the first or last collapsible pane; no-op otherwise.                                                           | Collapsible examples toggle; default and middle-pane gutters ignore it.                              |
| `Escape`                                    | While a drag is active, reverts to the drag-start sizes and ends the drag; does not emit `sizesChange`.                            | Real mouse drag, `Escape`, release: geometry returns to the start; the readout stays at drag values. |
| `Tab`                                       | Each gutter in order; the collapse button is `tabindex="-1"`.                                                                      | Three-pane example visits both gutters in order; the disabled gutter is skipped.                     |

Pointer: `pointerdown` captures the pointer, focuses the gutter, records start sizes and the available pixels (splitter `clientWidth` or `clientHeight` minus gutter pixels); `pointermove` applies `(deltaPx / availablePx) * 100` from the drag start; `pointerup` and `lostpointercapture` end the drag. `touch-action: none` on the gutter lets touch events reach the same handlers. The collapse button is a sibling of the separator, so its `pointerdown` never reaches the separator's handlers.

Browser evidence with real input: `page.mouse` drags (horizontal, vertical, nested inner) with geometry assertions in percentages computed from measured pane pixels; a touch drag through Chromium CDP `Input.dispatchTouchEvent` in a `hasTouch` context asserting geometry and that the page did not scroll; a separate `tap()` on the collapse button (a tap after a CDP touch drag in the same page produced pointer events without a click in Chromium, so the two run in separate contexts); real `Tab`, arrow, Home, End, Enter, and Escape presses.

## Visual and lifecycle states

- Rest, hover (real `mouse.move`), focus-visible (real `Shift+Tab` back onto the gutter), dragging (mouse held), collapsed first and last pane, resized output, disabled, and the light theme of the collapsible catalogue.
- SSR: the server response has both panes and no gutters; hydration reuses the server nodes, adds the gutter, and the page stays interactive. Verified with held scripts and a marker attribute.
- Locale: catalogue copy switches EN/RU; the library-owned collapse button labels stay English (recorded, not translated).
- Layout: the splitter is `inline-size: 100%; block-size: 100%`, so each example sits in a frame whose block size is a multiple of a Kikita space token. 320px, 768px, and desktop are checked for document overflow.
- At 320px the shell overlays tall element screenshots when the viewport is short, so 320px captures use a 2000px tall viewport (same as the Slider spec).

## Source audit

- [Docs](../../../../../../../../../docs/splitter.md), [splitter](../../../../../../../../../projects/ui/src/lib/components/splitter/kui-splitter.component.ts), [pane](../../../../../../../../../projects/ui/src/lib/components/splitter/kui-splitter-pane.component.ts), [gutter](../../../../../../../../../projects/ui/src/lib/components/splitter/kui-splitter-gutter.component.ts), [context token](../../../../../../../../../projects/ui/src/lib/components/splitter/kui-splitter-context.token.ts), [unit spec](../../../../../../../../../projects/ui/src/lib/components/splitter/kui-splitter.component.spec.ts) (15 tests), and [stylesheet](../../../../../../../../../projects/ui/src/styles/splitter.css).
- Legacy scenarios (reference only): default, vertical, collapsible first pane, three panes, nested IDE layout, disabled, and a sizes readout.

## Discrepancies and findings

1. **No `maxSize` input.** The effective maximum is `100 - after.minSize` (`aria-valuemax`). The page covers `minSize` only.
2. **`collapsed()` and the button label desync (defect, reproduced).** `collapsed()` and the label change only in `toggleCollapse()`. Reproduced in the browser: after `Home` on the collapsible first pane the pane is at 15 but the readout says `15 / No`; after a button collapse followed by `Shift+ArrowRight` the pane is at 25 but the readout says `25 / Yes`. The `pane.collapsed` JSDoc says it follows Enter/Home/End. Recorded as two `test.fixme` tests.
3. **Collapse does not hide the pane.** It moves the pane to its `minSize`. Documented, not a defect.
4. **`aria-controls` dangled (defect, fixed in Plan 10.3).** The gutter set `aria-controls` to `pane.id`, but the pane never bound `id` to its element, which produced the axe rule `aria-valid-attr-value`. The pane now renders `id`, and the regression is a normal test.
5. **`nested-interactive` (library markup, fixed in Plan 10.3).** The collapse `button` sat inside the focusable `role="separator"`. The separator is now an inner element of `kui-splitter-gutter` and the button is its sibling. The axe sweep reports no violation for `/components/splitter`.
6. **`Escape` revert emits no `sizesChange` (open contract question).** The consumer's last emitted sizes stay at the abandoned drag values while the layout returns to the start. Docs do not say. Recorded as observed behavior by a normal test, not fixme.
7. **`sizesChange` JSDoc** says "drag or keyboard"; it also fires for collapse and expand. Not a defect.
8. **Docs/types mismatch on `size`.** `docs/splitter.md` and the class JSDoc show `size="30"`, but the input is declared `input<number | undefined>(undefined, { transform })`, so the accepted template type is `number | undefined` and a string attribute fails strict template checking (`TS2322`). The page uses `[size]="30"`.
9. **Touch target.** The interactive strip is 8px (documented known gap). The touch test asserts that touch drag and tap work; it does not claim 44px compliance.
10. **Chevron direction (observation, unverified against the design record).** The gutter code comment says the chevron points in the direction the click moves the pane, but the rendered chevron on the first pane points toward the remaining pane. No design record was consulted, so this is reported only as a question.
11. No RTL mirroring exists; RTL is not covered. Initial `size` values that do not sum to 100 render clipped and are unsupported.

## Review decisions

- The `collapsed` and `currentSize` readouts stay on the page and expose finding 2 as real state.
- Dynamic pane add and remove is omitted.
- Finding 6 stays documented observed behavior with an open contract question for the parent; no fixme.

## Catalogue (cards in page order)

Every card is a `role="group"` with a translated name; each example inside is a group named by its visible heading. The `h1` is `Splitter` (`id="splitter-playground-title"`), scope `splitter`.

| Card                   | Group name                      | Content                                                                                     |
| ---------------------- | ------------------------------- | ------------------------------------------------------------------------------------------- |
| Default                | Default splitter example        | "Two equal panes", no inputs.                                                               |
| Orientation            | Splitter orientation examples   | "Horizontal" and "Vertical".                                                                |
| Sizes and minimum size | Splitter size examples          | "Sizes 30 and 70", "One explicit size of 20", "Minimum size 40".                            |
| Collapsible panes      | Splitter collapsible examples   | First pane and last pane (with readouts), vertical last pane, collapsible middle (ignored). |
| Multiple panes         | Splitter multiple pane examples | "Three panes" and "Four panes".                                                             |
| Nested splitters       | Nested splitter example         | "Vertical outer, horizontal inner".                                                         |
| Disabled               | Disabled splitter example       | "Disabled panes" with a pressable button.                                                   |
| Resize output          | Splitter resize output example  | "Last resize" with last sizes and change count.                                             |

Screenshots (`@visual`): every group at desktop and 320px (16), gutter hover, focus, and dragging (3), collapsed first and last pane (2), output after a keyboard resize (1), light theme collapsible catalogue (1).

## Omitted combinations

- `maxSize`: does not exist.
- Dynamic pane add or remove: only internal JSDoc describes it (review decision).
- Sizes not summing to 100, negative or non-numeric `size`: no meaningful visual; the transform is unit-level.
- `--kui-splitter-*` token overrides: theming hooks, not inputs.
- Custom thumb (`[kuiSplitterThumb]`): not implemented (docs known gap).
- Middle-pane collapse: unsupported; shown only as the "ignored" example.
- RTL: not implemented.

## Self-review checklist

- [x] Every public input, output, and documented member of `kui-splitter` and `kui-splitter-pane` is accounted for with type, default, and observed behavior.
- [x] Docs, implementation, unit spec, types, and the legacy scenarios were compared and discrepancies listed.
- [x] Finding 2 was reproduced in the browser before being marked `test.fixme`; finding 4 was too, and was fixed in Plan 10.3.
- [x] English and Russian catalogues have identical key sets.
- [x] Desktop and 320px screenshots were opened and inspected; the mobile checks confirm no document-level horizontal overflow.
- [ ] Independent review and the page-only commit are recorded in the rollout tracker by the parent.

# Component Roadmap

## Phase 1

- Theme foundation
- Typography (done as CSS role/tone utility classes plus `kuiText` directive)
- Icon abstraction (done as `kui-icon`; default Lucide resolver, registry/resolver overrides, named
  size presets, and numeric/CSS custom sizes)
- Button
- IconButton
- Field (affixes, field actions, input-group focus delegation, and rich messages covered from Claude spec 33)
- Input
- Group
- Playground component board

## Phase 2

- Signal Forms integration spike (native `kuiInput` + Angular `[formField]` proven)
- Textarea (done as `textarea[kuiTextarea]`)
- Checkbox (done as `input[type=checkbox][kuiCheckbox]`)
- Switch (done as `input[type=checkbox][kuiSwitch]`)
- Radio (done as `input[type=radio][kuiRadio]`)
- Badge (done as `[kuiBadge]`)
- Avatar (done as `kui-avatar` + `kui-avatar-group`)
- Loader (done as `[kuiLoader]`)
- Skeleton (done as `[kuiSkeleton]`)
- Empty State (done as `kui-empty-state` + projected icon/actions markers)
- Tooltip (done as `[kuiTooltip]`; adaptive touch tap trigger, configurable through DI and local `triggerType`)
- Card (done as `[kuiCard]`)
- Tabs (done as `kui-tabs`)
- Segmented (done as `kui-segmented`)
- Table primitives (done as `table[kuiTable]`; deeper static accessibility review completed, browser/AT review pending)

## Phase 3

- Select (done as `input[kuiSelect]` with `kui-dropdown` and `kuiOption`; multiple mode renders field-internal chips with collapsed `+N` overflow and supports `ng-template[kuiSelectValue]`)
- Dropdown (done as `kui-dropdown` + `[kuiDropdownFor]` + `[kuiOption]`; controlled `open` model;
  field auto-wiring via `contentChild`; pointer and keyboard option selection)
- Popover (done as `kui-popover` + `[kuiPopoverFor]`)
- Dialog (done as `kui-dialog` + dialog service)
- Confirm (done as `kuiConfirm()` on top of Dialog)
- Toast (done as toast provider/service + viewport; reactive persistence, ref updates, and service dismissal)
- Accordion (done as `kui-accordion`)
- Progress (done as `kui-progress`)
- Slider (done as `input[type=range][kuiSlider]`; `kui-field` id/ARIA/invalid wiring covered)
- Number input (done as `input[type=number][kuiNumberInput]`)
- Menu (done as `kui-menu` + `[kuiMenuFor]` + `button/a[kuiMenuItem]` + `hr[kuiSeparator]`; submenu, checkbox/radio items, and context-menu helper deferred per Claude brief)
- Separator (done as `hr[kuiSeparator]`; Menu uses the generic separator directly)
- Drawer (done as `kuiDrawer()` typed CDK overlay with side and size presets)
- Chip (done as `[kuiChip]` with a `removable` default remove button, plus `button[kuiChipRemove]`
  as the escape hatch for a fully custom remove control; Select multiselect uses
  `button[kuiChipRemove]` for selected values)
- Combobox (done as `input[kuiCombobox]` with projected `kui-dropdown`/`kuiOption`, search output, highlight pipe, free mode, and provider defaults)
- Command Palette (done as `kui-command-palette`; supports grouped commands, filtering with label highlights, loading skeleton rows, empty state, keyboard navigation, and CDK overlay focus trapping)
- Scrollbar (done as `.kui-scroll` CSS utility plus internal scroll-container styling for dropdown, dialog, drawer, and command palette)

## Phase 4

- Color Input (done as `input[kuiColorInput]` for the kikita-ui-docs theme playground seed editor; supports hex and OKLCH text entry, swatch preview, chevron trigger, Kikita popover picker, 2D lightness/chroma surface, hue slider, L/C/H inputs, seed presets, copy action, `kui-field` composition, sizes, disabled, readonly, invalid state, and last-valid-color behavior while invalid)
- Stepper (done as `kui-stepper` + `kui-step`; horizontal/vertical orientation, sm/md/lg sizes, compact dots-only mode, done/current/upcoming/disabled/error states derived from `currentIndex`, clickable done-step back navigation, optional non-linear forward jumps)
- Breadcrumbs (done as `ol[kuiBreadcrumbs]` + `a|span[kuiBreadcrumbItem]` + `li[kuiBreadcrumbSeparator]`; sm/md/lg sizes, link/plain-text/current crumb variants, leading icon slot, CSS-only truncate/ellipsis/first-last responsive building blocks with overflow-menu wiring left to the consumer)

## Phase 5

- Calendar (done as `kui-calendar`; single-date selection only as of this release -- `mode` and the `Date | KuiDateRange | null` union `value` were split out. Month/year/decade navigation, keyboard support, `minDate`/`maxDate`/`disabledDates`, `flat` variant, `viewDate`/`showPrevNav`/`showNextNav` for linked-pair layouts, `KUI_LOCALE`-driven month/weekday names via `Intl`; multi-date selection deferred, no concrete use case yet)
- Calendar Range (done as `kui-calendar-range`; split out of `kui-calendar`'s former `mode="range"`. Start/end pair selection with hover preview and reversed-range normalization, same month/year/decade navigation, keyboard support, `minDate`/`maxDate`/`disabledDates`, `flat` variant, `viewDate`/`showPrevNav`/`showNextNav`, `KUI_LOCALE`-driven locale as `kui-calendar`; not yet composed into a popover-based range picker)
- Date Picker (done as `input[kuiDatePicker]` + `kui-calendar` + `kui-dropdown`; `dd.MM.yyyy` text mask, `minDate`/`maxDate`, `clearable`, Signal Forms control contract. `input[kuiDatePicker]` now auto-discovers a sibling `kui-calendar` inside the same `kui-field` and auto-wires `value`/`viewDate` via `effect()`s -- manual `[value]`/`(valueChange)`/`[(viewDate)]` binding on the calendar is optional, kept working for backward compatibility. `minDate`/`maxDate` are not auto-forwarded, since `kui-calendar` declares them as plain inputs. Range mode (pairing with `kui-calendar-range`) and a mobile bottom-sheet popover variant are not implemented -- single-date only for now)

## Phase 6

- Tree (done as `kui-tree` + recursive internal `kui-tree-node`; `display` and `checkable` modes,
  indeterminate checkbox cascading, lazy-loaded children via `loadChildren`, roving-tabindex
  keyboard navigation with type-ahead; per-node `icon` is limited to the built-in `folder`/`file`
  glyphs -- a custom icon `TemplateRef` slot and virtualization are not implemented)

## Phase 7

- File Upload (done as `kui-file-upload`; `dropzone` and `compact` variants, `single`/`multiple`
  mode, client-side `accept`/`maxSize`/`maxCount` validation, drag-and-drop, image thumbnail
  previews, and a file list with pending/uploading/success/error rows. It is a controlled
  component -- no upload transport is built in; the consumer drives `status`/`progress` on the
  two-way `files` model and responds to `(retry)`. Built ahead of the original "wait for a real
  consumer" gate because a real consumer need now exists.)

## Phase 8

- Alert (done as `kui-alert`; inline notification companion to Toast, built from Claude Design spec
  `01 Alert.dc.html`. `neutral`/`info`/`success`/`warning`/`danger` appearances x `soft`/`outline`/
  `solid` shapes, `sm`/`md` sizes, optional icon reusing Toast's severity mapping and rendered as
  inline SVG from `kui-chrome-icon-paths.util` -- same synchronous, SSR-safe chrome pattern as
  Toast, not the async name-resolved `kui-icon` -- optional title/message, optional inline
  `kuiButton` ghost action, optional `kuiIconButton` ghost close (icon projected as inline SVG,
  not the `icon` input), `banner` full-width no-radius variant. `role="alert"`/`aria-live="assertive"`
  only for `danger`, `role="status"`/`aria-live="polite"` otherwise, always `aria-atomic="true"`,
  same pattern as Toast. Controlled component -- `(closed)` only notifies the consumer, it does not
  remove itself from the DOM. `[kuiAlertTitle]`/`[kuiAlertIcon]`/`[kuiAlertMessage]`/
  `[kuiAlertActions]` marker directives let a consumer project custom title/icon/message/action
  content instead of the plain-string inputs, the same shorthand-input-or-projected-content
  pattern `kui-empty-state` uses.)
- OTP Input (done as `kui-otp-input`; row of single-character cells for a one-time verification
  code/PIN, built from Claude Design spec `02 OTP Input.dc.html`. Composite component (not a
  directive) because it needs roving keyboard navigation, paste distribution, and coordinated
  per-cell value state -- each cell still renders the kit's own `input[kuiInput]` unmodified,
  only cell layout is overridden. `length` (default `6`), `size` (`xs`/`sm`/`md`/`lg`), `mask`
  (password-style cells), `integerOnly` (digits-only numeric keyboard vs. uppercased alphanumeric
  for backup codes), `loading` (disables cells + shows `Loader`), `invalid`/`disabled`/`readOnly`,
  `autoFocus`. Implements `FormValueControl<string>` for `[formField]` on `kui-otp-input` itself,
  the same pattern `kui-segmented` uses; `kui-field` wraps it for label/hint/error. No built-in
  success/error status icon after verification -- an intentional scope decision, since the
  component cannot know a server verification result on its own.)
- Pagination (done as `kui-pagination`; navigation between pages of a long list/table, built from
  Claude Design spec `03 Pagination.dc.html`. Composed entirely from existing primitives --
  `button[kuiButton]` for page numbers, `button[kuiIconButton]` for First/Prev/Next/Last,
  `input[kuiSelect]` for the rows-per-page picker -- plus a static non-interactive ellipsis, the
  one piece of markup with no kit primitive. `variant` (`full`/`compact`/`simple`), `size`
  (`xs`/`sm`/`md`/`lg`, same scale as `Button`), `totalPages` (required), `currentPage`/`pageSize`
  (two-way models), `siblingCount`/`boundaryCount` (MUI `usePagination` vocabulary), `totalItems`,
  `disabled`. Standalone sibling of `table[kuiTable]`, never nested inside it -- `kuiTable` is a
  directive on a bare `<table>` (whose only legal children are thead/tbody/tfoot/tr) with no
  slicing concept of its own, so the consuming page owns `currentPage`/`pageSize` and derives the
  table's page slice, the same composition Angular Material uses for `mat-paginator` +
  `mat-table`/`DataSource`; no DI link between the two components was added. Not a
  `FormValueControl` -- page-level navigation state, not a form field value, so it is never placed
  inside `kui-field`. Current page marked with `shape="solid" appearance="primary"` plus
  `aria-current="page"`, matching the Claude Design spec exactly. First/Prev/Next/Last render as
  static inline SVG chrome (`kui-chrome-icon-paths.util`), not `IconButton`'s network-dependent,
  name-resolved `icon` input -- the same as `kui-select`'s dropdown chevron and `kui-tabs`' scroll
  chevrons.)
- Time Picker (done as `input[kuiTimePicker]` + `kui-time-picker-panel`; new pattern (not among the
  43 pre-existing kit components), built from Claude Design spec `04 Time Picker.dc.html`. Composed
  entirely from existing primitives -- `Field`, `Input` (trigger), `Dropdown` (Tier 3, the same
  primitive `kuiDatePicker` uses), `Segmented` (AM/PM), `Button` (footer "Now"/"Done") -- plus
  hand-rolled `role="listbox"`/`role="option"` scrollable hour/minute/second columns, since the kit
  has no ready-made "wheel" primitive. `format` (`24h`/`12h`), `hourStep`/`minuteStep`/`secondStep`,
  `showSeconds`, `minTime`/`maxTime`, `disabledHours`/`disabledMinutes`/`disabledSeconds`,
  `clearable`, `disabled`/`readonly`/`invalid`,
  `value`/`(valueChange)` as `Date | null` (hours/minutes/seconds only) -- the same conventions
  `kuiDatePicker` already established. The directive auto-wires a sibling `kui-time-picker-panel`
  inside the same `kui-field`, mirroring `kuiDatePicker` + `kui-calendar` exactly. Selecting a
  column cell does not auto-close the panel (Enter/Escape/outside click/"Done" do); columns do not
  auto-scroll to the selected value on open (keyboard navigation does scroll). Range mode not
  implemented -- explicit design-brief scope cut.)
- Link (done as `a[kuiLink]` + `button[kuiLink]`; new pattern (not among the 43 pre-existing kit
  components), built from Claude Design spec `05 Link.dc.html`. Composes `[kuiText]` via Angular's
  Directive Composition API (`hostDirectives: [{ directive: KuiTextDirective, inputs: ['variant']
}]`) instead of duplicating `Text`'s type scale, matching the spec's own Anatomy note that
  typography is "reused, not duplicated" -- `[kuiLink]` never needs `[kuiText]` added separately in
  a template, and `[kuiText]`'s own `tone` input is not exposed (stays at its default, no visible
  effect) so there is exactly one `tone` in `[kuiLink]`'s public API, not two same-named inputs
  left to coincide across two independently-applied directives -- a documented Angular anti-pattern
  when unintentional. `tone` (`default`/`muted`/`primary`/`success`/`warning`/`danger`, default
  `primary`) is unaffected by hover/focus/active -- only underline thickness (hairline to thick)
  and a `:focus-visible` box-shadow ring change, the Taiga `tuiLink` research-note precedent the
  spec cites. `underline` (`always`/`hover`/`none`, default `hover`) matches MUI `Link`'s axis by
  meaning. `iconStart`/`iconEnd` reuse `Button`'s `ViewContainerRef`/`Renderer2` icon-insertion
  pattern (`KuiIconName`, Lucide-resolved, decorative). `external` (auto-detected from
  `target="_blank"` when unset) adds `rel="noopener noreferrer"` merged with any user-supplied
  `rel`, the library's own static external-link chrome glyph (`KUI_EXTERNAL_LINK_D` in
  `kui-chrome-icon-paths.util`, matching Lucide's own `external-link` glyph coordinates -- same
  treatment as `KUI_CALENDAR_D`/`KUI_CLOCK_D`) in the `iconEnd` slot unless `iconEnd` is set
  explicitly, and a visually-hidden "(opens in a new tab)" suffix appended to the accessible name.
  `disabled` follows the same `aria-disabled` + `tabIndex=-1` + blocked-click convention
  `[kuiButton]` already uses for `as="a"` (a host `<button>` also gets the native `disabled`
  attribute). No "visited" tone/state -- not found in Taiga `tuiLink`, MUI `Link`, or the kit's own
  `Text`, and not a typical pattern in product SaaS/dashboard UI per the spec's own Open
  Questions.)
- Media Viewer (done as `kuiMediaViewer()` + internal `kui-media-viewer`; new pattern (not among
  the 43 pre-existing kit components), built from Claude Design spec `06 Media Viewer.dc.html`. A
  fullscreen photo lightbox opener over `KuiDialogService`, the same shape as
  `kuiDialog()`/`kuiConfirm()`/`kuiDrawer()`: prev/next navigation with boundary disabling,
  Home/End/Left/Right keyboard navigation, a live-region counter, a thumbnail strip, zoom in/out
  with `maxZoom`/`zoomStep` bounds, and pan while zoomed with a fixed offset-budget clamp (not a
  natural-image-size measurement, per the spec's own open question). `KuiDialogSize` gained a
  `'fullscreen'` value for the panel instead of a page-level CSS override, resolving the spec's own
  open question #2. Close/Prev/Next/Zoom in/Zoom out reuse `button[kuiIconButton]` with static
  inline SVG content instead of the async name-resolved `icon` input, the same treatment
  Pagination's First/Prev/Next/Last already get. Photos only -- video is out of scope. Grid layout,
  per-tile multi-select, and any trigger element are the consumer's own composition around the
  opener, never part of its API.)
- Carousel (done as `kui-carousel` + `[kuiCarouselSlide]`; new pattern (not among the 43
  pre-existing kit components), built from Claude Design spec `07 Carousel.dc.html`. Slide track is
  native scroll + `scroll-snap`, scrolled programmatically to the current slide rather than a
  hand-rolled transform animation, so trackpad/touch swipe and its inertia come from the browser.
  `[kuiCarouselSlide]` projects arbitrary content the same way `kuiTab`/`kuiTabPanel` do for
  `kui-tabs`. Prev/Next/Play/Pause reuse `button[kuiIconButton]` with static inline SVG chrome, the
  same treatment Pagination/Media Viewer already give their own essential controls. `itemsPerView`
  (default `1`), `loop` (default `false`, disabling Prev/Next at the edges instead of wrapping),
  `autoplay`/`autoplayInterval` (default `false`/`4000`, always renders a visible Play/Pause and
  pauses on hover/focus), `showArrows`/`showDots` (default `true`/`true`, swipe/scroll always
  works), `draggable` (default `true`, one flag for native touch swipe plus an added pointer-based
  mouse drag-to-scroll; `false` also switches the track to `overflow-x: hidden` so wheel/trackpad
  can't move it either, not just the drag gesture), `ariaLabel` (required), `index`/`(indexChange)`
  two-way model. A debounced `scroll` listener syncs `index` back from any manual drag/swipe/scroll,
  keeping the dot picker and Prev/Next disabled state correct regardless of how the track moved.
  Dot picker follows the "tabbed carousel" ARIA pattern (`role="tablist"`/`role="tab"`, roving
  tabindex) and is capped to `slideCount - itemsPerView + 1` reachable positions, not one dot per
  slide. No responsive per-breakpoint `itemsPerView` and no size/compact prop for the whole
  component -- matching every researched kit (Ant Design, NG-ZORRO, PrimeNG/PrimeVue/PrimeReact,
  Taiga UI), Prev/Next/Play inherit size from the kit's own size/density DI context instead.)
- Splitter (done as `kui-splitter` + `kui-splitter-pane`; new pattern (not among the 43 pre-existing
  kit components), built from Claude Design spec `08 Splitter.dc.html`, following the W3C ARIA APG
  Window Splitter Pattern. `orientation` (`horizontal`/`vertical`, default `horizontal`),
  `disabled`, `(sizesChange)`; per-pane `size` (optional initial share), `minSize` (default `10`),
  `collapsible` (first/last pane only, one-touch button + Enter). Gutters are not written by the
  consumer -- the splitter creates and positions one internal gutter component per adjacent pane
  pair via `ViewContainerRef.createComponent` + `Renderer2.insertBefore` (the same technique
  angular-split uses), since Angular content projection cannot declaratively interleave generated
  elements between projected sibling components. That insertion is deferred to `afterNextRender`
  specifically -- doing it synchronously in the constructor made Angular's hydration reconciliation
  see gutter elements the gutter-free server-rendered DOM didn't have, throwing `NG0500`; pane
  `flex-basis` sizing (via `calc()` against the gutters' fixed pixel width, always summing to
  exactly 100%) is still computed on both server and client. Supports 2+ panes (each gutter clamps
  and resizes only the two panes touching it, no cascading), nested splitters (no special API, each
  instance measures only its own immediate container), and full pointer-drag + keyboard (arrows,
  Shift for a 10% step, Home/End, Enter, Escape to cancel an active drag). No `[kuiSplitterThumb]`
  custom-thumb projection (would need relocating a projected DOM node into the adjacent gutter) and
  no size persistence between sessions -- explicit design-spec/iteration scope cuts.)

## Phase 9

- Chart (in progress; built ahead of the original "wait for a real consumer" gate because a real
  consumer need now exists. `kui-line-chart` done as of 2026-09-17 -- `area` boolean (not a
  separate type/component), single/multiple `series`, legend toggle (does not recompute the
  value-axis domain, matching the spec's stability requirement), `null`/`NaN`/`Infinity` treated as
  gaps (never drawn as `0`), value axis always includes `0` without clamping negative values, `sm`/
  `md`/`lg` sizes (canvas height fixed; width measured via `ResizeObserver` from `afterNextRender`
  onward -- SSR and the first client render share a per-size nominal fallback so hydration still
  reconciles, the same `afterNextRender` pattern `kui-splitter` uses for its own post-hydration DOM
  work), dense-series (120-point) tick thinning, a centered `kuiLoader` spinner for the loading
  state and a shared dashed-border/icon empty-state composition (from Claude Design
  `02ec9aaf/40 Charts.dc.html`, common to every future chart type -- not the kit's
  `kui-empty-state`/`Skeleton`, whose anatomy doesn't match that spec) for empty/missing data, an
  alt-table with exact (non-compact) values, and roving-tabindex keyboard navigation
  (arrows/Home/End) with `role="graphics-symbol img"` per point. A real browser pass (not just unit
  tests, which stayed green throughout) found and fixed 4 bugs invisible to the test suite: a
  missing default round-robin series color (marks/lines were invisible), a tooltip that recreated
  its overlay on every adjacent-mark hover instead of retargeting one shared overlay (fixed by
  moving pointerleave/focusout from each mark to the marks group), circular marks rendering as
  ellipses (`preserveAspectRatio="none"` against a mismatched nominal viewBox width -- fixed by
  actually adding the `ResizeObserver` sync instead of avoiding it), and an oversized fixed
  y-axis-label padding. See `.local-notes/v2/chart-architecture-plan.md`'s 2026-09-17
  browser-verification revision for the full detail. Tooltip reuses the kit's existing CDK-Overlay-backed
  `KuiTooltipDirective` machinery directly (`createKuiTooltipOverlay`, widened to accept an
  `SVGElement`/`Element` anchor, plus a new `retarget()` using CDK's public
  `FlexibleConnectedPositionStrategy.setOrigin()`) -- one shared overlay retargeted between marks,
  not a tooltip directive per point, and not a second tooltip primitive; a real WCAG 1.4.13 gap was
  found in that shared directive's hover/focus mode while integrating it (not dismissible via
  Escape, not hoverable) and filed separately below rather than patched inline, since it affects
  every `[kuiTooltip]` consumer in the kit, not only Chart.

  `kui-bar-chart` done as of 2026-09-17 -- `orientation` (`vertical`/`horizontal`, flips on-screen
  placement only, `axes.x`/`axes.y` stay semantic), `stacked` (only meaningful with >1 series;
  positive/negative values stack separately -- diverging, like D3's `stackOffsetDiverging`;
  deliberately recomputes the value-axis domain on legend hide, unlike grouped mode and
  `kui-line-chart`, since a collapsed stack's height genuinely changes), and its own var-height
  skeleton-bar loading state (the only chart type with a design-sourced loading shape -- others
  reuse kit primitives instead of inventing one). Extracted three genuinely shared units while
  building it, once a second real consumer existed to verify they generalize (not designed ahead of
  that need): `KuiChartTooltipController` (the retarget-not-recreate tooltip logic), a pure
  `computeRovingIndex` keyboard-nav helper, and `observeChartWidth` (the guarded `ResizeObserver`
  setup) -- `kui-line-chart` was refactored onto all three, so the tooltip-retarget bug class
  found there cannot recur per-component. A second browser pass on `kui-bar-chart` before calling
  it done caught one more real bug invisible to unit tests: horizontal orientation's category text
  labels (e.g. "Enterprise") clipped against the fixed left padding sized for numeric value ticks --
  fixed with an orientation-aware left padding, not a shared one.

  `kui-scatter-chart` done as of 2026-09-17 -- no `categories` input (both axes are independent
  numeric domains from the data's own `x`/`y` extent, deliberately **not** forced to include `0`,
  unlike `kui-line-chart`/`kui-bar-chart` -- scatter plots typically correlate two independent
  measures, and forcing a zero baseline on either axis would compress the interesting range;
  matches D3/Chart.js scatter practice), `bubble` boolean (Chart.js precedent: bubble is scatter
  plus an unscaled `r`, not a separate chart type), and a two-circle-per-point render (an invisible
  hit-target circle at least 10 viewBox units in radius carrying the interactive/accessible
  attributes, layered under an `aria-hidden` decorative dot at the actual radius) so a small
  default dot or bubble stays easy to hover/tap precisely. Reused all three shared units
  (`KuiChartTooltipController`, `computeRovingIndex`, `observeChartWidth`) from `kui-bar-chart`
  without modification -- further confirming they generalize. A browser pass before calling it done
  found no new bugs this time (unlike line's missing default color and bar's clipped horizontal
  labels) -- the shared-unit extraction from Phase 5 is starting to pay off.

  `kui-donut-chart` done as of 2026-09-17 -- all four public chart components now ship. No
  `categories`/`axes` inputs (a donut has no axes); `slices: KuiChartSlice[]` (`{id?, label, value,
color?}`) replaces `series`, negative `value` dropped during normalization. Hiding a slice
  through the legend freezes the remaining slices' angles instead of re-partitioning the circle --
  the canonical spec's Open Questions are explicit about this, and an earlier version of the shared
  `computeDonutShares` function (written during Phase 1, before any chart component existed to
  verify it against) got this backwards, excluding hidden slices from the total and recomputing
  angles; caught and fixed before building this component, re-checking the spec text directly
  rather than trusting the Phase 1 summary. A ring, not a filled disc (60% fixed inner-radius
  ratio, not configurable in v1) -- matching the spec's own "donut" naming. No center text/sum: the
  spec doesn't specify one and no design source dictates its appearance, so it stays deferred
  rather than invented. Reused all three Phase 5 shared units without modification. A browser pass
  before calling it done found one more real bug invisible to unit tests, of a kind not seen in the
  first three types: a single 100%-share slice rendered nothing at all -- SVG's arc command cannot
  draw a true 360-degree arc (the start/end points land on the same coordinates, which every
  browser treats as a zero-length, invisible path), the same well-known limitation d3-shape's
  `arc()` generator works around; fixed the same way, by nudging the angular span a fraction of a
  degree short of a full circle when the slice spans one.

  Thin type-specific public components composing a shared internal SVG engine (axis, legend,
  tooltip, keyboard nav, alt table) was the target shape from the start, built via composition as
  each type was added, not a deep inheritance chain and not pre-built ahead of a real consumer for
  each type. Own SVG renderer, not a wrapped charting engine (GitLab UI Pajamas was the
  architecture reference for the public-API split, not for engine cost -- their charts wrap
  ECharts). See `.local-notes/v2/chart-architecture-plan.md` for the full design (data contracts,
  scale/stacking math, missing-data handling, accessibility, SSR) and the phased implementation
  checklist, including every correction made mid-implementation -- no abstract base classes for
  shared inputs (no precedent anywhere else in the kit; inputs are flat per component instead), and
  the donut hide-behavior fix above.)

## Later

## Known Tech Debt

- Committed visual-regression baselines for `/button`, `/field`, `/select`, `/dialog`, `/table`,
  and `/calendar` (`tests/e2e/visual.spec.ts`) are stale on `release/2.x` as of 2026-09-17 --
  `pnpm.cmd test:browser` fails all 24 desktop/mobile x light/dark combinations with page-height
  diffs (confirmed unrelated to the Chart work in this phase: reproduces identically with the
  Chart playground nav entry reverted). Needs its own investigation (likely accumulated layout
  drift from unrelated changes) and a baseline re-record, not a quick patch.

- `KuiTooltipDirective`'s hover/focus display mode is not fully WCAG 1.4.13 (Content on Hover or
  Focus) compliant: Escape does not dismiss the tooltip in hover/focus mode (only the touch-tap
  branch handles Escape, via `startTapDismissal`), and the tooltip surface is not hoverable
  (moving the pointer from the anchor onto the tooltip itself dismisses it instead of keeping it
  open). Found 2026-09-17 while integrating the chart component's tooltip (Phase 9, see
  `.local-notes/v2/chart-architecture-plan.md` section 7); affects every existing `[kuiTooltip]`
  consumer in the kit, not only Chart. Deferred as its own fix -- needs its own test pass across
  hover/focus/touch modes before changing shared directive behavior.

- ~~`kui-dropdown` injects `NgZone`...~~ Done 2026-07-10: removed `NgZone` from `kui-dropdown`,
  `kui-menu`, `kui-popover`, and the shared `wireFloatingPanelDismissal`/`kui-floating-panel.util`
  helper. Signal writes drive change detection directly now; no zone wrapping anywhere in the
  overlay/floating-panel primitives.

- Architecture hardening before `1.0.0`: internal coordination tokens for Accordion, Dropdown,
  Segmented, Stepper, Tabs, and Table were removed from public barrels. Keep `KUI_DIALOG_CONTEXT`
  and `KUI_DRAWER_CONTEXT` public because consumer-provided dialog/drawer content injects them for
  typed data and close callbacks. Public API freeze review on 2026-07-18 removed accidental
  internal Date Picker formatting helpers from the package root, kept default resolver/providers as
  intentional public extension points, and confirmed config/data `readonly` usage should protect
  library-owned immutable data without restricting consumer-owned mutable models.

- DI defaults audit before `1.0.0`: root `provideKikitaUi({ defaults.size })` now drives public
  size-enabled primitives when local size inputs are omitted. Components with narrower size unions
  apply only supported root values. `kui-icon` is excluded because its `size` is a raw CSS/icon
  size, not a Kikita control-size preset. `kuiProvideButtonOptions` is the only new
  component-specific default provider because button shape/appearance defaults are a repeated
  design-system decision. Field-control clearability is shared through `KuiFieldControlOptions`.
  Do not add provider defaults for every component input; evaluate future candidates from real
  consumer repetition first.

- ESLint is enabled for the library and playground. The gate fails on hard errors and reports
  warnings for current architecture/accessibility debt that needs focused follow-up before those
  rules can safely become blocking: selector edge cases on internal components, aliased public
  inputs, native-event output names, template keyboard/focus warnings, unused variables in tests,
  and expression-statement cleanup.

- Angular workspace package versions should be aligned before release hardening. `pnpm peers check`
  currently reports that `@angular/platform-server@22.0.7` wants
  `@angular/common`, `@angular/compiler`, `@angular/core`, and `@angular/platform-browser` at
  `22.0.7`, while the lockfile has `22.0.1` for those packages.

## Install DX

Angular schematic support is implemented and verified against a fresh Angular
consumer app:

- `ng add @kikita-labs/ui`
- add `node_modules/@kikita-labs/ui/styles/kikita-ui.css` to the consumer app
- add `provideKikitaUi()` to `app.config.ts`
- optionally scaffold default Ember theme seeds with `--theme`
- verified with a local tarball in a fresh Angular 22 app outside this workspace

Initial install documentation lives in `docs/install.md`.

Docs pages exist for implemented primitives through Scrollbar. A full static component audit has been run across implemented primitives for docs presence, JSDoc coverage, public style entrypoint coverage, Cyrillic leakage, overlay/CDK usage, and obvious SSR DOM access. Initial browser snapshot review has been run for Table, Select, Dialog, Popover, Dropdown, Toast, Accordion, Progress, Slider, Number Input, Combobox, and Scrollbar. Committed visual regression baselines now cover representative stable routes; assistive-technology review recording is still pending.

## Post-1.0 Feature Scope

These gaps are intentionally deferred from `1.0.0` because the current public APIs and docs do not
promise them:

- Date Picker range mode and mobile bottom-sheet popover. Ship `1.0.0` as single-date only.
- File Upload Signal Forms control contract. Ship `1.0.0` as a controlled component with two-way
  `files`; add forms integration when a consumer workflow requires it.
- Menu submenu, checkbox/radio items, and context-menu helper. Ship `1.0.0` with basic menu
  actions, grouping, separators, disabled/destructive states, and trigger positioning.
- Tree custom icon template slot and virtualization. Ship `1.0.0` with built-in file/folder/no-icon
  states and lazy loading, without virtual scrolling guarantees.
- Calendar multiple selection mode. Ship `1.0.0` with single/range modes only.

If one of these becomes a real consumer blocker before release, move that item back into a
pre-1.0 fix list and update `docs/state-coverage.md` with the changed decision.

## Consumer Migration Gate

Keep this as the final gate of the current plan. Do not integrate Kikita UI into
an existing Taiga UI surface until the package install flow, browser review, and
accessibility review are stable.

Before migrating `discord-bot` screens, Kikita UI should reach a coherent MVP:

- Phase 1 is published privately.
- Signal Forms direction is proven.
- Textarea, Checkbox, Switch, and Radio exist.
- Badge, Loader, and Card exist.
- Playground covers tokens, theme, states, forms, density, light/dark, and mobile checks.
- Public docs and JSDoc exist for exported primitives.
- Install DX is verified against a fresh Angular app.
- Browser and assistive-technology review is complete for overlay and table primitives.

Current primitive state coverage is tracked in `docs/state-coverage.md`.

After that, migrate one isolated low-risk screen first. Avoid mixed Taiga/Kikita
surfaces unless the screen is explicitly a migration sandbox.

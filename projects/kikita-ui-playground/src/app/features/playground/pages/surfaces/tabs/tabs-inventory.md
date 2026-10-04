# Tabs Contract Inventory

This inventory maps the public Tabs contract to the fixed Playground catalogue. The page uses the
released component API and leaves tab visuals to the library stylesheet.

## Public API, defaults, and resolution

| Surface                       | Public type/default                                                        | Behavior and page evidence                                                                                                                                                                                                                      |
| ----------------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `variant`                     | `KuiTabsVariant`: `'line' \| 'pill'`; default `'line'`                     | The horizontal and vertical matrices include both variants at every supported size and edge setting. The minimal example omits this input and asserts the `line` default.                                                                       |
| `size`                        | `KuiSize`: `'xs' \| 'sm' \| 'md' \| 'lg'`; input default is `undefined`    | Effective size resolves local input, then root provider default, then `'md'`. The current Playground root provider does not specify a default size. The minimal example omits size; the matrix includes all four values.                        |
| `orientation`                 | `KuiTabsOrientation`: `'horizontal' \| 'vertical'`; default `'horizontal'` | The default omits orientation. Both orientations are crossed with every variant, size, and inversion value. Horizontal is represented by an absent `data-kui-orientation`; vertical writes `vertical`.                                          |
| `inverted`                    | Boolean with `booleanAttribute`; default `false`                           | Every size and variant is shown at both edge positions in both orientations. The default omits this input.                                                                                                                                      |
| `controlsPanels`              | Boolean with `booleanAttribute`; default `true`                            | Local examples use the default relationship. The router-style example sets it to `false`, has no local panels, and verifies that `aria-controls` is omitted.                                                                                    |
| `value` / `valueChange`       | `model<string>('')`; implicit model output                                 | The default example omits `value` and uses one trigger/panel pair with the empty default plus a second pair with a unique value. The keyboard and router examples bind the model and exercise component selection through arrow keys and click. |
| `selected` / `selectedChange` | Deprecated `model<string>('')`; synchronized with `value`                  | It is not used by this page. `value` is the current public model and the docs state that `selected` is planned for removal in the next major version. The unit suite covers legacy bindings.                                                    |
| `[kuiTab] value`              | `string`, source default `''`                                              | Every trigger value has a matching panel value when local panels are present. The default pair omits both values. All other page IDs are unique, stable ASCII strings.                                                                          |
| `[kuiTab] hasError`           | Boolean with `booleanAttribute`; default `false`                           | The payment trigger toggles this real input from a consumer signal. The error is visually represented by the library dot and included in the accessible name.                                                                                   |
| `[kuiTab] errorLabel`         | `string`; source default `'has error'`                                     | The payment error example supplies the translated label and E2E checks its runtime English/Russian accessible name. The docs omit this input.                                                                                                   |
| `[kuiTabPanel] value`         | `string`, source default `''`                                              | Matched panels remain mounted and inactive panels are hidden. E2E checks selected and hidden panels in the minimal default and selected content after keyboard changes.                                                                         |

`KuiTabs`, `KuiTab`, `KuiTabPanel`, `KuiTabsVariant`, and
`KuiTabsOrientation` are public exports. `KuiSize` is also public. The shared tabs context is an
internal coordination detail. No explicit output declarations or panel-selection outputs exist;
the two model outputs are Angular's implicit `valueChange` and deprecated `selectedChange`.

## State, keyboard, and accessibility behavior

- The nested list has `role="tablist"` and `aria-orientation`; each trigger is a native button with
  `role="tab"`, `aria-selected`, a roving `tabindex`, and (by default) `aria-controls`. Each panel
  has `role="tabpanel"`, `aria-labelledby`, and `hidden` when inactive. The minimal example
  verifies the default selection and links. The router-style example intentionally has no local
  panels and suppresses `aria-controls`.
- Text-only panels in this page set `tabindex="0"` so Tab from the selected trigger can reach the
  active panel. `kuiTabPanel` does not add this attribute itself; page examples with focusable panel
  content may use that content as the next tab stop.
- Arrow Right/Left move and select with wrapping for horizontal lists. Arrow Down/Up do the same for
  vertical lists. Home and End select/focus the first and last tabs. The page E2E drives those keys
  on real focused buttons and verifies focus, selection, and active panel. Native buttons also
  provide Enter/Space activation through their browser click behavior; the docs focus on the arrow,
  Home, and End pattern.
- `hasError` creates an `aria-hidden` visual dot and a visually hidden `errorLabel` text node. The
  localized toggle proves that changing the input adds/removes the accessible text with the visual
  state. The component has no live region; this page does not claim an announcement on toggle.
- The tablist itself has no public input for its accessible name. `docs/tabs.md` places
  `aria-label` on `<kui-tabs>`, but implementation puts `role="tablist"` on an inner `<div>` and
  does not forward the host label. The examples give their outer scenario wrapper a name for
  catalogue navigation; they do not claim this names the nested tablist. The discrepancy is
  recorded for a library-level fix.
- Disabled is not a supported Tabs input or feature. Although the stylesheet contains selectors
  for a disabled native button, the directive has no disabled input and component keyboard logic
  does not skip disabled triggers. No disabled example is presented.
- Stable distinct ASCII values prevent duplicate trigger/panel relationships in this catalogue.
  Source ID generation replaces characters outside `[a-zA-Z0-9_-]` with hyphens, so distinct
  consumer values can normalize to the same DOM ID; that collision case is outside the valid
  examples and is recorded as a source edge case.
- Source assigns per-instance IDs from a module-level counter. The SSR E2E checks raw response
  markers (heading, tablist, selected state, and effective size); a separate hydrated-DOM check
  verifies tab/panel ID relationships. The SSR test also checks uncaught browser errors through
  initial render, locale change, and reload. The unit test that reuses pre-rendered error spans
  simulates that DOM shape but does not run Angular hydration. Whether module counters remain
  aligned across all SSR worker lifetimes is a library verification concern, not changed by this
  page.

## Visual combinations, responsive behavior, and limits

The fixed matrix covers the complete meaningful Cartesian product: two variants, four sizes, two
orientations, and both inverted values (32 combinations). Each example has a localized visible
caption naming its orientation, variant, size, and edge. Horizontal and vertical orientations are
split into named sections; each size/variant pair is rendered for normal and inverted edges.
The full matrix is captured on desktop. At 768px and 320px, E2E captures one named representative
tile per orientation so browser screenshots remain inside the independently scrolling Playground
workspace; E2E still asserts all 32 combinations at every viewport. The matrix layout changes to one
column for vertical examples below desktop to preserve room for both the fixed-width tab list and
panel. These page-owned rules arrange examples only; they do not override Tabs appearance,
dimensions, colors, or component breakpoints. Matrix panels use a short localized “Panel.” value so
the vertical panel remains legible at 320px.

The Playground accessibility rule requires touch targets of at least 44×44px on touch viewports.
KUI Tabs sizes xs/sm/md use 28px/32px/40px minimum block sizes; only lg is 44px. This catalogue
keeps the full size matrix visible at 320px and does not enlarge the library controls with page CSS.
The sub-44px sizes are a library-level touch-target limitation, not a verified accessible target.

The overflow example uses eight real triggers and matched panels. At 320px the horizontal scroller
is constrained to 246px while its tab content is 1044px wide. `canScrollRight` starts false, then
`afterNextRender` measures the scroll element; `ResizeObserver` and the scroll handler refresh both
direction signals as its size and position change. Once that first client-side measurement detects
overflow, the initial settled state exposes the right scroll button, matching the docs statement.
The E2E waits for that button to be visible before capturing the clipped initial list. It then uses
the real `End` key to focus/select the final tab and let native focus scrolling bring it into view,
and exercises the exposed library buttons in both directions. The library control names (“Scroll
tabs left/right”) are currently hard-coded English, so they do not change with the runtime locale.
English and Russian are LTR; this page does not claim RTL coverage.
Implementation uses physical left/right arrow keys and `scrollBy({ left })`, and the stylesheet
uses physical edges, so RTL navigation and scroll direction remain unverified.

The docs list 20 CSS variables for gaps, borders, tab geometry, colors, typography, and pill
styling. The stylesheet also reads `--kui-tab-error-color`, `--kui-tabs-vertical-gap`, and
`--kui-tabs-vertical-list-width`, which are not in the docs list. The theme generator does not
provide explicit Tabs-specific values for those undocumented hooks; source fallbacks remain in
effect. This page does not override public or undocumented Tabs visual tokens.

The docs keyboard table omits vertical Arrow Up/Down and the wrapping/selection behavior present in
source. The docs also omit trigger `hasError` and `errorLabel`. Existing unit tests cover roles,
selection/panel links, `controlsPanels=false`, inversion marking, hidden panels, click selection,
error toggling and reuse of pre-rendered error spans in a client fixture, and deprecated bindings. They do not
cover keyboard navigation, the full visual matrix, scroll controls, runtime locale changes, or
browser SSR/hydration. Dedicated E2E is written for these page-visible behaviors; browser execution
and screenshot review await the parent verification slot.

## Contract-to-example and E2E map

| Example                  | Visible state or real interaction                                                                                                             | Planned browser evidence                                                                                                                                                 |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Default                  | Minimal horizontal `line`, `md`, non-inverted Tabs; omits size, orientation, variant, inverted, value, and panel values where defaults apply. | Assert `md`, `line`, horizontal `aria-orientation`, default edge, roving tab index, selected panel, and ID relationship; capture dark, hover, light, and 320px.          |
| Horizontal combinations  | All `line`/`pill` × `xs`/`sm`/`md`/`lg` × normal/inverted combinations.                                                                       | Assert all 16 host configurations and horizontal orientation; capture the full desktop matrix plus a named tile at 768px and 320px.                                      |
| Vertical combinations    | Same complete size/variant/edge coverage in vertical orientation.                                                                             | Assert all 16 host configurations and vertical orientation; drive Arrow Down/Up; capture the full desktop matrix plus a named tile at 768px and 320px.                   |
| Keyboard navigation      | Three local tab/panel pairs; selected model updates when using arrow keys; Tab reaches the text-only active panel; wrap, Home, and End.       | Assert actual focus on the active panel after Tab, then focus, selection, and visible panel after navigation; capture a keyboard-focused selected tab.                   |
| Error label              | Consumer signal toggles `hasError`; localized `errorLabel` changes the accessible name with the dot state.                                    | Assert accessible name and pressed state before/after; capture enabled and cleared states.                                                                               |
| Router-style navigation  | `controlsPanels=false`, controlled string route values, no local panels.                                                                      | Assert no `aria-controls`, click selection, and no panel; capture the changed selection.                                                                                 |
| Overflow                 | Eight tabs in a constrained component at 320px; the initial settled state exposes a right scroll control when overflow is measured.           | Assert page width and clipping, wait for the right control, use End to reach the final tab, then use exposed controls to verify both ends; capture start and end states. |
| SSR and runtime language | Server-rendered default markers, hydrated tab/panel relationship, runtime Russian then English scope switch, reload.                          | Check raw server HTML markers separately from hydrated ID relationships, `lang`, translations, and no console errors or uncaught `pageerror`.                            |

Omissions: disabled triggers are unsupported and deliberately not shown; deprecated `selected` is
not used because the page demonstrates the current `value` model; invalid/duplicate/normalization-
colliding values are outside the documented unique-ID contract; direct root-size provider editing
is outside the fixed component catalogue; `aria-label` forwarding to the internal tablist, live
error announcements, RTL, and localized built-in scroll-control names require library/API work;
hover and keyboard focus are captured through browser interaction, while their colors and token
values remain owned by the existing stylesheet and are not overridden by the page.

## Source audit

- `docs/tabs.md` — documented usage, public inputs, router scenario, keyboard notes, accessibility,
  overflow, and listed CSS variables.
- `projects/ui/src/lib/components/tabs/kui-tabs.component.ts` — input/model defaults, size
  resolution, generated IDs, arrow/Home/End behavior, scroll handling, and SSR lifecycle hooks.
- `projects/ui/src/lib/components/tabs/kui-tab.directive.ts` and
  `kui-tab-panel.directive.ts` — trigger/panel inputs, ARIA attributes, error lifecycle, and panel
  visibility.
- `projects/ui/src/lib/components/tabs/index.ts`, `projects/ui/src/lib/components/index.ts`,
  `projects/ui/src/public-api.ts`, and `projects/ui/src/lib/types/kui-size.type.ts` — public exports
  and size type.
- `projects/ui/src/lib/components/tabs/kui-tabs.component.spec.ts` — current Tabs unit behavior and
  coverage gaps.
- `projects/ui/src/lib/components/tabs/kui-tabs.css`, `projects/ui/src/styles/kikita-ui.css`, and
  `projects/ui/src/lib/theme/create-kui-theme.ts` — visual combinations, responsive overflow,
  focus treatment, tokens, and theme defaults.
- `projects/kikita-ui-playground/src/app/app.config.ts` — current Playground root defaults.
- `projects/kikita-ui-playground/.agents/component-page-authoring.md` — fixed catalogue, localized
  example grouping, and E2E requirements.

## Self-review checklist

- [x] Every public input/model and implicit model output is mapped with its type/default/resolution.
- [x] Every meaningful supported variant, size, orientation, and inversion combination is rendered
      with a localized visible caption naming those values.
- [x] The minimal example omits defaulted inputs while retaining a valid matching default tab/panel.
- [x] Keyboard, wrap, Home/End, error toggle, router-style selection, and scroll controls have
      deterministic accessible E2E scenarios.
- [x] Text is localized in matching page-scoped English and Russian catalogs; runtime switching is
      covered in the dedicated E2E source.
- [x] Page-private styles arrange examples only and use Kikita spacing tokens; Tabs visuals are
      supplied by the public library stylesheet.
- [x] Disabled, deprecated, root-provider, RTL, inner tablist naming, error announcement,
      text-only panel focusability, sub-44px touch sizes, initial overflow-control visibility, and
      undocumented token limitations have specific omission/discrepancy notes.
- [x] Scoped Prettier, EN/RU key parity (50 key paths), and repository static audit pass.
- [x] Scoped ESLint and Stylelint pass in the parent recheck.
- [x] The route, `tabs` translation scope, route enum, and sidebar entry are registered in the
      shared Playground files.
- [x] Production build and both snapshot-update and clean production browser runs pass (6/6 each).
- [x] All owned captures were inspected; desktop matrices and representative narrower viewport
      tiles are legible and exclude surrounding shell chrome.
- [ ] External assistive-technology review has not been performed.
- [ ] The parent's full shared build/SSR/browser/adaptive integration gate remains pending.

Production browser evidence: the desktop captures include all 16 examples per orientation; the
768px and 320px captures show the named horizontal and vertical representative tiles in the
workspace without shell chrome. The initial 320px overflow screenshot confirms clipped tabs with a
visible right scroll control; the keyboard `End` capture confirms the final tab is focused, selected,
and scrolled into view.

Focused verification note (2026-09-28): `node_modules/.bin/playwright.cmd test
--config=playwright.kikita-ui-playground.config.ts
projects/kikita-ui-playground/e2e/tabs-playground.visual.spec.ts` passed 6/6 with no snapshot diffs.
The existing changed `tabs-overflow-320-start-win32.png` baseline already matched the clean run and
was retained. At full resolution, the desktop default, 320px default, overflow-start, and
overflow-end captures were reviewed; the start image shows the clipped trailing tabs and visible
right control, while the end image shows the selected, focused final tab and visible left control.

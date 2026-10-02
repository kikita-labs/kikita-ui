# Number Input Inventory

This source-backed contract inventory was accepted as the research gate for the replacement page.
It records the current workspace contract, the implemented page-local examples and browser coverage,
and known source discrepancies. The page demonstrates local-size-over-Field precedence and real
pressed states for both stepper layouts. Its focused browser suite passes 13/13 tests; all nine
changed or added captures were inspected after refresh. The parent owns shared route and SSR registry
integration.

## Contract sources

- Component documentation: [`docs/number-input.md`](../../../../../../../../../docs/number-input.md),
  [`docs/forms.md`](../../../../../../../../../docs/forms.md),
  [`docs/field.md`](../../../../../../../../../docs/field.md), and
  [`docs/di-defaults.md`](../../../../../../../../../docs/di-defaults.md).
- Public API and implementation:
  [`number-input/index.ts`](../../../../../../../../../projects/ui/src/lib/components/number-input/index.ts),
  [`components/index.ts`](../../../../../../../../../projects/ui/src/lib/components/index.ts),
  [`public-api.ts`](../../../../../../../../../projects/ui/src/public-api.ts),
  [`kui-number-input.directive.ts`](../../../../../../../../../projects/ui/src/lib/components/number-input/kui-number-input.directive.ts),
  and [`KuiSize`](../../../../../../../../../projects/ui/src/lib/types/kui-size.type.ts).
- Focused tests and Field integration:
  [`kui-number-input.directive.spec.ts`](../../../../../../../../../projects/ui/src/lib/components/number-input/kui-number-input.directive.spec.ts),
  [`kui-field.component.ts`](../../../../../../../../../projects/ui/src/lib/components/field/kui-field.component.ts),
  [`kui-field.component.html`](../../../../../../../../../projects/ui/src/lib/components/field/kui-field.component.html),
  and [`kui-field.component.spec.ts`](../../../../../../../../../projects/ui/src/lib/components/field/kui-field.component.spec.ts).
- Defaults, tokens, and styles:
  [`kui-defaults.util.ts`](../../../../../../../../../projects/ui/src/lib/utils/kui-defaults.util.ts),
  [`KikitaUiOptions`](../../../../../../../../../projects/ui/src/lib/providers/kikita-ui-options.interface.ts),
  [`defaults.field`](../../../../../../../../../projects/ui/src/lib/tokens/kui-field-options.interface.ts),
  [`number-input.css`](../../../../../../../../../projects/ui/src/styles/number-input.css),
  [`kikita-ui.css`](../../../../../../../../../projects/ui/src/styles/kikita-ui.css),
  [`create-kui-theme.ts`](../../../../../../../../../projects/ui/src/lib/theme/create-kui-theme.ts),
  and [`tokens.md`](../../../../../../../../../docs/tokens.md).
- Replacement Playground status:
  [`app.config.ts`](../../../../../../../../../projects/kikita-ui-playground/src/app/app.config.ts),
  [`PlaygroundRoute`](../../../../../../../../../projects/kikita-ui-playground/src/app/enums/playground-route.enum.ts),
  [`component-groups.const.ts`](../../../../../../../../../projects/kikita-ui-playground/src/app/features/playground-shell/components/component-sidebar/constants/component-groups.const.ts),
  [`forms.routes.ts`](../../../../../../../../../projects/kikita-ui-playground/src/app/features/playground/pages/forms/forms.routes.ts),
  and [`component-playground`](../../../../../../../../../projects/kikita-ui-playground/src/app/features/playground/pages/component-playground/component-playground.ts).
- Existing consumers and coverage notes:
  `legacy Number Input page` (removed legacy file `playground/src/app/pages/number-input/number-input.page.html`),
  `legacy Number Input page component` (removed legacy file `playground/src/app/pages/number-input/number-input.page.ts`),
  [`state coverage`](../../../../../../../../../docs/state-coverage.md), and
  [`visual regression routes`](../../../../../../../../../docs/visual-regression.md).
- Authoring, accessibility, SSR, and visual rules:
  [`component-page-authoring.md`](../../../../../../../.agents/component-page-authoring.md),
  [`accessibility.md`](../../../../../../../.agents/accessibility.md),
  [`ssr-hydration.md`](../../../../../../../../../.agents/ssr-hydration.md),
  [`design-provenance.md`](../../../../../../../../../docs/design-provenance.md),
  [`component-checklist.md`](../../../../../../../../../docs/component-checklist.md),
  [`state-coverage.md`](../../../../../../../../../docs/state-coverage.md), and
  [`visual-regression.md`](../../../../../../../../../docs/visual-regression.md).
- Public docs mirror inspected through the Kikita UI component MCP reports
  `@kikita-labs/ui@1.8.0`; its tagged source docs are linked at
  [`v1.8.0/docs/number-input.md`](https://github.com/kikita-labs/kikita-ui/blob/v1.8.0/docs/number-input.md).
  The workspace package is also version `1.8.0`.
- Angular MCP discovered the workspace as Angular 22. `get_best_practices` returned the known
  `Unexpected response type`, so the documented `instructions://best-practices` resource was read.
  The Signal Forms search query returned no indexed result; local [`forms.md`](../../../../../../../../../docs/forms.md)
  and source code provide the relevant binding contract. Angular's current SSR references are
  [Hydration](https://angular.dev/guide/hydration) and
  [Using DOM APIs](https://angular.dev/guide/components/dom-apis).

## Public API, defaults, and coverage map

`KuiNumberInputDirective` is a standalone directive with selector
`input[type=number][kuiNumberInput]`. It styles and wraps the native number input with decrement
and increment buttons in the browser. The local barrel exports both the directive and its
`KuiNumberInputVariant` type; the components barrel and package root re-export them. It has no
public outputs, models, methods, component-specific provider, or content slots.

| Public input                               | Type and default/resolution                                                                                                                                                                                                                                                                                                                                                                                | Visible coverage                                                                                                                                                                                                                                                                                                                                             |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `size`                                     | `KuiSize \| undefined` (`xs \| sm \| md \| lg`); local input wins, then parent Field `effectiveSize`, then root `provideKikitaUi({ defaults: { size } })`, then `md`. Field size itself resolves local Field size, `defaults.field.size`, root size default, then `md`. The replacement app currently calls `provideKikitaUi({ scrollbars: 'styled' })`, so a minimally configured Field resolves to `md`. | Default Field example has no local size and resolves to `md`; a four-size catalogue shows `xs`, `sm`, `md`, and `lg`. A Field-local `size="lg"` with no Number Input size shows inheritance; a second `size="lg"` Field with a local Number Input `size="sm"` shows the input's stronger precedence. The current `xs` size stylesheet gap is detailed below. |
| `variant`                                  | `KuiNumberInputVariant`, currently `'split' \| 'stacked'`; default `'split'`. The browser-side DOM builder adds `.kui-number-input--stacked` only when it builds the wrapper. It does not watch later variant changes, so a runtime change after construction does not rebuild the button layout.                                                                                                          | Compare the default split layout with a stacked layout. Keep each value static for the page lifetime and verify its generated buttons and wrapper class.                                                                                                                                                                                                     |
| `invalid` (signal property `invalidInput`) | Boolean input, default `false`, alias `invalid`, transformed by Angular `booleanAttribute`. Outside Signal Forms, effective invalid is the local input or parent Field invalid state. With a projected Signal Forms `[formField]`, native-control interop writes raw invalid state into the colliding input; the directive uses Field's touched-gated `invalid()` instead.                                 | Show explicit standalone/Field invalid state and a Signal Forms field as untouched, touched-invalid, then corrected. E2E checks `aria-invalid`, Field error, and error/hint `aria-describedby` references through each state.                                                                                                                                |
| `id`                                       | `string \| undefined`; explicit local id wins, otherwise the directive inherits the parent Field `controlId`; without either it omits the id.                                                                                                                                                                                                                                                              | Default Field example checks its generated label association. A standalone example uses an explicit id and a native `<label for>` with the same value.                                                                                                                                                                                                       |

**Field id caveat:** `kui-field` always binds its visible label to its generated `controlId`. An
explicit `id` on a projected number input overrides the input id but does not update the Field
label's `for`, so it breaks that association. Keep the explicit-id example standalone and pair it
with a native label.

The native element remains `input[type=number]`. `KuiNumberInputDirective` does not add a custom
form-control value model or output; native input events and form bindings remain the value surface.
The directive documents compatibility with `NgModel` and Reactive Forms, while the current forms
guidance and proposed replacement example use Angular Signal Forms.

### Native number-input attributes

| Native attribute/property                                      | Number Input behavior and proposed coverage                                                                                                                                                                                                                                                                                                                                                      |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `min` / `max`                                                  | Read from the native element. The generated decrement/increment button disables at the corresponding bound and `_step()` clamps to it. Without a bound, that button remains enabled. A native out-of-range value does not by itself set the directive's invalid style; use `invalid`, a Field error, or form validation to communicate invalidity. Include neutral, at-min, and at-max examples. |
| `step`                                                         | Native property defaults to `1`; generated controls parse it and fall back to `1` when `parseFloat` is falsy/invalid. Include a `step="5"` example and assert one step. `step="any"` is accepted by native HTML but is not a supported generated-step mode: `parseFloat('any')` falls back to `1`.                                                                                               |
| `value`                                                        | Native value is read when synchronizing the step buttons. A blank value is treated as zero by generated stepping. Use fixed values for the visual matrix and a Signal Forms model for the live form scenario.                                                                                                                                                                                    |
| `disabled`                                                     | Remains the native disabled state. The wrapper receives `data-kui-disabled`; both generated buttons receive native `disabled` and `aria-disabled="true"`. The native input and stepper are not keyboard/pointer operable.                                                                                                                                                                        |
| `readonly`                                                     | Remains native read-only. The wrapper receives `data-kui-readonly`; both generated buttons are disabled. The input remains focusable/selectable but rejects edits. Show it distinctly from disabled.                                                                                                                                                                                             |
| `required`, `name`, `placeholder`, and other native attributes | Pass through to the native input; they are not directive inputs. Use a visible Field or native label instead of relying on a placeholder for the accessible name. Signal Forms validators provide `required`, `min`, and `max` metadata; `docs/forms.md` says not to duplicate native `min`/`max` attributes on `[formField]`.                                                                   |

## Visual, interaction, form, and lifecycle behavior

- The wrapper is full-width flex layout with border, radius, background, and text from shared
  `--kui-input-*` tokens. The split variant places minus/input/plus in DOM order; stacked keeps
  the input followed by a right-side up/down control column. The native number spinners are
  hidden and the number input uses tabular numerals.
- `number-input.css` sets base height from `--kui-input-height` (theme default points to
  `--kui-control-height-md`), text from `--kui-text-md-size`, and 12px icons. `sm` sets the
  control-height-sm/text-sm/10px icon; `lg` sets control-height-lg/text-md/14px icon. **There is no
  `[data-kui-size='xs']` rule.** The type accepts `xs` and the directive emits that size on the
  wrapper, but at current defaults it uses the base md height, font, and icon values, so `xs` is
  visually indistinguishable from `md`. Do not invent an xs style in the playground; make this
  discrepancy visible in the size comparison and browser evidence.
- Relevant tokens include `--kui-control-height-xs/sm/md/lg`, `--kui-input-height`,
  `--kui-input-border-width`, `--kui-number-input-border`, `--kui-input-radius`,
  `--kui-input-bg`, `--kui-input-color`, `--kui-input-bg-disabled`,
  `--kui-input-border-hover`, `--kui-input-border-focus`, `--kui-input-focus-ring`,
  `--kui-input-border-error`, `--kui-number-input-divider`,
  `--kui-number-input-btn-bg`, `--kui-number-input-btn-bg-hover`,
  `--kui-number-input-btn-text`, `--kui-text-md-size`, `--kui-text-sm-size`,
  `--kui-space-3`, `--kui-border-width-hairline`, `--kui-duration-base`,
  `--kui-duration-fast`, and `--kui-ease`. There are no per-example token overrides planned.
- The wrapper has real `:hover` styling unless disabled or read-only, `:focus-within` border/ring,
  and invalid border styling. Generated buttons have real hover and active styles; their disabled
  appearance comes from `aria-disabled`. Focus is on the native input or stepper button and keeps
  the wrapper focus ring visible. There is no separate Number Input active input state.
- Generated controls are native `button type="button"` elements named `Decrease value` and
  `Increase value`, with decorative SVGs hidden from accessibility APIs. Buttons step once on
  pointer/touch start; holding starts a repeat after 400ms, then steps every 80ms. Enter/Space on a
  focused generated button steps once. The native input retains browser ArrowUp/ArrowDown/Home/End
  behavior. Button state is synchronized from value/min/max/disabled/readOnly on input/change and
  `ngDoCheck`.
- At the minimum, decrement is prevented and the decrease button gets both `disabled` and
  `aria-disabled="true"`; at the maximum the increment button is disabled the same way. The
  generated button labels are hard-coded in English in the directive, so they remain English when
  the shell is switched to Russian. This is a component localization gap, not page copy to
  duplicate or override.
- In `kui-field`, the directive inherits Field id, effective size, invalid state, and the current
  hint/error id list for `aria-describedby`. Field owns the visible label, hint, required marker,
  and automatic error. Signal Forms writes the native input value and schema constraints; its raw
  invalid input collision is bypassed in favor of Field's touched-gated state.
- The root provider options in `app.config.ts` do not set a global size. The page should use the
  shell's existing theme and density rather than create a Number Input-specific token theme or a
  demo-only global provider.

## Accessibility, SSR, and route status

- Preserve the native implicit `spinbutton` role. Give every input an accessible name from the
  Field label or a native `<label for>`. Each generated stepper button is separately keyboard
  focusable and has a hard-coded English accessible name. Do not add a role to the input or use a
  placeholder as its label.
- Check that the Field-generated label `for`, input `id`, and `aria-describedby` refer to actual
  ids. When invalid is false, `aria-invalid` is absent; when true it is `"true"`. The error is
  present in `aria-describedby` only while Field renders it. Required marker `*` is visual and
  `aria-hidden`; the form/native required state supplies actual semantics.
- `disabled` and `readonly` are different: disabled removes the native input from focus and
  disables the steppers; readonly stays focusable but rejects edits and disables the steppers.
  Assert both semantics and generated-button state rather than relying on color alone.
- During SSR, `_isBrowser` makes `ngAfterViewInit` return before creating the wrapper or stepper
  buttons. The server output is the native input with host class/id/Field ARIA wiring; generated
  `.kui-number-input` chrome appears in the browser. Unit tests assert the server-platform fixture
  has no wrapper and still contains the input. The page-owned E2E spec also requests a JavaScript-
  disabled server render and checks that no wrapper/buttons exist, then checks the hydrated route has
  exactly one wrapper, two correctly named buttons, retained label/hint associations, and no
  browser console or page errors. The page-owned Playwright suite passed 12/12, including this
  JavaScript-disabled render and hydration check.
- **Hydration risk:** the current source creates/adopts DOM from `ngAfterViewInit` using
  `Renderer2`; Angular's current [DOM API guidance](https://angular.dev/guide/components/dom-apis)
  recommends render callbacks for DOM access and [hydration guidance](https://angular.dev/guide/hydration)
  warns that DOM changes before hydration can cause structure mismatches. The replacement route and
  its E2E assertions now exist; the page-owned browser/SSR suite passed its server-render and
  hydration checks on the existing route, while the parent owns shared SSR registry integration.
- `PlaygroundRoute.NumberInput` is registered in `PLAYGROUND_FORMS_ROUTES` at
  `/components/number-input` with the `number-input` Transloco scope. The Forms sidebar has a
  translated root navigation label, and the page, locale catalogues, and page-owned E2E spec are
  present. The original contract audit predates this integration; the former generic placeholder is
  no longer the current route behavior.

## Current source discrepancies and design provenance

- `docs/number-input.md` lists size as `sm | md | lg`, while the current input type is the full
  `KuiSize` union (`xs | sm | md | lg`). The published docs MCP mirror for package 1.8.0 lists all
  four sizes, but the current stylesheet has no xs rule. The page must show the accepted `xs`
  attribute and describe its actual md-like output rather than implying four distinct dimensions.
- The local source documentation and directive type use `split | stacked` with `split` default.
  The published 1.8.0 docs mirror instead says `a | b` with `b` default and examples using `a/b`;
  `docs/state-coverage.md` also still describes `a/b`, while the legacy consumer uses
  `split/stacked`. Use the current workspace source contract, not the published mirror's stale
  aliases. There is no compatibility alias for `a` or `b` in the current type.
- **Touch-target limitation:** Playground accessibility guidance requires interactive targets of
  at least 44×44px on touch viewports (`.agents/accessibility.md`). With the default theme tokens,
  split stepper buttons are 40×40px for both `xs` and `md`, 32×32px for `sm`, and 44×44px for `lg`.
  There is no `xs` number-input rule, so `xs` uses the base `md` height (40px) despite its `xs`
  attribute. The stacked variant divides each control height between its two arrow buttons: their
  heights are 20px for `xs` and `md`, 16px for `sm`, and 22px for `lg`. Only the `lg` split buttons
  meet the guidance; every stacked arrow remains below 44px. The page preserves shipped library
  visuals; resolving these targets needs a component/design decision and remains an open accessibility
  limitation.
- The local docs cover the 4 main inputs and controls but do not document that `variant` is only
  read while building DOM, the `step="any"` fallback, the hard-coded English button names, the
  missing xs size rule, or the SSR DOM shape. The external mirror also describes a separate docs
  playground path; it is not the replacement Playground app route.
- The focused directive suite covers default md wrapper, split buttons, size updates for sm/md/lg,
  basic click/Enter stepping, min/max disabled states, disabled/readOnly/invalid attributes,
  native input-event sync, wrapper teardown, and a server-platform no-wrapper case. It does not
  cover `xs`, stacked variant, variant mutation, explicit id, Field label/hint/errors, Signal
  Forms, root/Field size defaults, touch/Space/hold behavior, real hover/focus, browser hydration,
  responsive layouts, or locale switching. It has no direct bounds/step tests for `step="any"`.
- Existing consumers include the old playground's `split`/`stacked`, limits, sizes, disabled,
  read-only, invalid, Field and `ngModel` examples, plus the Signal Forms Number Input usage in
  `docs/forms.md`. The replacement should use Signal Forms for its form lifecycle instead of
  copying the old `ngModel` demo.
- `docs/design-provenance.md` has no Number Input-specific approved design record. This inventory
  maps existing shipped CSS/tokens and proposes compact catalogue composition only. Keep page SCSS
  layout-only, reuse `PlaygroundExampleCard`, and do not restyle or invent a new Number Input
  appearance; no library visual or token changes are proposed.

## Current catalogue and deterministic browser evidence

The page has one heading, keeps all example groups visible, uses short labels, and imports public
`@kikita-labs/ui` exports. The default group stays minimally configured; other examples add only
the input API under demonstration.

| Section                     | Visible examples                                                                                                                                                                                                                                                                                          | Browser evidence                                                                                                                                                                                                                                                                                                                                               |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Default                     | Minimal `kui-field` label/hint containing only `<input type="number" kuiNumberInput>` with no local size, variant, invalid, or id. In this app it resolves to md, split, valid, with the Field-generated id.                                                                                              | Check spinbutton accessible name, md wrapper size, default split chrome, generated label/id and hint description; step once from empty to 1. Server/hydrated association checks use this group.                                                                                                                                                                |
| Variants                    | Side-by-side default/explicit `split` and `stacked`, same value and bounds.                                                                                                                                                                                                                               | Assert wrapper layout class and decrease/increase accessible controls in each variant; use real keyboard activation on a named stepper.                                                                                                                                                                                                                        |
| Sizes                       | `xs`, `sm`, `md`, `lg`, one Field-local size inherited by a control with no local `size`, and a local `sm` Number Input inside an `lg` Field.                                                                                                                                                             | Assert every emitted `data-kui-size` and the parent Field's `lg` size for the local override; record that xs computed height/icon currently match md, while sm/lg resolve to their token heights. Capture all examples rather than silently omit xs.                                                                                                           |
| Bounds and native states    | Ordinary bounded value, at min, at max, `step="5"`, disabled, readonly, and explicit invalid. Keep the same split layout/size so the state difference is clear. At widths below `48rem`, the page-local state catalogue uses two columns so the final invalid Field remains visible in the 320px capture. | Check button disabling at boundaries, numeric step/clamp result, native disabled vs readonly focus/edit behavior, wrapper data attributes, and invalid `aria-invalid`.                                                                                                                                                                                         |
| Field and Signal Forms      | Required numeric Field with Signal Forms required/min/max schema, initial `0` vs minimum `1`, then touched min, required, max, and corrected values. Use the form-bound stepper to confirm its native input event updates the field.                                                                      | Assert untouched state has no error/invalid styling; verify min, required, and max alerts plus `aria-invalid`/`aria-describedby` targets; step from `0` to valid `1`; correct to `5` and verify recovery.                                                                                                                                                      |
| Explicit id                 | Standalone number input with a native `<label for="explicit-number-input-id">`, matching explicit directive id, and the directive's local invalid input.                                                                                                                                                  | Assert explicit id, native label association, and `aria-invalid`; no Field is used, so no Field-generated description is expected.                                                                                                                                                                                                                             |
| Real interaction and locale | Pointer-hover a generated stepper button; keyboard-tab into a generated button; press split and stacked steppers while held; exercise hold repeat. Keep seeded values fixed. Localize page headings, labels, group names, and form errors through the `number-input` EN/RU scope.                         | Capture real hover, keyboard focus, and pressed appearance for both split and stacked steppers at desktop and 320px. Exercise native ArrowUp/Down, generated Enter/Space stepping, and fake-clock repeat after 400 ms at 80 ms intervals until release. Verify EN/RU switching; generated button names remain English because of the library localization gap. |

The page-owned spec is
`projects/kikita-ui-playground/e2e/number-input-playground.visual.spec.ts`. It uses stable accessible
role/name locators scoped to named example groups, seeded values, and fixed viewport/theme settings.
It screenshots every named catalogue group in the default English shell at desktop `1440 x 1000`
and mobile `320px` width (`844px` height, except the six-example sizes group at `1200px` so its last
Field precedence example is fully visible), and captures real hover/focus, pressed appearances for both stepper layouts,
and the Signal Forms untouched, minimum-error, required-error, maximum-error, and corrected states.
It verifies English and Russian scope behavior and generated button names, then checks
`scrollWidth <= innerWidth` at desktop, tablet `768 x 1024`, and mobile. At 320px, it also checks
that the complete state grid fits within the scrollable workspace viewport, so its final
explicit-invalid example is not clipped from the narrow capture. The earlier page-owned browser run
passed 12 tests and its 19 screenshots were inspected. The updated suite has 13 tests and 23
screenshots. Snapshot refresh and the clean run both pass; all nine changed or added captures were
visually inspected, including the complete 320px sizes catalogue and real pressed states. The parent
owns shared route and SSR registry integration.

## Independent audit

On 2026-09-28, an independent read-only audit checked the public API/defaults, implementation,
tests, styles, page-to-contract map, and the nine captures changed or added by the coverage follow-up.
Page commit `32897b1579180264ba0d6b5907363f528d432baf` contains 57 paths, all within the Number Input
page, its EN/RU locale scope, and its E2E spec/snapshots. Coverage follow-up commit
`304b460a33b77b32f25cd7a4bfbd406631e618e5` contains 14 paths within the same scope. Both allowlists
have zero out-of-scope paths, and `git show --check` reported no whitespace errors. The reviewed
captures show no visible clipping or overlap. This audit did not rerun the recorded 13/13 focused
Playwright result. Parent-owned shared route/SSR registry and final integration checks remain pending.

## Reasoned omissions

- Do not duplicate the complete Field anatomy or provider-precedence catalogue; those belong on the
  sibling Field page. This page shows the default md resolution, one Field-local inherited size, and
  a Number Input-local `sm` override inside an `lg` Field. The app's `provideKikitaUi` configuration
  does not set a root size default; `defaults.field.size` and a route-scoped root size override
  are omitted as app-wide provider scenarios that this route does not configure.
- Do not show every min/max/step Cartesian combination. Use a central value, each boundary, and one
  non-unit step; the bound/step inputs are independent native properties and the component's
  documented stepping contract is covered by those examples.
- Do not include every native number attribute (`name`, `placeholder`, `required`, `autocomplete`,
  `inputmode`, or `step="any"`) as separate samples. They are browser-owned input semantics, not
  additional Number Input inputs; native label and form-required examples cover the relevant
  accessible and form behavior. Record `step="any"` as a generated-step limitation rather than
  demonstrating an incoherent half-native mode.
- Do not copy the old `ngModel` live editor or its duplicated dark/light/theme panels. This is a
  fixed component catalogue; the shell owns theme/language, Signal Forms is the current app forms
  contract, and the old page uses layout-specific styles rather than the new page card convention.
- Do not create a dynamic variant-switch demo. The implementation reads variant at wrapper
  creation and does not react to later changes. Static split/stacked examples map the supported
  configuration accurately.
- Do not simulate hover, focus, or pressed states in page styles. Capture those states from real
  pointer/keyboard interactions. Do not capture auto-repeat as a separate visual state; the E2E
  functional repeat assertion advances the 400ms/80ms timers with Playwright's clock and does not
  depend on wall-clock screenshot timing.
- Do not assert Home/End keyboard behavior in this browser spec. The native number input owns those
  platform interactions; the catalogue verifies common ArrowUp/ArrowDown stepping and the
  component's generated Enter/Space controls instead.
- Do not override the library's visual CSS or token values to make xs appear distinct. The missing
  xs selector is a source discrepancy to report and resolve at the library/design level.

## Self-review checklist

- [x] Read repository and Playground rules, page-authoring contract, accessibility, SSR,
      visual-regression, design-provenance, and component-checklist guidance.
- [x] Discovered the Angular 22 workspace through Angular MCP; after `get_best_practices` returned
      `Unexpected response type`, read the documented best-practices resource. Queried Signal Forms
      through Angular MCP and used the local forms contract when the index returned no result.
- [x] Inspected local/public docs, public exports and types, directive/Field implementation,
      defaults, tokens/styles, focused tests, app configuration, route/sidebar status, and real
      consumers.
- [x] Mapped all directive inputs and defaults/resolution, no outputs/models/slots, native numeric
      attributes, and meaningful values, variants, invalid, bound, disabled, read-only, form,
      accessibility, and lifecycle states.
- [x] Recorded current source/documentation/test/route/design discrepancies, and gave reasoned
      omissions plus deterministic EN/RU interaction, desktop/mobile screenshots, responsive, and
      SSR/hydration coverage.
- [x] Parent accepted the source audit as the implementation gate.
- [x] Implemented the page-local examples, EN/RU scope, and named E2E scenarios.
- [x] Run the official focused Playwright suite after the size-precedence and pressed-state
      additions; both snapshot-update and clean runs passed 13/13 tests, including server-render,
      hydration, interaction, responsive, and screenshot checks.
- [x] Refresh the size screenshots and four split/stacked pressed captures; inspect all nine changed
      or added images at desktop and 320px for clipping, overlap, and a visible real `:active` state.
- [x] Independent review confirmed that the final Number Input-only allowlists for page commit
      `32897b1` and coverage follow-up `304b460` contain no out-of-scope files.

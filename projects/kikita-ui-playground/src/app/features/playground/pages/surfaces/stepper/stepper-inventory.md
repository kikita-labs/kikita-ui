# Stepper Contract Inventory

This inventory maps the shipped Stepper contract to the fixed Playground catalogue. Stepper owns
progress presentation and eligible step-circle navigation; the consumer owns the surrounding flow,
content, and bounded Back/Next actions.

## Public inputs, models, outputs, and resolution

| Surface                    | Public type and default                                                       | Resolution and behavior                                                                                                                                                                                                                                        | Page coverage                                                                                                                                                                                          |
| -------------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `orientation`              | `KuiStepperOrientation`: `'horizontal' \| 'vertical'`; default `'horizontal'` | Horizontal is represented by an absent `data-kui-orientation`; vertical writes `vertical`.                                                                                                                                                                     | Default horizontal and a vertical example with descriptions.                                                                                                                                           |
| `size`                     | `KuiStepperSize \| undefined`: `'sm' \| 'md' \| 'lg'`; local input is unset   | Local size wins, then a supported `provideKikitaUi({ defaults: { size } })`, then `md`. A root size is accepted only when it is `sm`, `md`, or `lg`; root `xs` is ignored. The current Playground provider sets no size default, so omission resolves to `md`. | Minimal default omits size; the size group shows all three explicit values. Provider configuration is omitted because this is a component catalogue and the root provider is shared app configuration. |
| `currentIndex`             | `number`; `model(0)`                                                          | Two-way model. The component does not clamp or validate consumer values. Eligible circle activation changes the model.                                                                                                                                         | Minimal default omits it and shows index `0`; controlled linear and non-linear interactions exercise consumer and component writes. Only valid indices are used.                                       |
| `currentIndexChange`       | Implicit model output, `number`                                               | Angular model output paired with `currentIndex`; there are no explicit `output()` declarations.                                                                                                                                                                | The controlled model binding is live; E2E checks state changes after circle and external-control activation.                                                                                           |
| `linear`                   | Boolean; `true`, transformed with `booleanAttribute`                          | Done steps can be clicked to go back. Upcoming steps are not buttons unless linear is false.                                                                                                                                                                   | Controlled linear and non-linear examples compare both rules.                                                                                                                                          |
| `compact`                  | Boolean; `false`, transformed with `booleanAttribute`                         | Hides step bodies and sets circle geometry to 10px dots; no responsive breakpoint enables it automatically.                                                                                                                                                    | Compact example uses explicit `compact` and per-item accessible names.                                                                                                                                 |
| `label` (`kui-step`)       | `string`; source default `''`                                                 | Visible step label and source for generated circle button names. Empty labels are not useful and can produce empty names. The source docs do not state this default.                                                                                           | Every example uses a nonempty translated label. Empty-label behavior is omitted as an invalid consumer example.                                                                                        |
| `description` (`kui-step`) | `string`; source default `''`                                                 | A truthy value renders a secondary line.                                                                                                                                                                                                                       | Vertical example shows descriptions; the error example shows its error description.                                                                                                                    |
| `hasError` (`kui-step`)    | Boolean; `false`, transformed with `booleanAttribute`                         | Marks the step `error`; the earliest error disables later steps that do not themselves have `hasError`.                                                                                                                                                        | Error scenario has one toggled error step and one following error-disabled step.                                                                                                                       |
| `disabled` (`kui-step`)    | Boolean; `false`, transformed with `booleanAttribute`                         | Forces that item to `disabled` and removes its circle from tab order.                                                                                                                                                                                          | Separate future step is explicitly disabled while another step remains current.                                                                                                                        |

Public exports are `KuiStepperComponent`, `KuiStepComponent`, `KuiStepperOrientation`,
`KuiStepperSize`, and `KuiStepState`. `KUI_STEPPER_CONTEXT` and `KuiStepperContext` are internal
coordination details. The component also has a source-level public `steps` query and a `goTo()`
method marked `@internal`; the page does not use either. There are no step content slots, other
outputs, or form integration.

## State, interaction, and accessibility behavior

- Step state follows projected order and `currentIndex`: earlier steps are `done`, the matching
  step is `current`, and later steps are `upcoming`. Error and explicit disabled states take
  precedence. Only an item whose final state is `current` gets `aria-current="step"`. If the step at
  `currentIndex` has `hasError` or `disabled`, it becomes `error` or `disabled` and no item gets
  `aria-current`; the docs' unqualified “current step” accessibility statement does not describe
  these cases. The E2E asserts the shipped error behavior; resolving the current/error precedence
  belongs to the library contract, not this page.
- Done steps render a native button named `Back to step {label}`. With `linear=false`, upcoming
  steps render native buttons named `Go to step {label}`. Current, disabled, and error circles are
  noninteractive spans. Connector lines and check/cross SVGs are decorative. Interactive circle
  buttons are 24px (`sm`), 32px (`md`), 40px (`lg`), or 10px in compact mode; each is below the app
  accessibility guide's 44×44px touch-target recommendation. The page records this shipped
  limitation without resizing the component.
- The host has `role="list"`; each step has `role="listitem"`. Every page Stepper has a translated
  accessible name. Compact mode hides visible labels and SVGs, so its three `kui-step` hosts also
  receive translated `aria-label` values to retain each list item’s identity.
- Native circle buttons provide Tab, Enter, and Space behavior. E2E covers Tab focus, Enter and
  Space activation, plus a real hover on a clickable upcoming step's circle. Stepper has no custom Arrow,
  Home, or End handling. The focus screenshot captures the padded example card so the real focus ring
  remains inside the screenshot bounds. The page does not claim an arrow-key pattern.
- The built-in circle button name prefixes remain hard-coded English. Step labels and Playground
  copy switch languages, but the library does not expose a localization input for those prefixes.
  This source gap is recorded rather than patched by page code.
- The Playground currently supports English and Russian, both left-to-right; the shell changes the
  document `lang` but does not set `dir`. The E2E switches locale, checks the translated page/list
  names, and checks page-level overflow at 320px in both locales; it does not capture a Russian
  screenshot. No RTL rendering is claimed. The existing Stepper stylesheet uses physical left/right
  alignment for horizontal end steps, so RTL mirroring remains unverified and outside this scope.
- The consumer signal toggles both `hasError` and its error-only description, so the cleared state
  does not leave a stale “Card declined” message. The component has no live region; the visible
  description/state styling communicates the error, while the `aria-current` precedence gap
  described above remains a library-level accessibility question.
- The page is deterministic and uses no browser globals or lifecycle-dependent setup. Source uses
  signal inputs, a content query, and CSS only; SSR/hydration still requires route-level browser
  verification.

## Visual contract and tokens

The default is horizontal, `md`, and non-compact. Theme values come from the shell and semantic
Kikita tokens. The Stepper stylesheet imports through the public Kikita UI style entrypoint and
defines `sm` as 24px, `md` as 32px, `lg` as 40px, and compact circles as 10px. It has no
orientation breakpoint or automatic compact mode. Playground SCSS only arranges the examples and
uses `--kui-space-*` values; it does not override Stepper visuals.

No Stepper-specific approved design record appears in `docs/design-provenance.md` or another tracked
design record. Existing source and CSS document the shipped visuals but do not retroactively approve
them. This audit makes no Stepper visual changes; any future visual change needs an approved record.

## Contract-to-example map

| Example                    | Visible coverage and interaction                                                                                                               | Browser evidence                                                                                                                                                                               |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Default                    | Minimal horizontal Stepper; omitted size, index, linear, and compact inputs; first step current.                                               | Assert list/name, `md`, and current marker; capture dark, light, and 320px states with no page-level horizontal overflow.                                                                      |
| Linear navigation          | Controlled model starts at index `1`; consumer Back/Next buttons are bounded to `0..2`; done circle goes back.                                 | Assert model-driven current state after external controls and circle activation; reach the named circle by Tab, capture true focus, and activate with Enter and Space.                         |
| Vertical with descriptions | Vertical layout, all descriptions, middle step current.                                                                                        | Assert orientation host value and description content; capture the group.                                                                                                                      |
| Sizes                      | Complete `sm`, `md`, `lg` rows at the same state and labels.                                                                                   | Assert each `data-kui-size`; capture the size matrix at desktop, tablet, and 320px with no page-level horizontal overflow.                                                                     |
| Explicit disabled          | Future step has `[disabled]`; middle step remains current.                                                                                     | Assert `data-kui-state="disabled"` and no circle button for that item; capture the named disabled example.                                                                                     |
| Error                      | Payment step has an error description; following Confirm step becomes disabled; consumer toggle clears/restores the error and its description. | Assert error/disabled/current states before and after toggle, assert the description disappears, and capture both states.                                                                      |
| Compact                    | Explicit dots-only mode at index `1`, with an accessible name on each step host.                                                               | Assert compact marker, current marker, per-item names, and 10px geometry; capture the group.                                                                                                   |
| Non-linear navigation      | Starts at index `0`; upcoming circles allow a forward jump and completed circles allow returning.                                              | Capture the real upcoming-circle hover, activate the named Review button, assert current state, activate the completed Account button, and capture the changed state.                          |
| SSR and lazy translations  | Route server-renders, hydrates, and loads the page-specific EN/RU scope.                                                                       | Assert HTTP 200, server HTML list/current markup, shell and scope catalogues, language switching in both directions, clean console/page errors, and 320px overflow after switching to Russian. |

Omissions: invalid/out-of-range `currentIndex` values have no documented supported semantics and
are not shown; multiple simultaneous error flags are omitted because the source has a precedence
edge that conflicts with the docs’ singular-error wording; compact × error is omitted because the
component hides both labels and the error SVG, making the error look identical without extra
consumer content; provider editing and per-token overrides are outside this entity catalogue;
horizontal covers every size, while vertical uses `md` because the size examples already exercise
circle and label scaling and the vertical example covers the independent layout behavior; a full
wizard body or form is omitted because Stepper only renders progress metadata. Hover is captured
on a clickable upcoming step in non-linear mode so the shipped hover border and label treatment are
visible. The completed step's border already has the hover color, so hovering it produces no visible
difference. Non-button steps have no hover treatment or interactive target.

The parent-owned surface route fragment already lazy-loads `/components/stepper` with the
`stepper` translation scope. This page change does not edit routing or shared registries. The
static audit passed on 2026-09-27 for the current uncommitted worktree
(`node scripts/verify-static-audit.mjs`); it does not exercise page rendering. Fresh SSR/build and
browser verification ran on 2026-09-27 for this current uncommitted worktree. The Angular 22.0.7
local CLI production/SSR build (`ng build kikita-ui-playground`) passed and produced browser and
server bundles; it prerendered zero static routes. The focused Stepper Playwright suite passed
7/7 both with `--update-snapshots` and in a clean run without snapshot updates. The update run
refreshed `stepper-linear-keyboard-focus-win32.png` and `stepper-error-cleared-win32.png`. All 15
current captures were reviewed for clipping, overlap, and text readability across desktop, tablet,
and 320px layouts; the focus ring is visible in its padded-card capture and the cleared error
example no longer shows its description. The spec checks page-level overflow at 320px, including
after switching to Russian. The `pnpm.cmd` build wrapper could not fetch `@pnpm/exe` from npm in
this environment; the installed local Angular CLI was used for the successful build. Real
assistive-technology review was not performed.

## Source audit

- `docs/stepper.md` — usage, documented inputs, accessibility notes, CSS variables, and style import.
- `projects/ui/src/lib/components/stepper/kui-stepper.component.ts` and
  `kui-step.component.ts` — signal inputs/model, state precedence, rendered roles, generated names,
  click eligibility, and index updates.
- `projects/ui/src/lib/components/stepper/kui-stepper-context.token.ts` and `index.ts`,
  `projects/ui/src/lib/components/index.ts`, and `projects/ui/src/public-api.ts` — internal
  coordination boundary and public exports.
- `projects/ui/src/lib/components/stepper/kui-stepper.component.spec.ts` — current unit coverage:
  list roles, positional state/current marker, done-step back navigation, linear restriction,
  non-linear jump, and one-error disablement.
- `projects/ui/src/styles/stepper.css`, `projects/ui/src/styles/kikita-ui.css`,
  `projects/ui/src/lib/theme/create-kui-theme.ts`, and
  `projects/ui/src/lib/utils/kui-defaults.util.ts` — runtime layout/states, style import, theme
  values, and supported root size fallback.
- `docs/di-defaults.md` and `projects/kikita-ui-playground/src/app/app.config.ts` — root-size
  precedence and the current app’s lack of a root size default.
- `projects/playground/src/app/pages/stepper/stepper.page.html` and `stepper.page.ts` — legacy
  examples for interaction, orientation, sizes, error toggle, compact, and non-linear mode.
- `docs/state-coverage.md` — existing Stepper route/state coverage record.

## Self-review checklist

- [x] Every public input, model output, type domain, source default, and size resolution rule is mapped.
- [x] The visible examples cover default, controlled linear and non-linear behavior, both orientations,
      all sizes, descriptions, explicit disabled, error, and compact states.
- [x] Playwright covers an actual upcoming-circle hover, focus, Enter and Space activation, and
      screenshots the explicit-disabled example.
- [x] Compact list items keep translated accessible names while their visible bodies are hidden.
- [x] All page-owned text is localized through matching English and Russian keys.
- [x] Page SCSS arranges examples with Kikita spacing tokens and leaves component visuals to the library.
- [x] Confirmed there is no approved Stepper-specific visual design record; the audit makes no
      visual changes.
- [x] Invalid indices, multi-error precedence, compact error, missing provider configuration, and
      full-wizard content have explicit omission reasons.
- [x] Root static audit passed on 2026-09-27 for the current uncommitted worktree; it does not
      verify page rendering.
- [x] Current-worktree SSR/build and focused Stepper Playwright passed on 2026-09-27; both snapshot
      updates were visually reviewed, followed by a clean 7/7 run without updates.
- [x] All 15 current captures were reviewed for clipping, overlap, and readability at desktop,
      tablet, and 320px; page-level overflow checks pass at 320px, including after switching to
      Russian.
- [ ] Real assistive-technology review was not performed.

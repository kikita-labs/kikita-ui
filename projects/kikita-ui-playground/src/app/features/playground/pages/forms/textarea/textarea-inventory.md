# Textarea Inventory

This source-backed contract inventory was reviewed and approved before implementation. It maps
the public API, native and Signal Forms behavior, documented caveats, and deterministic evidence.

## Contract sources

- Public component documentation: [`docs/textarea.md`](../../../../../../../../../docs/textarea.md),
  [`docs/forms.md`](../../../../../../../../../docs/forms.md),
  [`docs/field.md`](../../../../../../../../../docs/field.md), and
  [`docs/di-defaults.md`](../../../../../../../../../docs/di-defaults.md).
- Public exports and types: [`textarea/index.ts`](../../../../../../../../../projects/ui/src/lib/components/textarea/index.ts),
  [`components/index.ts`](../../../../../../../../../projects/ui/src/lib/components/index.ts),
  [`public-api.ts`](../../../../../../../../../projects/ui/src/public-api.ts), and
  [`KuiSize`](../../../../../../../../../projects/ui/src/lib/types/kui-size.type.ts).
- Implementation and focused tests:
  [`kui-textarea.directive.ts`](../../../../../../../../../projects/ui/src/lib/components/textarea/kui-textarea.directive.ts),
  [`kui-textarea.directive.spec.ts`](../../../../../../../../../projects/ui/src/lib/components/textarea/kui-textarea.directive.spec.ts),
  [`kui-field.component.ts`](../../../../../../../../../projects/ui/src/lib/components/field/kui-field.component.ts),
  [`kui-field.component.html`](../../../../../../../../../projects/ui/src/lib/components/field/kui-field.component.html),
  and [`kui-field.component.spec.ts`](../../../../../../../../../projects/ui/src/lib/components/field/kui-field.component.spec.ts).
- Defaults and tokens: [`kui-defaults.util.ts`](../../../../../../../../../projects/ui/src/lib/utils/kui-defaults.util.ts),
  [`kikita-ui-options.interface.ts`](../../../../../../../../../projects/ui/src/lib/providers/kikita-ui-options.interface.ts),
  [`kui-field-options.token.ts`](../../../../../../../../../projects/ui/src/lib/tokens/kui-field-options.token.ts),
  [`input.css`](../../../../../../../../../projects/ui/src/styles/input.css),
  [`density.css`](../../../../../../../../../projects/ui/src/styles/density.css),
  [`kikita-ui.css`](../../../../../../../../../projects/ui/src/styles/kikita-ui.css),
  [`create-kui-theme.ts`](../../../../../../../../../projects/ui/src/lib/theme/create-kui-theme.ts),
  and [`tokens.md`](../../../../../../../../../docs/tokens.md).
- Playground and existing consumers: [`app.config.ts`](../../../../../../../../../projects/kikita-ui-playground/src/app/app.config.ts),
  [`Field page`](../../../../../../../../../projects/kikita-ui-playground/src/app/features/playground/pages/forms/field/field.html),
  [`Field inventory`](../field/field-inventory.md),
  [`Input inventory`](../input/input-inventory.md),
  [`legacy Textarea page`](../../../../../../../../../projects/playground/src/app/pages/textarea/textarea.page.html),
  [`legacy Field page`](../../../../../../../../../projects/playground/src/app/pages/field/field.page.html),
  and [`Dialog consumer`](../../../../../../../../../projects/playground/src/app/pages/dialog/dialog.page.ts).
- Page-authoring and review rules: [`component-page-authoring.md`](../../../../../../../.agents/component-page-authoring.md),
  [`accessibility.md`](../../../../../../../.agents/accessibility.md),
  [`ssr-hydration.md`](../../../../../../../../../.agents/ssr-hydration.md),
  [`component-checklist.md`](../../../../../../../../../docs/component-checklist.md),
  [`design-provenance.md`](../../../../../../../../../docs/design-provenance.md),
  [`state-coverage.md`](../../../../../../../../../docs/state-coverage.md),
  and [`component-roadmap.md`](../../../../../../../../../docs/component-roadmap.md).

## Public API, defaults, and coverage map

`KuiTextareaDirective` is a standalone styling and Field-integration directive on native
`textarea` elements with selector `textarea[kuiTextarea]`. The local barrel re-exports it; the
components barrel and package root re-export that barrel. It has no public outputs, models,
methods, component-specific providers, or content slots.

| Public input                               | Type and default/resolution                                                                                                                                                                                                                                                                                                                                             | Proposed visible coverage                                                                                                                                                                                                                |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `size`                                     | `KuiSize \| undefined` (`xs \| sm \| md \| lg`); local textarea value wins, then the containing Field's effective size, then the root `provideKikitaUi({ defaults: { size } })`, then `md`. The Field's effective size resolves its local `size`, `KUI_FIELD_OPTIONS.size`, root size default, then `md`.                                                               | The minimally configured Field example resolves to `md` in this app. A compact four-value matrix sets each supported size on `textarea[kuiTextarea]` and checks every emitted `data-kui-size`.                                           |
| `invalid` (signal property `invalidInput`) | Optional boolean, default `false`, coerced with Angular `booleanAttribute`. Outside a Signal Forms field, the textarea is invalid when this input is true or the containing Field reports an error. With projected `[formField]`, Signal Forms writes its raw invalid state into the colliding input; the directive instead uses the Field's touched-gated `invalid()`. | Show one standalone invalid textarea and one required Signal Forms textarea through untouched, touched-invalid, and corrected states. The Signal Forms control should only become invalid after the Field's touched/error state changes. |
| `id`                                       | `string \| undefined`; omitted outside a Field leaves the textarea without an id; omitted inside a Field inherits `controlId`; an explicit local id wins.                                                                                                                                                                                                               | The default Field example checks generated label association. A separate standalone textarea uses an explicit id with a native `<label for>` targeting the same value.                                                                   |

**Field id integration caveat:** `kui-field` binds its visible label to its generated `controlId`.
An explicit `id` on the projected textarea overrides the textarea's host id but does not update
that label's `for`, disconnecting the association. Keep the explicit-id example standalone and
pair it with a native label targeting the explicit id.

There are no Textarea-specific appearance, shape, density, loading, or resizer-mode inputs. The
directive's `size` is the only visual variant API. `rows`, `cols`, `wrap`, `placeholder`, text
content/value, `disabled`, `readOnly`, `required`, `name`, `maxlength`, and `minlength` remain
native HTML properties/attributes or Signal Forms bindings. They are not additional directive
inputs. Use specialized controls such as Number Input, Slider, Select, or Text Input for their
own behaviors rather than styling a textarea into a different control.

## Visual, interaction, form, and lifecycle behavior

- The directive applies `kui-input` and `kui-textarea` classes and binds `data-kui-size`,
  `data-kui-invalid`, `id`, `aria-describedby`, and `aria-invalid`. `kui-textarea` has no
  textarea-only style rules; the shared rules target `.kui-input` and `textarea.kui-input`.
- The base shared input rule is full-width, `min-inline-size: 0`, border-box, and token-themed.
  The textarea rule sets `min-block-size: calc(var(--kui-input-height, 40px) * 2)`, vertical
  padding from `--kui-space-3`, and native `resize: vertical`. It preserves the browser's
  multiline editing and resizing behavior; the default resizer must not be simulated.
- The size selectors set textarea minimum block size to the `xs`, `sm`, or `lg` control-height
  token and adjust text size for `xs` and `lg`; `md` uses the shared input-height fallback,
  currently 40px multiplied by two for the textarea minimum. Native `rows` contributes intrinsic
  height above those minimums, so the visual difference between small sizes can be subtle. Use
  short fixed row counts and assert all four `data-kui-size` values in browser evidence.
- Shared CSS styles hover, focus, invalid, disabled, and read-only states. Focus has a visible
  border and ring; invalid has the error border; disabled uses a disabled surface, not-allowed
  cursor, and reduced opacity; read-only keeps the control focusable, hides its caret, and uses the
  default cursor. There is no Textarea-owned active style or JavaScript interaction.
- Standalone `invalid` writes `data-kui-invalid` and `aria-invalid="true"`; false removes both
  attributes. A Field error also makes the projected textarea invalid. With Signal Forms, the
  directive ignores the raw invalid value written by `[formField]` and follows Field's
  touched-gated invalid state.
- When projected into `kui-field`, the directive uses the Field control id, receives its effective
  size and invalid state, and copies the currently rendered hint/error ids into
  `aria-describedby`. `kui-field` owns the visible label, hint, required marker, error, and
  description wiring.
- The stylesheet imports through the public `kikita-ui.css` entrypoint. The component consumes
  shared input, control-height, text-size, and spacing variables, including
  `--kui-input-height`, `--kui-input-padding-inline`, `--kui-input-radius`, `--kui-input-bg`,
  `--kui-input-color`, border/hover/focus/error tokens, `--kui-input-focus-ring`, disabled
  background, `--kui-space-3`, `--kui-control-height-xs/sm/lg`, and `--kui-text-xs/base-size`.
  There are no Textarea-specific custom properties. The shell's theme/density scope remains the
  source for shared tokens; density is not a directive input.

## Accessibility and SSR

- Preserve the native `<textarea>` element and its implicit multiline textbox semantics. Give
  every example an accessible name through a `kui-field` label or an associated native `<label>`;
  placeholder text alone is not a label. Do not add an ARIA role to the native textarea.
- Native `disabled` and `readonly` are distinct. Disabled removes the control from normal keyboard
  interaction; read-only remains focusable and selectable. Native/form-state required semantics
  come from the native attribute or Signal Forms schema; the Field's asterisk is visual and hidden
  from assistive technology.
- `aria-invalid` is omitted when false. `aria-describedby` must contain only existing hint and
  visible error ids; Field's automatic error (rendered with `role="alert"`) is absent before touch
  and after correction.
- `KuiTextareaDirective` only injects optional Field context and root size defaults and binds host
  attributes; it has no browser-global access, listeners, timers, or template DOM mutation. Its
  host behavior is SSR-safe. A Field generates one control id per instance; verify that the
  server-rendered label `for`, textarea `id`, `aria-describedby`, invalid state, and size agree,
  then confirm the label association still matches after hydration. Compare the association rather
  than relying on the counter's exact numeric id.
- The directive's unit suite has no dedicated SSR or Signal Forms Textarea case. Field's Signal
  Forms unit coverage exercises the equivalent `input[kuiInput]` collision/touched gate. The
  replacement Forms route and shared SSR registry are integrated; the page-owned E2E covers the
  Textarea SSR and Signal Forms behavior directly.

## Source discrepancies and evidence gaps

- `docs/textarea.md` documents the three inputs but does not give a stable API table, exact
  boolean default/coercion, standalone id behavior, accessible-name rules, style hooks, or SSR
  notes. Its size resolution omits the `KUI_FIELD_OPTIONS.size` layer inherited through
  `KuiFieldComponent.effectiveSize`.
- The directive JSDoc records that Signal Forms overwrites its `invalid` input with raw field state
  and that Textarea then uses the Field's touched-gated invalid value. The Textarea source doc does
  not describe this behavior. The Field source and tests cover that collision with `input[kuiInput]`,
  but the Textarea suite has no direct form test.
- `kui-textarea.directive.spec.ts` covers local `size="lg"` plus `invalid`, and Field-generated
  id/label, inherited `sm`, Field error state, and hint/error descriptions. It does not cover the
  default `md`, all four sizes, `invalid=false`, explicit id, root-size default, standalone
  accessibility, read-only/disabled native states, real hover/focus, resize, Signal Forms, SSR, or
  hydration. The generic root-default integration test includes `input[kuiInput]` but not Textarea.
- `docs/state-coverage.md` describes the legacy `/textarea` page as default/error/disabled plus
  native resize. That legacy page currently renders those cases. The replacement Textarea page,
  EN/RU scope, Forms route, and shared SSR registration are integrated in the working tree.
- `docs/design-provenance.md` has no Textarea-specific approved visual record. This audit maps the
  shipped CSS and theme tokens and proposes catalogue coverage only; it does not authorize new
  component styling.
- Existing `projects/playground` Dialog content sets inline `resize: both` for its dialog-growth
  demo. That is a consumer override of the directive stylesheet's `resize: vertical`, not the
  Textarea default; do not copy it into the catalogue.

## Page catalogue and deterministic evidence

| Section                 | Implemented example and E2E evidence                                                                                                                                                                                                                                                                     |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Default                 | `TextareaDefault` keeps a minimal Field label + hint around a native `textarea[kuiTextarea]` with fixed rows. E2E checks `md`, generated id/label association, hint description, no invalid state, and computed `resize: vertical`; it also checks the association in server markup and after hydration. |
| Sizes                   | `TextareaSizes` renders four named textareas with explicit `xs`, `sm`, `md`, and `lg` sizes and a fixed row count. E2E checks each `data-kui-size` and captures the group at desktop and 320px.                                                                                                          |
| Native states           | `TextareaStates` renders an enabled hover/focus target, read-only and disabled controls with seeded values, and a standalone `invalid` textarea with a native label. E2E checks native/directive states and captures real pointer-hover and keyboard-focus states.                                       |
| Explicit id             | `TextareaExplicitId` renders a standalone textarea with a fixed explicit id and native `<label for>`. E2E checks the id and label association; the override stays outside `kui-field`.                                                                                                                   |
| Signal Forms validation | `TextareaValidation` shows a required textarea inside `kui-field`. E2E checks the untouched state, blurs to trigger the real required error, then fills a fixed value and asserts invalid/error/description cleanup with before/after captures.                                                          |
| Responsive and locale   | All examples stay visible. The `textarea` scope has EN/RU resources and E2E checks runtime scope loading/switching plus page width at 1440, 768, and 320px. Named group screenshots cover desktop and 320px.                                                                                             |

The page-owned `textarea-playground.visual.spec.ts` uses accessible role/name locators under named
groups. Cases start on `/components/textarea` with fixed viewport and seeded text. Screenshots
cover the default, sizes, native states, explicit id, and Signal Forms card; separate captures cover
real hover/focus and invalid/corrected validation transitions. The SSR case loads with JavaScript
disabled, then reloads with hydration enabled, fails on console/page errors, and checks
label/description associations in both renders. All 8 Textarea tests pass as part of the 24-test
integration suite; desktop and 320px baselines were visually inspected.

## Reasoned omissions

- A full size-by-state-by-row-count Cartesian matrix is omitted because `rows` affects intrinsic
  height independently of the public size input. The page shows each supported size and each
  meaningful native/directive state; browser assertions cover size values where the visual heights
  are close.
- `cols`, `wrap`, placeholder variants, `name`, `maxlength`, `minlength`, spellcheck, and every
  other native textarea attribute are omitted as browser-owned HTML behavior, not Textarea API.
  Fixed `rows` and real multiline content are enough to show the native control boundary.
- Native resize drag-to-extent is omitted as a screenshot state because it changes page geometry
  and differs by browser/OS. The catalogue should assert computed `resize: vertical` and show its
  real native handle; an interactive resize is unnecessary to establish the CSS contract.
- `active` is omitted because there is no Textarea-specific active selector or state logic.
  Hover and focus are produced by real pointer/keyboard interaction; invalid, read-only, and
  disabled are native/directive states.
- An explicit id inside `kui-field` is omitted because the current Field label continues targeting
  its generated `controlId`, while the textarea directive lets a local id override that host id.
  Standalone native label association demonstrates the supported override without a mismatch.
- Independent theme and density panels are omitted because theme/density belong to the persistent
  shell, not the Textarea API. The catalogue inherits those scopes and does not override tokens.
- Field provider precedence and exhaustive Field anatomy remain on the sibling Field page. The
  Textarea page only needs its minimal Field composition and the effective size it inherits.

## Self-review checklist

- [x] Read the page-authoring contract and relevant root/app accessibility, SSR, styling, i18n,
      architecture, component, state-coverage, and design-provenance guidance.
- [x] Inspected the public docs/exports/types, directive and Field implementation, styles/tokens,
      default providers, focused tests, root defaults, and existing consumers.
- [x] Mapped every Textarea input, its type and default/resolution, the absence of outputs/models,
      the supported size values, and meaningful native/Field/Signal Forms states.
- [x] Recorded documentation/test/route/design discrepancies, the explicit-id Field caveat, and
      specific reasons for omitted native attributes and combinations.
- [x] Proposed visible examples and deterministic accessible browser, SSR/hydration, responsive,
      hover/focus, resize, and validation evidence.
- [x] Parent reviewed and approved the contract inventory before page implementation.
- [x] Implemented the approved catalogue, EN/RU scope, and page-owned accessible E2E assertions.
- [x] Parent integrated the Forms route, `textarea` scope, and shared SSR/adaptive route registry.
- [ ] Shared verification pass runs and visually reviews generated desktop, tablet, and 320px
      screenshots and focused checks.

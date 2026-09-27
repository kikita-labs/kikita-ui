# Input Inventory

## Contract sources

- Public contract: [`docs/input.md`](../../../../../../../../../docs/input.md),
  [`docs/forms.md`](../../../../../../../../../docs/forms.md), and
  [`docs/field.md`](../../../../../../../../../docs/field.md).
- Public exports and type: [`input/index.ts`](../../../../../../../../../projects/ui/src/lib/components/input/index.ts),
  [`components/index.ts`](../../../../../../../../../projects/ui/src/lib/components/index.ts),
  [`public-api.ts`](../../../../../../../../../projects/ui/src/public-api.ts), and
  [`KuiSize`](../../../../../../../../../projects/ui/src/lib/types/kui-size.type.ts).
- Directive behavior and focused tests:
  [`kui-input.directive.ts`](../../../../../../../../../projects/ui/src/lib/components/input/kui-input.directive.ts)
  and [`kui-input.directive.spec.ts`](../../../../../../../../../projects/ui/src/lib/components/input/kui-input.directive.spec.ts).
- Default resolution implementation and provider types:
  [`kui-defaults.util.ts`](../../../../../../../../../projects/ui/src/lib/utils/kui-defaults.util.ts),
  [`provide-kikita-ui.ts`](../../../../../../../../../projects/ui/src/lib/providers/provide-kikita-ui.ts),
  [`kikita-ui-options.interface.ts`](../../../../../../../../../projects/ui/src/lib/providers/kikita-ui-options.interface.ts),
  and [`kui-field-options.token.ts`](../../../../../../../../../projects/ui/src/lib/tokens/kui-field-options.token.ts).
- Field and Signal Forms behavior:
  [`kui-field.component.ts`](../../../../../../../../../projects/ui/src/lib/components/field/kui-field.component.ts),
  [`kui-field.component.html`](../../../../../../../../../projects/ui/src/lib/components/field/kui-field.component.html),
  [`kui-field.component.spec.ts`](../../../../../../../../../projects/ui/src/lib/components/field/kui-field.component.spec.ts),
  and [`forms.md`](../../../../../../../../../docs/forms.md).
- Runtime styles and theme variables:
  [`input.css`](../../../../../../../../../projects/ui/src/styles/input.css),
  [`kikita-ui.css`](../../../../../../../../../projects/ui/src/styles/kikita-ui.css),
  [`create-kui-theme.ts`](../../../../../../../../../projects/ui/src/lib/theme/create-kui-theme.ts),
  [`tokens.md`](../../../../../../../../../docs/tokens.md), and
  [`di-defaults.md`](../../../../../../../../../docs/di-defaults.md).
- Playground root configuration:
  [`app.config.ts`](../../../../../../../../../projects/kikita-ui-playground/src/app/app.config.ts).
- Existing examples and consumers:
  [`legacy Input page`](../../../../../../../../../projects/playground/src/app/pages/input/input.page.html),
  [`Field inventory`](../field/field-inventory.md),
  [`Group inventory`](../group/group-inventory.md), and
  [`OTP Input`](../../../../../../../../../projects/ui/src/lib/components/otp-input/kui-otp-input.component.ts).

## Public API, defaults, and coverage map

`KuiInputDirective` is a standalone styling directive on native `input` elements with selector
`input[kuiInput]`. It has no template, public outputs, models, methods, component-specific provider,
or slots. The local barrel re-exports `KuiInputDirective` and the separate
`KuiInputGroupDirective`; the latter is not part of the `kuiInput` contract and is covered by Group
or Field composition instead.

| Public input                               | Type and default/resolution                                                                                                                                                                                                                                                                                                                     | Visible example and evidence                                                                                                                                                                                                                                                             |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `size`                                     | `KuiSize \| undefined`; local value wins, then the containing `kui-field`'s effective size, then root `provideKikitaUi({ defaults: { size } })`, then `md`. `KuiSize` is `xs \| sm \| md \| lg`. A Field's effective size itself resolves local Field input, `KUI_FIELD_OPTIONS.size`, root default, then `md`.                                 | Default example resolves to `md` in this Playground because its `provideKikitaUi()` call sets only `scrollbars`. A four-value size matrix uses explicit `size` on `input[kuiInput]`; a separate `lg` Field shows inherited size on an input with no local `size`. E2E checks both paths. |
| `invalid` (signal property `invalidInput`) | Optional boolean input, default `false`, coerced with Angular `booleanAttribute`. Outside a Signal Forms field, `true` or a containing Field error sets the invalid state. With projected `[formField]`, Signal Forms writes its raw state to the colliding `invalid` input, so the directive trusts Field's touched-gated `invalid()` instead. | Show one standalone `invalid` input and one required Signal Forms control before and after touch. The latter must become invalid only after the Field's real touched/error state changes.                                                                                                |
| `id`                                       | `string \| undefined`; omitted outside Field leaves the input without an id; omitted inside Field inherits `controlId`; an explicit local id wins.                                                                                                                                                                                              | The minimal Field example demonstrates the generated id/label association. A separate standalone input demonstrates the explicit id with a native `<label for>` association.                                                                                                             |

**Field id integration caveat:** `kui-field` currently binds its visible label to the generated
`controlId`. An explicit `id` on its nested input can replace the input id while leaving the label's
`for` set to the generated id, breaking the association. The explicit id example therefore uses a
standalone `input[kuiInput]` and a native label that names the same id.

No `appearance`, shape, density, loading, or other visual variant input exists. `type`, `value`,
`placeholder`, `name`, `disabled`, `readOnly`, `required`, `autocomplete`, and input constraints
remain native HTML attributes/properties, not `KuiInputDirective` inputs. Use `textarea[kuiTextarea]`
for multiline controls and the dedicated Number Input, Color Input, Slider, Date Picker, Select,
Combobox, and other input-like directives for their supported behaviors.

## Visual, interaction, form, and lifecycle behavior

- Base styles make the native control full-width with `min-inline-size: 0`, themed border, radius,
  background, text, placeholder, padding, and transition. The single public style entrypoint imports
  `input.css`; playground examples must not restyle the input's visual identity.
- All four size values have selectors. The default `md` height is 40px; `xs`, `sm`, and `lg` use
  the corresponding control-height tokens. `xs` and `lg` also change text size.
- CSS supplies hover border, keyboard/pointer focus border and focus ring, invalid border, disabled
  background/cursor/opacity, and read-only cursor/caret behavior. There is no Input-owned active
  state or JavaScript interaction. Hover and focus evidence must come from real pointer and keyboard
  interaction, never a page class or simulated pseudo-state.
- Standalone `[invalid]` writes `data-kui-invalid` and `aria-invalid="true"`; false removes them. A
  Field's invalid state is also reflected on the input. Signal Forms owns native value, required,
  disabled, touched/dirty, and validation bindings; `kuiInput` does not implement form state.
- Inside `kui-field`, the directive uses the Field's control id, joins the Field's currently rendered
  hint/error ids into `aria-describedby`, and reflects Field invalid state. Field owns the visible
  label, hint, required marker, and error; do not hand-wire a second copy around the input.
- The directive only injects optional Field context and root size options and binds attributes on
  its host. It does not read browser globals or mutate the DOM. A standalone input has no generated
  id; the inherited id behavior comes from Field, whose id is stable for that Field instance.

## Accessibility and SSR

- Keep native `<input>` semantics. Give every displayed control an accessible name through
  `kui-field label`, an associated native `<label>`, or `aria-label`; placeholder text alone is not
  a label. Do not add an ARIA role to the native input.
- Native `disabled` and `readonly` remain distinct browser states. The directive does not add
  `required`, validation constraints, or keyboard handling. Field's required marker is visual and
  hidden from assistive technology; Signal Forms/native validation owns required semantics.
- `aria-invalid` is omitted when false. `aria-describedby` comes only from existing Field hint and
  visible error content. Field errors use `role="alert"`; a hidden or absent error must not leave a
  stale description reference.
- Input's host bindings are SSR-safe. The page-owned SSR assertion uses the minimally configured
  default Field: it checks the rendered size and the association between the generated input `id`
  and label `for`, and confirms that no `aria-describedby` is present when the Field has no hint or
  error. It repeats those checks after hydration and compares the association rather than relying on
  the counter's exact numeric id. The separate browser Signal Forms scenario covers the required
  control's untouched, invalid, and corrected states; it does not claim SSR coverage for that
  validation flow. The Input directive's unit suite has no dedicated SSR test, and the replacement
  app's shared SSR route registry is parent-owned.

## Theme tokens and source discrepancies

The Input directive declares no CSS custom properties. `input.css` consumes `--kui-input-height`,
`--kui-input-padding-inline`, `--kui-input-radius`, `--kui-input-bg`, `--kui-input-color`,
`--kui-input-border`, hover/focus/error border variables, `--kui-input-focus-ring`, disabled
background, control-height tokens, and text-size tokens. Theme generation connects public aliases
such as `--kui-input-px`, `--kui-input-text`, and `--kui-input-placeholder` to the variables the
stylesheet consumes. The component page should inherit the shell's theme and density; it should not
add per-example token overrides.

The current source surfaces differ in these ways:

- `docs/input.md` documents the three inputs and Signal Forms usage but has no stable `API`,
  `Accessibility`, or CSS hooks/style-import section required by the source-doc contract. The
  detailed Field and Forms docs supply integration context, but do not replace an Input-specific
  accessible-name/default-style note.
- The Input size description says Field size then root default then `md`; when wrapped by Field,
  the inherited effective Field size can also come from `KUI_FIELD_OPTIONS.size`. The Field and DI
  docs state that middle provider layer; the Input docs do not.
- `input.css` also contains `.kui-input-group` styles. That chrome is a separate public
  `KuiInputGroupDirective` or Field affix composition, not an Input variant.
- The legacy `projects/playground` Input page marks hover/focus with `.is-hover-preview`,
  `.is-focus-preview`, and CSS state selectors. Those are static visual simulations and must not be
  copied into this catalogue; use real interactions for named browser evidence.
- No Input-specific approved visual record is listed in `docs/design-provenance.md`. This inventory
  therefore maps the shipped CSS and theme tokens only; it does not authorize new input styling.

## Page catalogue and evidence map

| Section                | Page content and E2E evidence                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Default                | `InputDefault` shows the minimally configured `kui-field` label + native `input[kuiInput]`. E2E asserts default `md`, the false invalid state omits both invalid host attributes, verifies generated id/label, and confirms no description reference when the Field renders no hint or error.                                                                                                                                                 |
| Explicit id            | `InputExplicitId` shows a standalone native input with an explicit `id` and matching native label. E2E checks the public id and label association; the default Field example stays minimal.                                                                                                                                                                                                                                                   |
| Sizes                  | `InputSizes` shows four compact, labelled controls for `xs`, `sm`, `md`, and `lg`, plus an input inheriting `lg` from its Field. E2E checks each explicit `data-kui-size` and the inherited value, and captures desktop and 320px screenshots.                                                                                                                                                                                                |
| Native states          | `InputStates` shows an enabled focus/hover target, read-only, disabled, and standalone invalid inputs with accessible names. E2E confirms read-only remains focusable and ignores keyboard edits, disabled is disabled, and invalid host attributes are present; real pointer hover must change the computed border color, and keyboard traversal must produce `:focus-visible` with a computed focus shadow before screenshots are captured. |
| Input types            | `InputTypes` shows representative text, email, search, and password native controls with labels. E2E checks their native types without applying specialized Kikita directives.                                                                                                                                                                                                                                                                |
| Field and Signal Forms | `InputValidation` shows a required email control inside `kui-field`. E2E asserts native required semantics and the untouched state, tabs away to trigger the real required error, then fills a valid address and asserts error/invalid/description cleanup. It checks `aria-describedby` against the exact rendered hint and error ids.                                                                                                       |
| Locales and responsive | The `input` scope provides English and Russian labels and a translated Signal Forms error. E2E switches with the shell's accessible language name and asserts the translated page heading, example group, native input name, and required error after keyboard blur. It checks page overflow at desktop, tablet, and 320px. Named group screenshots cover desktop and 320px; validation transitions have before/after captures.               |

The page is a fixed catalogue with all examples visible. The browser test creates the temporary
focus/hover states needed for deterministic screenshots. Theme mode comes from the Playground
shell. The visible composition stays focused on Input; exhaustive Field anatomy, provider examples,
affixes, and Group behavior remain owned by their sibling pages. The required-error schema resolves
its message from the lazily loaded `input` scope with a relative scoped `selectTranslate` key; using
an unscoped key rendered the key itself instead of either locale's message.

Verification run on 2026-09-27: the Angular CLI `kikita-ui-playground:build` target passed. The
Input-only Playwright spec passed 8/8 with `--update-snapshots` and 8/8 again without snapshot
updates. All 16 generated captures were opened and visually reviewed: six catalogue groups at
desktop and 320px, real hover and keyboard-focus states, and invalid/corrected validation states.
The suite also passed the 768px no-overflow assertion; tablet captures are not part of the named
reference set.

## Reasoned omissions

- The full size-by-every-state Cartesian matrix is omitted: size changes geometry and text scale,
  while invalid/disabled/read-only and pseudo-state styling apply independently. The catalogue shows
  each size and each meaningful state without duplicating every combination.
- Provider override controls are omitted. `provideKikitaUi({ defaults.size })` is app-wide and the
  replacement Playground intentionally has no root size override. The `lg` Field example shows
  Input's inherited size, while provider-specific Field options remain on the Field page. The Input
  unit test covers root-default and Field-before-root precedence, and this page's default visibly
  resolves to `md`.
- An exhaustive list of native input types is omitted because those browser-owned types do not add
  `kuiInput` API. Specialized Kikita controls and browser-specific date/time/file UI are covered by
  their own pages or remain native browser behavior.
- Input Group chrome, prefix/suffix/action combinations, and manual `.kui-input-group` wiring are
  omitted because they belong to Field and Group. The `kuiInput` page uses only a simple Field
  composition to establish its integration boundary.
- An explicit id inside `kui-field` is omitted because the Field's visible label currently targets
  its generated `controlId`; overriding the input id can leave that label disconnected. The explicit
  id behavior is instead shown on a standalone input with a matching native label.
- Native `required` constraints, native validation tooltip behavior, `name` submission, and every
  autocomplete/constraint attribute are omitted as native HTML or Signal Forms contracts, not
  directive variants. The Signal Forms scenario covers the meaningful required/error path.
- Design token override panels and independent density/theme controls are omitted: there is no
  Input-local density/theme API, and component visuals must continue to come from library tokens and
  the persistent shell.

## Self-review checklist

- [x] Read the public docs, public exports/types, directive and style source, tokens/defaults, unit tests, root app configuration, and existing consumers.
- [x] Mapped all three public inputs and their defaults/inheritance rules; confirmed there are no public outputs or models.
- [x] Mapped supported sizes, visual states, native state boundaries, Field/Signal Forms behavior, accessibility semantics, and SSR constraints.
- [x] Recorded docs/source discrepancies, test gaps, legacy fake-state behavior, and reasoned omissions.
- [x] Implemented a fixed visible catalogue for each supported Input input/default and meaningful state.
- [x] Kept the default Field example minimal and covered explicit `id` with a standalone input and matching native label; recorded the Field id precedence caveat.
- [x] Added an explicit Field-sized sample so inherited Input size is distinct from local Input size, and asserted its resolved `data-kui-size`.
- [x] Added an E2E check for the explicit id/label association and a post-hydration check that the default Field input id still matches its label's `for`.
- [x] Parent reviewed and approved the contract inventory before page implementation.
- [x] Input catalogue, English and Russian scope files, accessible interaction assertions, runtime Russian Signal Forms error check, locale checks, and named screenshot expectations are authored.
- [x] Parent integrated the Forms route and added `/components/input` to the shared SSR/adaptive component-page browser registry; Input's direct-route server-render/hydration and responsive checks pass.
- [x] Production Angular build passed; the focused Input Playwright suite passed 8/8 with snapshot update and 8/8 clean. All 16 named screenshots were visually inspected at desktop/320px, and the 768px overflow assertion passed.
- [x] Independent review of implementation, accessibility, and screenshot evidence is complete.

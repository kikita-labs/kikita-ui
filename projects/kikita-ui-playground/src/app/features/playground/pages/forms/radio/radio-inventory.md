# Radio Component Page Contract Inventory

## Sources

- Public usage and Signal Forms integration: [`docs/radio.md`](../../../../../../../../../docs/radio.md).
- Directive inputs, host bindings, size resolution, Field wiring, and Signal Forms behavior:
  [`kui-radio.directive.ts`](../../../../../../../../../projects/ui/src/lib/components/radio/kui-radio.directive.ts).
- Directive unit coverage: [`kui-radio.directive.spec.ts`](../../../../../../../../../projects/ui/src/lib/components/radio/kui-radio.directive.spec.ts).
- Hover, checked, active, focus-visible, invalid, disabled, and size treatments:
  [`selection.css`](../../../../../../../../../projects/ui/src/styles/selection.css).
- Field IDs, effective size, error state, and described-by wiring:
  [`kui-field.component.ts`](../../../../../../../../../projects/ui/src/lib/components/field/kui-field.component.ts)
  and [`kui-field.component.html`](../../../../../../../../../projects/ui/src/lib/components/field/kui-field.component.html).
- Shared root size defaults: [`docs/di-defaults.md`](../../../../../../../../../docs/di-defaults.md).
- Angular Signal Forms radio grouping: <https://angular.dev/essentials/signal-forms>.
- Playground app provider: [`app.config.ts`](../../../../../../../../../projects/kikita-ui-playground/src/app/app.config.ts). It sets styled scrollbars and no root size default.
- State catalogue: [`docs/state-coverage.md`](../../../../../../../../../docs/state-coverage.md).
- Shared SSR and responsive route checks:
  [`component-pages.spec.ts`](../../../../../../../../../projects/kikita-ui-playground/e2e/component-pages.spec.ts).

## Public contract map

| Public surface                   | Type and default or resolution                                                                                                                                                                                                                                                                                              | Page example and evidence                                                                                                                                                                                                                                                                                                           |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `size`                           | `KuiSize \| undefined`: `xs`, `sm`, `md`, `lg`. Local Radio size wins, then the containing Field's effective size, then root `provideKikitaUi({ defaults: { size } })`, then `md`. Field size itself resolves local Field size, `defaults.field.size`, root default, then `md`.                                             | The default omits Radio size and resolves to `md` in this app; the four-size matrix covers all local values. Separate Fields at `lg` show inheritance and local Radio `sm` precedence. The shared root provider has no size override, so another app-wide provider permutation is omitted.                                          |
| `invalid` (`invalidInput` alias) | Boolean input with `booleanAttribute`; default `false`. Standalone true emits `data-kui-invalid` and `aria-invalid="true"`. A regular Field error also invalidates its descendant radios. With Signal Forms `[formField]`, Radio follows the Field's touched-gated invalid state rather than the interop-written raw value. | Unmarked default, standalone invalid radios, a Field error, and a required Signal Forms Field before/after blur and correction. E2E checks `aria-invalid`, the described error, and error removal after selection.                                                                                                                  |
| `id`                             | `string \| undefined`; outside a Field, no ID is emitted unless supplied. Inside `kui-field`, the Field's generated `controlId` is used unless the Radio has an explicit ID.                                                                                                                                                | In the default group, the first Radio uses the generated Field ID and the remaining choices keep unique explicit IDs. E2E checks the generated pattern and an explicit ID. Every Signal Forms radio has a unique explicit ID because the choices share one Field.                                                                   |
| Native input state               | `name`, `value`, `checked`, `required`, and `disabled` remain native HTML radio properties, not Radio directive inputs or outputs. Native radio groups use a shared `name`; checked state and arrow-key selection remain browser-managed.                                                                                   | Native fieldsets and legends label groups; native labels name each option. Checked/unchecked, disabled/disabled-checked, and required states are shown. E2E verifies selection, disabled semantics, and arrow-key movement.                                                                                                         |
| Signal Forms                     | Radio declares no form model or output. Per the public docs, Angular Signal Forms `[formField]` belongs on each native radio. The required schema state and value are owned by the page's form model. Radios bound to the same field receive the same native `name` automatically.                                          | The payment example binds both choices to one Signal Forms field and required validator; it does not override the generated group name. E2E verifies both controls share the generated name and inherit required state. Blur exposes the touched error; selection clears it. Runtime RU validation uses the explicit `radio` scope. |
| Host and Field wiring            | Radio sets `class="kui-radio"`, `data-kui-size`, optional invalid marker and `aria-invalid`, Field-derived `id` when not overridden, and Field `aria-describedby`. It adds no custom role or keyboard behavior.                                                                                                             | Assertions cover resolved size, generated/explicit IDs, hint/error description, and invalid state. Native fieldset/legend and radio semantics remain in control.                                                                                                                                                                    |
| Models, outputs, and methods     | None are declared by `KuiRadioDirective`.                                                                                                                                                                                                                                                                                   | No Radio-specific model, output, or method examples are invented.                                                                                                                                                                                                                                                                   |

## Visible states and interactions

- A minimal default plan group omits the Radio size and invalid inputs, starts with one checked
  choice, uses native labels, and is nested in a Field with hint wiring.
- Every supported size has an explicit example. The Field inheritance pair compares an omitted
  Radio size against a local override inside separate `lg` Fields, so each Field owns one control.
- The states card shows checked and unchecked choices, disabled and disabled-checked choices,
  standalone invalid radios, a Field error state, and a Signal Forms required group.
- E2E produces arrow-key selection, focus-visible, hover, and pressed states through real browser
  input. It verifies Signal Forms generates one shared native group name and applies required state,
  then captures invalid/selected before-and-after states; no pseudo-state is drawn with page CSS.
- E2E switches the live scope to Russian and verifies translated labels and the updated Signal Forms
  error message. EN/RU keys match.
- Desktop screenshots cover the complete size card. At 320px, the E2E uses a 1280px-tall viewport,
  centers each target group, checks its full bounds and each Radio option's visibility/intersection,
  then captures explicit sizes and Field-size precedence separately. The explicit-size group adds
  token-based inline inset so its locator crop includes whitespace around the first and last controls.
  Signal Forms payment is captured through a page-owned wrapper around its `kui-field`, so the hint
  and full Field spacing remain visible. At widths below 32rem, the wrapper adds token-based inline
  padding around the full capture; semantic and validation assertions target the nested fieldset.
  Group bottom bounds allow at most one CSS pixel for fractional scroll rounding. The shared route
  suite covers SSR output, hydrated navigation, and no horizontal overflow at 320px, 768px, and 1440px.
- Accessibility evidence uses native `fieldset`/`legend`, option labels, native radio group behavior,
  Field hint/error descriptions, accessible names, and a real focus-visible state. A manual
  screen-reader, forced-colors, and contrast audit has not been run for this page.

## Omitted combinations and limitations

- Size-by-state cross-products are omitted because every size and every meaningful state appears
  separately; state screenshots use the default size.
- A disabled-invalid combination is omitted because a disabled option cannot be selected or
  corrected and does not communicate a useful validation state.
- Readonly and indeterminate are omitted because native radio controls do not support those states.
  The shipped selector also dims `input[readonly].kui-radio`, but the native control remains
  selectable; this page does not present that styling as read-only behavior.
- The root size-provider override is not changed for this route because the provider is shared app
  configuration. The default example documents the configured app's fallback to `md`.
- Signal Forms radios use unique explicit IDs. Leaving every radio ID unset inside one Field would
  reuse that Field's single `controlId` for each descendant, producing duplicate IDs; the first
  default radio demonstrates the generated-ID path in a group whose remaining IDs are explicit.

## Self-review checklist

- [x] The page has a minimal default and a fixed, labelled catalogue of supported Radio sizes,
      states, and native interactions.
- [x] Every directive input/default and meaningful behavior maps to a visible example or has a
      specific omission reason above; native HTML state is distinguished from directive API.
- [x] Native group/option semantics, Field descriptions, standalone and Field invalid state,
      generated/explicit IDs, and Signal Forms validation are covered by accessible locators.
- [x] Focus-visible, hover, pressed, arrow-key selection, blur validation, correction, runtime
      locale changes, and responsive widths are deterministic browser scenarios.
- [x] The 320px E2E uses a 1280px-tall viewport, checks the full bounds of each captured group and
      the visibility/intersection of every Radio option, then captures the explicit-size and
      Field-size precedence groups separately. The bottom bound allows at most one CSS pixel for
      fractional scroll rounding.
- [x] Scoped Prettier, EN/RU key parity (8/8), elevated ESLint for the Radio page and E2E spec,
      elevated Stylelint for both changed Radio stylesheets, `git diff --check`, and a fresh
      production/SSR build passed after the latest capture-wrapper adjustment. The repository
      static audit passed earlier; it was not rerun after the latest Radio changes.
- [x] Radio snapshot-update and clean Playwright suites both passed 9/9 against the latest build.
      All changed/new desktop and 320px captures were opened and visually inspected. The mobile
      Signal Forms wrapper frames the heading, both choices, and hint within the capture bounds.
- [ ] Parent's independent visual approval is pending.

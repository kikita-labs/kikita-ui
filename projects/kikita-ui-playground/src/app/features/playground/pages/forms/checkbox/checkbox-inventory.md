# Checkbox Inventory

## Contract sources

- Public usage and inputs: [`docs/checkbox.md`](../../../../../../../../../docs/checkbox.md).
- Directive inputs, size resolution, Field wiring, and Signal Forms invalid-state behavior:
  [`kui-checkbox.directive.ts`](../../../../../../../../../projects/ui/src/lib/components/checkbox/kui-checkbox.directive.ts).
- Native checkbox styling for checked, indeterminate, hover, pressed, focus-visible, invalid,
  disabled, and sizes: [`selection.css`](../../../../../../../../../projects/ui/src/styles/selection.css).
- Field id, label, hint/error ARIA, and size resolution:
  [`kui-field.component.ts`](../../../../../../../../../projects/ui/src/lib/components/field/kui-field.component.ts).
- Directive unit coverage: [`kui-checkbox.directive.spec.ts`](../../../../../../../../../projects/ui/src/lib/components/checkbox/kui-checkbox.directive.spec.ts).
- Route scope and runtime locale loader: [`forms.routes.ts`](../forms.routes.ts) and
  [`app.config.ts`](../../../../../../app/app.config.ts).

## Public contract map

| Contract                     | Resolution and behavior                                                                                                                                                                                                                                                                                                                        | Page coverage                                                                                                                                                                                      |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `size: KuiSize \| undefined` | Local checkbox size, then parent Field's effective size, then the root Kikita UI size default, then `md`; supported values are `xs`, `sm`, `md`, and `lg`.                                                                                                                                                                                     | Minimal default example asserts resolved `md`; the size catalogue shows and asserts all four explicit values. The app does not configure a root size override, so that provider branch is omitted. |
| `invalid: boolean`           | Boolean-attribute input, default false. Outside a Signal Forms field it combines the explicit input with the enclosing Field's invalid state. It sets `data-kui-invalid` and `aria-invalid`; when a Signal Forms field is present, the directive ignores the Signal Forms-clobbered input and follows the Field's touched-gated invalid state. | A Field error demonstrates automatic invalid and described-by wiring. A separate native-label example sets `invalid` directly outside a Field and asserts its explicit `id` and `aria-invalid`.    |
| `id: string \| undefined`    | Explicit id wins; otherwise an enclosing Field's generated control id is used; without either, no id is emitted.                                                                                                                                                                                                                               | The standalone invalid example asserts the explicit id. The default Field example asserts that Field supplies an id; Field's visible label supplies the accessible name.                           |
| Models, outputs, and methods | The directive declares none. Checked state, disabled state, requiredness, and indeterminate state remain native checkbox properties/attributes.                                                                                                                                                                                                | Real pointer and Space input toggle the native default checkbox. Checked, disabled, disabled+checked, and `indeterminate` are shown separately.                                                    |

## Covered states and behavior

- A minimally configured unchecked checkbox inside a labelled `kui-field`.
- All four sizes, with the resolved `data-kui-size` asserted for each; checked examples at `sm` and
  `md` show the native state alongside the size matrix.
- Checked, disabled, disabled+checked, Field-provided invalid/error, standalone explicit invalid,
  and native indeterminate states.
- A native `<label>` around the standalone invalid checkbox, avoiding a mismatch between an
  explicit control id and `kui-field`'s generated label target.
- A real `:focus-visible` state, verified on first route entry and after sidebar navigation;
  pointer hover and active/pressed captures use live mouse input.
- Native pointer and Space-key toggling of the default checkbox.
- Runtime English-to-Russian switching of the Checkbox page heading, state-group name, and
  standalone invalid label. All Checkbox strings use the route's Transloco scope and matching
  English/Russian catalogues.
- Desktop screenshots for the default, size, and state catalogues plus focused, hover, and pressed
  interaction states. The same three catalogue sections have dedicated 320px screenshots.
- Shared component-route E2E verifies server-rendered page headings, hydration, and no document
  horizontal overflow at 320px, tablet, and desktop widths.

## Omitted combinations and boundaries

- The full size-by-state cross-product is omitted because size and state visuals are independently
  visible; focus, hover, pressed, and error are not repeated at every size.
- Disabled+invalid is omitted because an unavailable control with a validation error is not a
  useful form state. Checked+indeterminate is omitted because the native mixed marker takes visual
  precedence and communicates the mixed state.
- `required` is a native HTML constraint, not a `KuiCheckboxDirective` input or custom visual
  state; a native required-group validation flow is outside this page's focused Checkbox catalogue.
- Signal Forms `[formField]` integration is documented, but this page isolates native checkbox
  toggling and Field ARIA wiring rather than adding a second form-model scenario. The directive has
  no Checkbox-specific model or output.
- There is no Checkbox `readonly` state: native checkbox inputs do not support read-only behavior,
  and a CSS appearance alone would not make one read-only.
- The page does not claim a screen-reader, forced-colors, or color-contrast audit; those require
  separate accessibility evidence.

## Self-review checklist

- [x] The page maps every public input and native state to an example or a specific omission.
- [x] Focus, hover, and pressed states are generated by real browser interaction, not page CSS.
- [x] Checkbox text and accessible names use the English/Russian route scope; runtime switching is
      asserted by the page E2E.
- [x] Desktop and 320px catalogue screenshot scenarios are defined with stable accessible names.
- [ ] The updated browser suite passes, new 320px snapshots are generated, and all new captures are
      visually reviewed.
- [ ] The parent independently verifies the refreshed page evidence and records the separate
      Checkbox commit.

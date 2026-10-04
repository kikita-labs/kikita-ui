# Field Inventory

## Contract sources

- Public usage and consumer boundaries: [`docs/field.md`](../../../../../../../../../docs/field.md).
- Field inputs, derived state, id wiring, affix detection, and click behavior:
  [`kui-field.component.ts`](../../../../../../../../../projects/ui/src/lib/components/field/kui-field.component.ts)
  and [`kui-field.component.html`](../../../../../../../../../projects/ui/src/lib/components/field/kui-field.component.html).
- Projected marker directives:
  [`kui-field-markers.directive.ts`](../../../../../../../../../projects/ui/src/lib/components/field/kui-field-markers.directive.ts).
- Affix kinds and accessible host behavior:
  [`kui-field-affix.directive.ts`](../../../../../../../../../projects/ui/src/lib/components/field/kui-field-affix.directive.ts).
- Input ARIA/size wiring:
  [`kui-input.directive.ts`](../../../../../../../../../projects/ui/src/lib/components/input/kui-input.directive.ts).
- Scoped field options and provider:
  [`kui-field-options.interface.ts`](../../../../../../../../../projects/ui/src/lib/tokens/kui-field-options.interface.ts).
- Field behavior coverage:
  [`kui-field.component.spec.ts`](../../../../../../../../../projects/ui/src/lib/components/field/kui-field.component.spec.ts)
  and [`kui-field-affix.directive.spec.ts`](../../../../../../../../../projects/ui/src/lib/components/field/kui-field-affix.directive.spec.ts).

## Inputs and defaults

| Public input           | Default and resolution                                                                                                                                                                                                                                | Example or omission                                                                          |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `label?: string`       | Omitted by default. When present, Field renders a native `<label>` associated with its generated control id.                                                                                                                                          | Default, anatomy, validation, and provider examples.                                         |
| `hint?: string`        | Omitted by default. When present, renders a paragraph and adds its generated id to the control's `aria-describedby`.                                                                                                                                  | Anatomy and affix examples.                                                                  |
| `error?: string`       | Omitted by default. A truthy explicit error takes precedence over the first message-bearing Signal Forms error; it marks the field invalid immediately.                                                                                               | Hidden-error and provider examples.                                                          |
| `hideErrors?: boolean` | Omitted means `false`; optional boolean-attribute coercion preserves omission for inheritance. Effective order is local input, `defaults.field`, then `false`.                                                                                        | Hidden error and provider examples; an explicit local `false` overrides the scoped provider. |
| `required?: boolean`   | Omitted means infer the required state from a projected Angular Signal Forms field, otherwise `false`. Optional boolean-attribute coercion preserves omission. An explicit `true` or `false` overrides inference. It controls the visual marker only. | Projected marker and required-marker-override examples.                                      |
| `size?: KuiSize`       | `xs`, `sm`, `md`, or `lg`; omitted resolves local field input, `defaults.field.size`, root KUI default size, then `md`.                                                                                                                               | Every size and scoped provider/local override are shown.                                     |

No Field outputs or models are declared. The separate `kuiFieldAffix` directive input `emphasis` accepts `default | strong`; its default is muted text. Its rendered kind is inferred from a `<button>` host (action), `kui-icon` or `kuiLoader` host (icon), or other host (text). All three looks are shown. The loader retains its own accessible status semantics.

## Derived state and accessibility

- `isRequired` shows an aria-hidden visual asterisk for explicit `required` or inferred Signal Forms required state. Field does not add the native `required` attribute to the projected control.
- Signal Forms errors are rendered only once the control is touched. The first error with a truthy `message` is used; an explicit truthy `error` wins. Untouched invalid state is not exposed by Field.
- An explicit error or projected `kuiError` marks the field invalid immediately. A touched invalid Signal Forms control marks it invalid. `hideErrors` hides auto, explicit, and projected error messages but does not clear invalid state.
- A visible error is rendered as `role="alert"`; `kuiInput` receives `aria-invalid` and the field's `aria-describedby` ids. Hints and visible errors are included; hidden projected errors are excluded. The label's `for` points to the generated control id.
- `kuiLabel`, `kuiHint`, and `kuiError` allow custom projected content. The projected label directive receives the generated control id. The page shows custom projected markers with a required marker.
- `kuiFieldAffix` makes Field render the control slot with input-group chrome. Clicking non-interactive affix/chrome delegates focus to the first enabled native control; interactive descendants such as its clear button retain their own behavior. The search example verifies prefix focus and keyboard activation of the clear button.
- Generated ids use a module-level incrementing counter. Examples and checks validate associations instead of relying on a fixed id value.
- The component exposes readonly `controlId`, `hintId`, and `errorId` values plus derived `displayedError`, `invalid`, `isRequired`, `effectiveSize`, `effectiveHideErrors`, `describedBy`, and `hasSignalFormField` signals. The page exercises these through rendered output and ARIA rather than displaying implementation state.
- Field also implements the host context used by select/date/time controls (`isSelected`, `select`, `close`, `shouldCloseOnSelect`, `registerSelectContext`, `setSelectDisabled`, `getDropdown`, `getCalendar`, and `getTimePickerPanel`). These are control-integration methods, not general Field inputs, so their behavior remains on the owning control pages. `selectValueTemplate` and `setSelectValueTemplate` are marked `@internal` and are not page content.

## Provider and configuration boundary

`kuiProvideFieldOptions({ size, hideErrors, clearable })` is static injected configuration. Field consumes `size` and `hideErrors`; `clearable` is consumed by field-control directives, not by `kui-field`. The scoped example shows size and hidden-error defaults, then local input overrides. The root KUI size default is part of Field's fallback chain but is omitted from this page because it would require app-wide configuration and alter every example. The provider's cross-control `clearable` option is omitted because it does not change Field itself.

`kuiInput` accepts its own `size` and `id` overrides. This page leaves those at their defaults so Field's id and size inheritance remain visible. If a consumer supplies a child-control `id`, the Field shorthand label still targets Field's generated id; that mismatch is an integration limitation outside this Field page's sample contract.

## Omitted API and combinations

- Deprecated `kuiFieldAffixIcon` and `kuiFieldAction` aliases are intentionally not used. Current content uses `kuiFieldAffix` auto-detection on icon, loader, button, and text hosts.
- Manual `.kui-input-group` + `KuiInputGroup` is omitted. It is a fallback for custom chrome that cannot use the supported affix hosts, not a Field input.
- Dropdown/select/calendar/time-picker host-context behavior is omitted because those integrations are owned by their controls and their component pages; this page does not claim Field has a general dropdown input API.
- The manually wired dropdown keyboard fallback is omitted: it is an integration path rather than Field form anatomy, and the source has no dedicated unit test establishing that interaction contract.
- Disabled, read-only, focused, hover, and pressed are states of projected controls, not Field inputs. The Field page does not fabricate those states. Focus is reached through a real affix click and the action uses a native button.
- Size-by-projection/provider/error cross-products are omitted because the page independently shows every supported size, projected content, validation behavior, and provider override without adding combinations that do not establish additional Field behavior.

## Page map

| Page section      | Coverage                                                                                                                                               |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Default           | Minimal labelled `kui-field` wrapping a native KUI input.                                                                                              |
| Anatomy           | Label and hint, hint-only field with an accessible control name, and a named control without visible Field content.                                    |
| Sizes             | `xs`, `sm`, `md`, and `lg`.                                                                                                                            |
| Validation        | Required Signal Forms field before and after touch, explicit hidden error retaining invalid state, and required marker explicitly overridden to false. |
| Projected content | `kuiLabel`, `kuiHint`, and `kuiError` with Field association and invalid semantics.                                                                    |
| Providers         | Static scoped size/hide-error defaults with local `size` and `hideErrors` overrides.                                                                   |
| Affixes           | Text prefix/suffix, leading icon, strong text, loader status, native action button, input-group focus delegation, and clear via Enter.                 |

The dedicated Field browser spec checks server output, accessible associations and validation, runtime English-to-Russian scope switching, real affix/button interaction, and page width at desktop, tablet, and 320px. Its accessible validation-group locator captures both untouched and touched-error states; its accessible affix-group locator captures the pre/post prefix-focus and keyboard-clear states. Catalogue screenshots are captured at desktop and 320px as required by the shared authoring checklist; the 768px tablet viewport has a separate page-overflow assertion and does not require a screenshot. The expected interaction snapshots are:

- `e2e/field-playground.visual.spec.ts-snapshots/field-validation-before-touch.png`
- `e2e/field-playground.visual.spec.ts-snapshots/field-validation-after-touch.png`
- `e2e/field-playground.visual.spec.ts-snapshots/field-affixes-before-prefix-click.png`
- `e2e/field-playground.visual.spec.ts-snapshots/field-affixes-after-prefix-click-focus.png`
- `e2e/field-playground.visual.spec.ts-snapshots/field-affixes-before-keyboard-clear.png`
- `e2e/field-playground.visual.spec.ts-snapshots/field-affixes-after-keyboard-clear.png`

Win32 baselines for these states and for each catalogue group at desktop and 320px are checked in beside the spec.

Verification note (2026-09-28): the full playground gate failed deterministically on `field-affixes-before-prefix-click` (17 px, search prefix only) because the `search` icon resolves asynchronously from the jsDelivr `lucide-static@1` CDN and the capture raced that fetch, rendering an empty prefix. No library or page rendering change was involved. The spec now fulfils that CDN request with the verbatim `lucide-static@1` search SVG and waits for the rendered `kui-icon svg` in the affix group before the affix and catalogue captures. Existing desktop and 320px baselines were visually re-checked and left unchanged. The whole Field spec passed 8/8, then 24/24 with `--repeat-each=3 --workers=1`, and the affix test passed 3/3 in serial repeats. These are focused page checks, including its server-render and hydration assertions; the coordinator's final shared build/SSR/browser/adaptive integration run remains pending.

## Self-review checklist

- [x] The Field page folder exposes `Field` from `index.ts`, matching the route's `./field` import.
- [x] The component barrel exports each page-private example once.
- [x] The page has a minimal Field default and decomposed examples for anatomy, sizes, validation, projected content, providers, and affixes.
- [x] Labels, hints, errors, size/provider defaults, and consumer interactions are mapped to actual public behavior.
- [x] Route, locale scope, and shared SSR registry are present; local implementation inventory and E2E assertions are authored.
- [x] E2E asserts before/after screenshots for touched validation, prefix click-to-focus, and keyboard clear using labelled accessible group locators.
- [x] Focused Field browser checks passed 8/8 and 24/24 repeated, including server-rendered markup, hydration-time ARIA wiring, validation, EN/RU scope behavior, affix focus/clear interactions, and page overflow checks at 1440px, 768px, and 320px.
- [x] Desktop and 320px baselines for all seven catalogue groups and six interaction states are checked in and were visually re-checked; tablet responsive coverage is the separate 768px overflow assertion above.
- [ ] The coordinator's final shared build/SSR/browser/adaptive integration run after the latest fixes is pending; record its command, date, revision, and result when complete.
- [ ] Independent post-implementation review is pending; record the reviewer and reviewed revision after code, API fidelity, translations, accessibility, SSR, and screenshot evidence are checked.
- [x] The page implementation has a page-scoped commit (`1d051c4`), followed by the Field-only capture stabilization and evidence commit (`1374f04`).

Assistive-technology note: no external screen-reader or assistive-technology review has been performed; the browser assertions above do not establish AT verification.

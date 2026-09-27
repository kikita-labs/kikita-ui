# Segmented inventory

**Status:** the `/components/segmented` route and Forms sidebar item are present. The focused SSR
Playground build passed, and the Segmented Playwright suite passed 9/9 both during snapshot update
and in a clean no-update rerun. The update created the two missing validation baselines and refreshed
the other 11 screenshots; all 13 captures were visually reviewed. Repository static audit, scoped
formatting/catalogue checks, and staged/unstaged `git diff --check` passed. The examples compose
shipped components and styles without adding or overriding Segmented visuals.

## Minimal useful default

The public `value` model and each segment's `value` input both default to `''`. With ordinary
non-empty segment identifiers, an unconfigured group has no checked item, no visible thumb, and no
radio with `tabindex="0"`. Use one explicit initial value for the default example so it is
operable and communicates the normal selected state:

```html
<kui-segmented [(value)]="view" aria-label="View mode">
  <button kuiSegment value="list">List</button>
  <button kuiSegment value="grid">Grid</button>
  <button kuiSegment value="calendar">Calendar</button>
</kui-segmented>
```

Omit `size` to show the default `md` behavior. The live value label should reflect pointer and
keyboard changes. Give every segment a distinct, non-empty string ID: the implementation does not
validate missing or duplicate IDs, and matching empty IDs can mark multiple buttons checked.

## Public contract coverage

| Public surface                                | Type, default, coercion, and behavior                                                                                                                                                                                                                                                                                                                                                                                                                                     | Page example or omission                                                                                                                                                                                                                                                                                                                                                                 |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `KuiSegmentedComponent.value` / `valueChange` | `model<string>('')`; no transform. Angular creates `valueChange` for the model input. Selection writes the chosen string. This is the current two-way binding and Signal Forms value.                                                                                                                                                                                                                                                                                     | Default card starts at `list`, shows the changing string, and verifies click and keyboard selection. The unconfigured empty state is documented above rather than used as the main example because it has no tabbable radio.                                                                                                                                                             |
| Deprecated `selected` / `selectedChange`      | `model<string>('')`; two-way sync with `value`; JSDoc and component docs deprecate it in favor of `value`, with removal planned for the next major.                                                                                                                                                                                                                                                                                                                       | Omitted from the page; all current bindings use `value`.                                                                                                                                                                                                                                                                                                                                 |
| `size`                                        | `input<KuiSize \| undefined>()`, where `KuiSize` is `xs \| sm \| md \| lg`; no transform. An explicit size wins, then `provideKikitaUi({ defaults: { size } })`, then `md`.                                                                                                                                                                                                                                                                                               | Size card shows all four values with the same selected value and short labels. The page app currently supplies no root size default, so an omitted size resolves to `md`.                                                                                                                                                                                                                |
| Group `disabled`                              | Boolean input default `false`, transformed by Angular `booleanAttribute`. Signal Forms may set it. Every segment becomes disabled; group has `aria-disabled="true"`, and child buttons receive native `disabled`, `aria-disabled`, and `tabindex="-1"`.                                                                                                                                                                                                                   | Show a disabled group and a separate group with one disabled option. Keep the selected option enabled in the latter. A selected disabled option has no thumb because thumb positioning filters disabled segments.                                                                                                                                                                        |
| `invalid`                                     | Boolean input default `false`, transformed by `booleanAttribute`; Signal Forms may set it. It only adds `aria-invalid="true"` to the group.                                                                                                                                                                                                                                                                                                                               | Include the Signal Forms validation example and assert the attribute. Do not imply that the Segmented CSS draws invalid chrome: it has no invalid selector.                                                                                                                                                                                                                              |
| `errors`                                      | `readonly WithOptionalFieldTree<ValidationError>[]`, default `[]`; delivered through the `FormValueControl` contract. The component does not read/render this signal.                                                                                                                                                                                                                                                                                                     | The Signal Forms example lets `kui-field` render the form error. The message is not linked to the group through `aria-describedby` by current component code.                                                                                                                                                                                                                            |
| `touched`                                     | Boolean input default `false`, transformed by `booleanAttribute`; delivered through Signal Forms but not read by the component template or styles.                                                                                                                                                                                                                                                                                                                        | Map to the Signal Forms lifecycle assertions; omit a Segmented-specific touched visual because none exists. The field wrapper may gate its own error text based on touched state.                                                                                                                                                                                                        |
| `touch` output                                | `output<void>()`; emitted from `select()` after an enabled selection, including clicking the current item. Arrow/Home/End handling calls `select()`. A disabled attempt returns without emitting. Focus or blur alone does not emit.                                                                                                                                                                                                                                      | Both live groups show touch counts. E2E checks the count after pointer selection, keyboard navigation, native activation, and selecting the already selected invalid item.                                                                                                                                                                                                               |
| `[kuiSegment]` `value`                        | `input<string>('')`; no transform. It identifies a child and is documented as unique within its group. There is no runtime uniqueness/required-value validation.                                                                                                                                                                                                                                                                                                          | Every sample uses explicit unique strings. No missing-ID or duplicate-ID example because the output is ambiguous and the source does not define recovery behavior.                                                                                                                                                                                                                       |
| Projected content                             | `<ng-content select="[kuiSegment]" />`; there is no other projection slot or fallback content.                                                                                                                                                                                                                                                                                                                                                                            | Every group projects native buttons carrying `[kuiSegment]`. No other content slot exists to demonstrate.                                                                                                                                                                                                                                                                                |
| `[kuiSegment]` `disabled`                     | Boolean input default `false`, transformed by `booleanAttribute`. A disabled segment has a native disabled attribute, `aria-disabled="true"`, `tabindex="-1"`, disabled styling, and ignores selection.                                                                                                                                                                                                                                                                   | Show one disabled unselected option beside a selected enabled option. Cover group-wide disable separately.                                                                                                                                                                                                                                                                               |
| Native accessible-name attributes             | The host is `role="radiogroup"`; it accepts consumer-supplied native `aria-label` / `aria-labelledby`, but defines no name input or host ID. Each child is a button with `role="radio"`, `aria-checked`, and roving tabindex.                                                                                                                                                                                                                                             | Put `aria-label` on each standalone group. Do not treat `<kui-field label="View">` as the radiogroup's accessible name; see the discrepancy below.                                                                                                                                                                                                                                       |
| Signal Forms `[formField]`                    | `FormValueControl<string>` provides required `value` plus `FormUiControl` inputs `errors`, `disabled`, `invalid`, and `touched`, and the `touch` output. Angular binds those members when `[formField]` is placed on `<kui-segmented>`, not on a projected button. The component does not implement optional `disabledReasons`, `readonly`, `hidden`, `pending`, `dirty`, `name`, `required`, `min`, `minLength`, `max`, `maxLength`, `pattern`, `focus()`, or `reset()`. | The form example demonstrates value sync, invalid/error visibility after touch, and correction. It does not demonstrate a field-driven disabled transition; the separate disabled card covers the same public `disabled` input directly. `aria-label` is set on the group, and the visible `kui-field` label is not treated as its automatic name. Unsupported form members are omitted. |

The generated model outputs follow Angular's model-input contract: `value` produces `valueChange` and
`selected` produces `selectedChange`. The only declared explicit output is `touch`.

## CSS and theme baseline

The shipped stylesheet is imported through `kikita-ui.css`; it owns the full component appearance.
The documented custom properties are `--kui-seg-bg`, `--kui-seg-border`, `--kui-seg-radius`,
`--kui-seg-padding`, `--kui-seg-gap`, `--kui-seg-height`, `--kui-seg-px`,
`--kui-seg-item-radius`, `--kui-seg-item-gap`, `--kui-seg-item-bg-active`, `--kui-seg-fg`,
`--kui-seg-fg-hover`, `--kui-seg-fg-active`, `--kui-seg-font-size`, `--kui-seg-font-weight`,
and `--kui-seg-font-weight-active`. They cover the group frame and spacing, segment spacing and
shape, selected fill, text colors, and font metrics. The theme generator supplies semantic surface,
border, radius, primary-fill, and button-size defaults; the size attribute adjusts segment height
and horizontal padding. The library CSS provides hover for unselected segments, a focus-visible
ring, selected text styling, and disabled opacity. It has no invalid or explicit active-state rule.
These tokens are audit evidence, not a request for page-level overrides.

## Implemented page anatomy and meaningful states

The page has one heading and four example cards, with no introductory paragraph:

1. **Selection and touch:** current `value` two-way binding, live value and touch count, three
   unique non-empty segment values, and a default selected enabled segment.
2. **Control sizes:** one selected enabled segment in each of `xs`, `sm`, `md`, and `lg`.
3. **Disabled states:** one disabled child beside a selected enabled child, and a separately
   disabled group whose selected child is also disabled.
4. **Signal Forms validation:** `[formField]` on the group; the enabled `grid` value begins invalid
   under the example schema and is corrected by selecting `List`. The example labels the group with
   an explicit `aria-label` as well as displaying the `kui-field` label.

The default card is used for actual pointer hover and keyboard focus-visible/selection captures. No
page CSS imitates component states. The library has no explicit active-state rule, so no distinct
active visual is promised.

Keep the sample labels short enough to fit at 320px in both translations. Do not add readonly,
required, loading, icon-only, vertical, or wrapping variants: there is no corresponding Segmented
input or documented behavior. Avoid cross-producting all four sizes with all states; show sizes
independently and show interactive/validation states at the default size. Do not claim RTL behavior;
the app's English/Russian locale setup does not switch direction, and the component has no
direction-aware arrow logic.

## Responsive, locale, interaction, and SSR coverage

- The E2E spec captures each English example card at desktop `1440×1000` and `320×844`, checks
  catalogue overflow at desktop, tablet `768×1024`, and `320×844`, and verifies all Russian option
  names after switching locale. It also checks the translated invalid state and overflow at
  `768×1024` and `320×844` in Russian. It does not claim RTL coverage.
- The spec asserts named `radiogroup`/`radio` roles, enabled selected items and roving tabindex,
  native disabled attributes, and `aria-invalid` on the form group. It tests the four arrow keys on
  enabled options, Home/End, and native Enter/Space. It verifies that Tab focus alone leaves the
  selected value unchanged and that keyboard selection moves the roving `tabindex`. Disabled-item
  arrow navigation is deliberately not asserted because source behavior and directive
  documentation disagree below.
- It captures actual pointer `:hover` and keyboard `:focus-visible`, then verifies selection and
  touch count from keyboard input. It does not synthesize a pointer-down state.
- Signal Forms checks the selected enabled `grid` value while invalid, the visible error after a
  selection/touch, and correction by selecting `List`. It does not exercise `disabled` propagated
  by a field; direct disabled examples verify the same input's group-wide behavior. The group
  receives its accessible name from explicit `aria-label`; the page does not claim that `kui-field`
  associates its label or message.
- The SSR test requests `/components/segmented` with JavaScript disabled and asserts a successful
  response plus server-rendered named radiogroup, checked radio, and roving tabindex. After
  hydration it checks selected semantics and collects page/console errors. The test does not assert
  thumb geometry or a server-rendered `data-kui-size` attribute.

## Source discrepancies and design-provenance limits

- **Accessible label association:** the component host provides `role="radiogroup"` but does not
  connect a `kui-field` label, hint, or error to the group. `kui-field` renders a `<label for>`
  pointing to its generated `controlId`; Segmented neither receives that ID nor exposes
  `aria-labelledby`/`aria-describedby`. Its docs example also puts a separate `aria-label` on the
  group. Every standalone example therefore needs its own accessible name, and the page should
  call out the visible-label mismatch instead of claiming the field label labels the group.
- **Disabled keyboard navigation contradicts the directive documentation:** `KuiSegmentDirective`
  says disabled items are skipped, but the component's Arrow/Home/End handlers navigate the
  unfiltered content query.
  Focusing a disabled native button has no effect and its `select()` returns early. The page and E2E
  test avoid the disabled-item arrow case and do not claim it skips disabled items.
- **Keyboard documentation now lists all supported key families:** Left/Right, Up/Down, Home, End,
  Enter, and Space. The disabled-item navigation mismatch remains unresolved as described above.
- **Form-state rendering is partial:** `disabled`, `invalid`, `errors`, and `touched` are accepted as
  `FormValueControl` members; only `disabled` and `invalid` affect host attributes. The component
  does not render `errors` or `touched`, and no Segmented style responds to invalid state. It does
  not forward field description IDs. Optional Angular form members not implemented here are
  `disabledReasons`, `readonly`, `hidden`, `pending`, `dirty`, `name`, `required`, `min`,
  `minLength`, `max`, `maxLength`, `pattern`, `focus()`, and `reset()`; do not claim their behavior.
- **No selected default is inferred:** when `value` is unset or does not match an enabled child,
  the thumb is hidden and no radio is tabbable. `positionThumb()` explicitly filters disabled
  children, so a programmatically selected disabled item also has no thumb. Keep the normal examples
  on a matching enabled value.
- **Theme-token mismatch:** docs/CSS cover the `--kui-seg-*` variables, but the theme generator
  also emits `--kui-seg-item-shadow-active` and the component stylesheet does not consume it. Do not
  build an example around that unused variable.
- **Motion provenance:** the shipped thumb animates `transform` and `width` for 220ms and suppresses
  the first-render transition; the stylesheet has no `prefers-reduced-motion` override.
- **Design provenance:** `docs/design-provenance.md` has no Segmented design record, and no
  Segmented-specific approval/spec was found in the tracked design brief/spec files. Treat the
  current `docs/segmented.md`, library CSS, theme variables, and tests as the reproducible baseline
  only. The legacy Playground's fake hover/focus CSS is not approval evidence. Page work may compose
  the existing component without changing its visual treatment; any new or changed component
  appearance needs an approved design record first.
- **Verification passed:** the focused SSR Playground build completed. The Segmented-only Playwright
  suite passed 9/9 during both snapshot update and clean no-update runs, including SSR/hydration,
  keyboard and pointer behavior, Signal Forms validation, Russian locale, and overflow at desktop,
  tablet, and 320px. The update generated all 13 expected baselines, and each was visually reviewed.

## Sources reviewed

- [Segmented component docs](../../../../../../../../../docs/segmented.md), [design provenance](../../../../../../../../../docs/design-provenance.md), [design brief](../../../../../../../../../docs/design-brief.md), [design-system spec](../../../../../../../../../docs/design-system-spec.md), [state coverage](../../../../../../../../../docs/state-coverage.md), [accessibility guidance](../../../../../../../../../docs/accessibility.md), and [changelog](../../../../../../../../../CHANGELOG.md).
- [Public API barrel](../../../../../../../../ui/src/public-api.ts), [component barrel](../../../../../../../../ui/src/lib/components/index.ts), [Segmented barrel](../../../../../../../../ui/src/lib/components/segmented/index.ts), [common size type](../../../../../../../../ui/src/lib/types/kui-size.type.ts), [type barrel](../../../../../../../../ui/src/lib/types/index.ts), [component](../../../../../../../../ui/src/lib/components/segmented/kui-segmented.component.ts), [segment directive](../../../../../../../../ui/src/lib/components/segmented/kui-segment.directive.ts), [internal context](../../../../../../../../ui/src/lib/components/segmented/kui-segmented-context.token.ts), and [unit spec](../../../../../../../../ui/src/lib/components/segmented/kui-segmented.component.spec.ts).
- [Segmented styles](../../../../../../../../ui/src/styles/segmented.css), [stylesheet entry point](../../../../../../../../ui/src/styles/kikita-ui.css), [theme defaults](../../../../../../../../ui/src/lib/theme/create-kui-theme.ts), [root size resolver](../../../../../../../../ui/src/lib/utils/kui-defaults.util.ts), [Kikita UI defaults](../../../../../../../../ui/src/lib/providers/kikita-ui-options.interface.ts), and [provider](../../../../../../../../ui/src/lib/providers/provide-kikita-ui.ts).
- [Field implementation](../../../../../../../../ui/src/lib/components/field/kui-field.component.ts) and [field template](../../../../../../../../ui/src/lib/components/field/kui-field.component.html) establish the label/error association caveat. Real consumers are the legacy [Segmented Playground page](../../../../../../../../playground/src/app/pages/segmented/segmented.page.html) and the [Time Picker's AM/PM control](../../../../../../../../ui/src/lib/components/time-picker/kui-time-picker-panel.component.ts); the legacy app also has [theme-toggle consumers](../../../../../../../../playground/src/app/app.html).
- Current app wiring reviewed: [Playground routes](../forms.routes.ts), [route enum](../../../../../enums/playground-route.enum.ts), [sidebar registry](../../../../../features/playground-shell/components/component-sidebar/constants/component-groups.const.ts), [app config](../../../../../app.config.ts), and existing [Textarea visual spec](../../../../../../../e2e/textarea-playground.visual.spec.ts) / [SSR-hydration spec](../../../../../../../e2e/ssr-hydration.spec.ts) as patterns only.
- Page and locale rules: [component-page authoring](../../../../../../../.agents/component-page-authoring.md), [component-page rollout](../../../../../../../.agents/component-page-rollout.md), and [locale JSON architecture](../../../../../../../.agents/i18n-json-architecture.md).
- Angular primary references: [model inputs and implicit `Change` outputs](https://angular.dev/guide/components/inputs#implicit-change-events), [`afterEveryRender`](https://angular.dev/api/core/afterEveryRender), and [`FormValueControl`](https://angular.dev/api/forms/signals/FormValueControl). The Angular MCP project discovery reported version 22. `get_best_practices` and `search_documentation` returned `Unexpected response type`; the documented `instructions://best-practices` resource was read as fallback.

## Self-review checklist

- [x] Covered both exported component/directive surfaces and identified the context token as internal.
- [x] Mapped all current inputs, implicit model outputs, explicit output, defaults, and boolean coercion.
- [x] Mapped every implemented and omitted optional Signal Forms member; distinguished direct disabled
      coverage from field-driven disabled propagation, and recorded the label/description gaps.
- [x] Recorded keyboard, pointer, selected/unselected, per-segment disabled, group-disabled, invalid, and size behavior with source discrepancies separated from settled contract.
- [x] Captured English desktop/320px screenshots, English and Russian responsive overflow,
      runtime Russian-name coverage, and SSR/hydration; all 13 refreshed screenshots were reviewed.
- [x] Recorded current route/sidebar state, generated the validation-state screenshots, and retained
      the missing approved design-provenance evidence.
- [x] Page, matching EN/RU catalogs, E2E spec, and its snapshots are within the assigned scope; no
      routes, registries, shared pages, or library component source were changed. No files have been
      staged or committed yet.
- [x] Current scoped Prettier, EN/RU leaf-key parity (23 keys), 23 unique template/component
      translation keys (including scoped `forms.invalidMessage`), and `git diff --check` passed.
      Playwright `--list` passed in the earlier implementation pass.
- [x] Focused SSR build and Playwright snapshot-update/clean rerun both passed; browser, responsive,
      SSR/hydration, and all 13 screenshot visual checks are complete.

# Loader Contract Inventory

This inventory maps the public Loader contract to this page's examples. The directive always
renders an indeterminate spinner while its host exists; the consumer owns when the host is added
or removed.

## Public inputs and resolution

| Input   | Type, default, and resolution                                                                                                                          | Behavior and page coverage                                                                                                                                                                               |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `size`  | `KuiSize \| undefined`, where `KuiSize` is `xs \| sm \| md \| lg`. Effective value is local `size ?? provideKikitaUi({ defaults: { size } }) ?? 'md'`. | Writes `data-kui-size`. The page's minimal example omits it and resolves to `md`; the size catalogue shows all four values. The Playground app has no root size default.                                 |
| `label` | `string`, default `'Loading'`.                                                                                                                         | Binds to the host's `aria-label`; it does not render visible text. The default example omits it. Explicit locale-backed names appear in the size, button, field-affix, and consumer-controlled examples. |

Neither input has a coercion transform or runtime validation. A checked template constrains `size`
to `KuiSize`; untyped JavaScript can still supply an unsupported value, which wins the nullish
fallback but has no size-specific CSS selector. An explicit empty `label` remains an empty
accessible name. The page omits malformed size and empty-label values because neither is a
supported, useful configuration.

There are no outputs, models, or component-owned loading/complete states. The two inputs are
signals, so consumer changes update their host attributes. A parent decides whether the Loader
host exists.

## Semantics, appearance, and meaningful states

- Every host receives class `kui-loader`, `role="status"`, `aria-live="polite"`, an effective
  `data-kui-size`, and the input's `aria-label`. It is not focusable and has no keyboard handlers.
  Its label is the only text alternative for the CSS-drawn spinner.
- The spinner is an inline-block circular border with a highlighted start segment. Base / `md`
  dimensions are 20px with a 2px border; `xs` is 14px; `sm` is 16px; `lg` is 28px with a 3px
  border. Animation spins continuously at 800ms. Under `prefers-reduced-motion: reduce`, the
  duration becomes 1600ms and the animation still runs.
- Track, fill, size, border width, and duration are public CSS-variable hooks. They are theming
  hooks rather than inputs; this page does not create a token editor or change Loader styling.
- A Loader on a `<button kuiButton disabled>` is the documented saving composition. Disabled
  behavior belongs to the native button; Loader itself has no disabled state.
- A `<span kuiLoader kuiFieldAffix>` is detected as an icon-style field affix. `kuiFieldAffix`
  preserves Loader's status role and live region and does not set `aria-hidden` on it.
- No hover, focus, pressed, selection, validation, or pause state belongs to Loader. Static
  examples therefore do not simulate those states.

The default Loader accessible name is hard-coded English `Loading` in the library. The minimal
default keeps that public default visible in the accessibility tree even on the Russian page;
other explicit labels follow the active Playground locale. The exact initial-announcement behavior
of a statically rendered status across assistive technologies is not established by source tests.

## Page example map

| Example                    | Contract coverage                                                                                                                                                                                                                                                                                                                          |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Default                    | Minimal `<span kuiLoader>`: no local inputs, effective `md`, and library default accessible name.                                                                                                                                                                                                                                          |
| Sizes                      | Complete `xs`, `sm`, `md`, `lg` domain with localized size labels and accessible names. The label × size cross-product is omitted because labels do not change appearance.                                                                                                                                                                 |
| Compositions               | Documented disabled saving button and read-only API-token field with `kuiFieldAffix` Loader. Explicit status labels are translated. Button-size × Loader-size cross-products are omitted because button size is not a Loader input.                                                                                                        |
| Consumer-controlled status | Native “Start check” / “Complete check” buttons add and remove a Loader host through a signal. This is consumer-owned lifecycle behavior, not a Loader input or output. The E2E records the idle, active, and completed states at desktop, plus idle and active at 320px. The page makes no claim about screen-reader announcement timing. |

All examples remain visible in the normal page flow. Page styles arrange spacing and grids with
Kikita tokens; the library owns Loader color, dimensions, and motion.

## Source audit

- [Loader docs](../../../../../../../../../docs/loader.md) document the selector usage, `size`
  values, `label` default, live semantics, and CSS variables. They omit the `md` fallback and
  root-size precedence described by implementation and [DI defaults](../../../../../../../../../docs/di-defaults.md).
- [Directive source](../../../../../../../../../projects/ui/src/lib/components/loader/kui-loader.ts),
  [shared size type](../../../../../../../../../projects/ui/src/lib/types/kui-size.type.ts),
  [root default helper](../../../../../../../../../projects/ui/src/lib/providers/kui-defaults.util.ts),
  [root options](../../../../../../../../../projects/ui/src/lib/providers/kikita-ui-options.interface.ts),
  and [Playground config](../../../../../../../../../projects/kikita-ui-playground/src/app/app.config.ts)
  establish the public inputs, defaults, and effective size used by this app.
- [Loader CSS](../../../../../../../../../projects/ui/src/lib/components/loader/kui-loader.css) establishes the
  rendered sizes, animation, reduced-motion behavior, and variables; [theme defaults](../../../../../../../../../projects/ui/src/lib/theme/create-kui-theme.ts)
  provides the base Loader values.
- The [Loader unit spec](../../../../../../../../../projects/ui/src/lib/components/loader/kui-loader.spec.ts)
  checks explicit `lg`, label, role, and live semantics. The [root-default integration spec](../../../../../../../../../projects/ui/src/lib/providers/kikita-ui-defaults.integration.spec.ts)
  checks a bare Loader resolves a configured `sm` default. The [field-affix spec](../../../../../../../../../projects/ui/src/lib/components/field/kui-field-affix.spec.ts)
  checks that field-affix detection preserves the Loader status and does not hide it.
- The legacy Loader page (removed legacy file `playground/src/app/pages/loader/loader.page.html`)
  shows sizes and button compositions, but belongs to the older `projects/playground` app. The
  replacement Playground's current generic [component-page spec](../../../../../../../../../projects/kikita-ui-playground/e2e/component-pages.spec.ts)
  does not include Loader. Its Feedback catalog and [route fragment](../../../../../../../../../projects/kikita-ui-playground/src/app/features/playground/pages/feedback/feedback.routes.ts)
  both include Loader, and the lazy route provides the `loader` Transloco scope.

## Self-review checklist

- [x] Both public inputs, their types, defaults, fallback, coercion behavior, and edge cases are accounted for.
- [x] No outputs, models, or Loader-owned interaction states are presented.
- [x] The page includes a minimally configured default, all supported sizes, and documented compositions.
- [x] Consumer-owned host insertion/removal is labelled as a consumer scenario.
- [x] Focus, keyboard, status semantics, reduced motion, CSS hooks, and the fixed English default label are recorded accurately.
- [x] EN/RU scope files have matching structure; explicit page strings and labels use Transloco.
- [x] The Playwright spec declares accessible, keyboard, responsive, SSR/hydration, locale, and screenshot coverage.
- [x] The `/components/loader` Feedback route and `loader` scope provider are integrated.
- [ ] Parent must run the browser suite, generate and inspect screenshots at desktop/tablet/320px, and complete SSR verification. No tests or snapshots were run/generated in this task.
- [ ] No assistive-technology review was performed; initial live-region announcement timing remains unverified.

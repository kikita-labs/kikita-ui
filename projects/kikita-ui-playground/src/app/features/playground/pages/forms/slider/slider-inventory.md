# Slider Inventory

## Contract Map

The page uses the public `KuiSliderDirective` export on native `input[type=range]` controls. Its
generated visuals remain library-owned. Page-local `__control-row` wrappers reserve a 44px minimum
layout row so examples align consistently; they do not enlarge the native Slider hit area or alter
the component.

| Public contract                          | Type and default or resolution                                                                                                                                                                                                                                                                                                                                                                                                              | Page mapping                                                                                                                                                                                                                                                                                                                           |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `color`                                  | `KuiSliderColor`: `primary`, `success`, `danger`, or `neutral`; defaults to `primary`.                                                                                                                                                                                                                                                                                                                                                      | The variants card renders all four colors at every supported size.                                                                                                                                                                                                                                                                     |
| `size`                                   | `KuiSliderSize \| undefined`: `sm`, `md`, or `lg`; local value wins, then a supported root `provideKikitaUi({ defaults: { size } })`, then `md`. The Playground calls `provideKikitaUi({ scrollbars: 'styled' })` without a size default, so the minimal instance is `md`.                                                                                                                                                                  | The variants card renders all three sizes across all four colors. The default card omits `size`.                                                                                                                                                                                                                                       |
| `minLabel`                               | `string`, default `''`; rendered below the minimum side when either endpoint label is present.                                                                                                                                                                                                                                                                                                                                              | The endpoint-label example displays `0` and `100`; the zero-maximum example displays `-100` and `0`.                                                                                                                                                                                                                                   |
| `maxLabel`                               | `string`, default `''`; rendered below the maximum side when either endpoint label is present.                                                                                                                                                                                                                                                                                                                                              | The endpoint-label example displays `0` and `100`; the zero-maximum example displays `-100` and `0`.                                                                                                                                                                                                                                   |
| `disabled`                               | Boolean input transformed by `booleanAttribute`, default `false`. The directive reflects it to the native input and mirrors it to the generated wrapper. Signal Forms also writes its reactive disabled state to this matching input.                                                                                                                                                                                                       | A static native `disabled` attribute demonstrates the disabled state. Library unit tests separately cover dynamic standalone input and Signal Forms true/false transitions on the native input and wrapper.                                                                                                                            |
| `invalid` (`invalidInput` in TypeScript) | Boolean input aliased to `invalid`, transformed by `booleanAttribute`, default `false`. Outside Signal Forms, explicit invalid and Field invalid are combined. With Signal Forms, the Field's touched-gated invalid state is authoritative.                                                                                                                                                                                                 | A standalone explicit-invalid input and an invalid `kui-field` example show both public paths.                                                                                                                                                                                                                                         |
| `id`                                     | `string \| undefined`, default unset; an explicit id wins, otherwise the containing `kui-field` control id is used.                                                                                                                                                                                                                                                                                                                         | The explicit-id case stays standalone and pairs a native `<label for>` with the id. It is not combined with `kui-field`, whose label continues to target its own control id.                                                                                                                                                           |
| Native range attributes                  | With omitted attributes, the browser's effective range is `min=0`, `max=100`, `step=1`, and midpoint `value=50`; the `min`/`max` IDL properties remain empty because those content attributes are absent. Fill resolution applies those native defaults only to empty/invalid bounds, preserving an explicit `max=0`. Signal Forms constraints belong in `min(...)`/`max(...)` schema validators rather than native `min`/`max` attributes. | SSR asserts the default omits all range attributes; hydrated E2E verifies ArrowRight, Home, and End produce `51`, `0`, and `100`. A visible `min=-100`, `max=0`, `value=0` example asserts a full fill. The Signal Forms keyboard check verifies native stepping from `60` to `61`, with schema bounds and no native range attributes. |
| Field integration                        | The directive inherits `kui-field` id, `aria-describedby`, `aria-invalid`, and visual invalid state. A visible Field label provides the native control name.                                                                                                                                                                                                                                                                                | The default example has only a label, so it has no `aria-describedby`; the Signal Forms hint and Field error examples verify live hint/error references.                                                                                                                                                                               |
| Outputs and models                       | None; the directive exposes no `model()` or `output()`.                                                                                                                                                                                                                                                                                                                                                                                     | Omitted because there are no additional public bindings to demonstrate. Native input and Signal Forms own value changes.                                                                                                                                                                                                               |

## Covered States And Interactions

- The default example is first, omits every Slider input, and uses a visible Field label. It has no
  hint or error, so the native range has no `aria-describedby`. The app's root provider has no size
  default, so it resolves to `md`/`primary`.
- The size/color matrix covers all 12 supported pairs at a shared native value of 60. Repeating
  endpoint, disabled, and invalid states across all 12 pairs is omitted: size and color are already
  explicit in the matrix, while invalid and disabled styling override the selected colors.
- The endpoint card shows native minimum, midpoint, and maximum values, optional visual endpoint
  labels, and the explicit `min=-100`, `max=0`, `value=0` edge that previously produced a half-width
  fill. The E2E asserts the generated fill is `100%`; the unit test also covers omitted bounds and
  preserves the native `0`/`100` defaults. Fractional values remain omitted because the value tooltip
  rounds to an integer.
- Disabled uses a static native `disabled` attribute on the page and asserts native disabled
  semantics plus generated wrapper state. Library unit tests cover dynamic `[disabled]` true/false
  reflection and coexistence with Signal Forms' disabled-state input wiring.
- Invalid styling is shown once through the standalone `invalid` input and once through a Field error.
  The invalid color override makes a full invalid-by-color matrix visually identical; it is omitted.
- The Signal Forms example binds one native range to a typed form model and schema with `min`/`max`
  bounds. Playwright verifies native ArrowRight/Home/End behavior and the resulting input value;
  the library unit test separately verifies that an input event updates the form model. The browser
  test does not observe or assert the model signal.
- The numeric value tooltip is intentionally supplementary, hard-coded numeric text from the
  library, and rounded by source; it has no `aria-describedby` relationship. Pointer leave starts
  its exit animation before the generated overlay is disposed; E2E waits for removal before
  targeting the static tooltip by its accessible name. The static `kuiTooltip` override opens on
  hover and keyboard focus, and its E2E checks that `aria-describedby` points to the visible tooltip.
  Tooltip screenshots clip around the Slider wrapper and surface together, and the keyboard-focus
  capture includes the focused thumb; an assertion also checks the surface sits above its thumb. The
  standalone sample keeps that binding separate from Field description wiring. Range keyboard
  operation remains native, with no Slider-specific key handling.
- Focus-visible and keyboard endpoint states are produced by Playwright interactions, not page CSS.
  The Slider stylesheet defines an `:active` visual state, but Chromium did not expose
  `:active` on the native range during a real mouse press at the input or rendered thumb, so the page
  does not claim or capture a pressed state. The E2E spec checks reduced-motion thumb and tooltip
  behavior without a separate screenshot because reduced motion changes timing, not the static
  catalogue appearance.
- Page-local `__control-row` wrappers reserve a 44px row for alignment only; they are not touch
  targets and do not change the generated `.kui-slider` box or native input hit area. In the
  touch-enabled 320px test, every generated native control remains below 44px; the basic sm/md/lg
  Slider boxes are about 16/22/28px tall. This is below the app's 44×44px touch-target guidance.
  Meeting that target would require changing the KUI-owned `.kui-slider` or `.kui-slider-native`
  geometry; this page keeps layout-only styling and records the component-level accessibility gap
  for library-owner follow-up.
- The 320×2000 section screenshots use a tall viewport so the full 12-pair variants matrix fits in
  the workspace's scrollport in one capture. A separate touch-enabled 320×844 test checks
  ordinary-height overflow and native control dimensions.
- The fresh-build catalogue test showed stable pixel differences against the old 320px `states` and
  `signal-forms` captures, so both named mobile evidence images were regenerated and reviewed.
- The page's E2E asserts the documented SSR shape using JavaScript-disabled raw markup, then separately
  checks hydrated native keyboard behavior: the server keeps the raw native range, and browser
  hydration creates the visual wrapper. The parent-owned shared route registry is responsible for
  making `/components/slider` reachable.

## Source Discrepancies And Omissions

- `docs/di-defaults.md` says Slider inherits a parent Field size before root size. The current
  implementation resolves only local size, supported root size, then `md`; its Field injection is
  used for id/ARIA/invalid behavior, not size. The page avoids a Field-size-inheritance example and
  records the mismatch rather than asserting behavior the source does not implement.
- The docs describe the “current numeric value” in the hover tooltip, while the implementation uses
  `Math.round`. The page shows integer values only and records the rounding behavior.
- An explicit Slider `id` inside `kui-field` would not retarget the Field label, which still points to
  the Field's `controlId`. The explicit-id example is standalone and has its own matching native label.
- The generated value tooltip has no `aria-describedby` association; it remains supplemental while the
  native range exposes its value. The shared static tooltip does manage its own description, so that
  example is kept outside `kui-field` to avoid two directives writing the same host attribute.
- Slider CSS contains `.kui-slider-tooltip*` selectors, but the directive currently creates the shared
  `KuiTooltipSurfaceComponent` overlay instead. The page demonstrates the shipped shared tooltip and
  does not represent the unused Slider-specific tooltip selectors as rendered output.
- A degenerate range with equal bounds is omitted: the source sets fill width to `0%`, and it is not a
  useful control state. Readonly is omitted because native range has no Slider readonly input or
  readonly styling state. Vertical/multi-thumb controls are unsupported by the public selector/API.
- Server/client generated wrapper structure is covered in the page-local route test. Formal
  assistive-technology review has not been performed with screen readers such as NVDA or VoiceOver;
  forced-colors/Windows High Contrast behavior and contrast measurements for the thumb, fill, focus
  treatment, and disabled colors also remain unverified. Native range keyboard behavior is tested in
  Chromium; browser-specific differences in native range keys are not covered.

## Evidence Map

- `docs/slider.md`: native range usage, Field/Signal Forms composition, public inputs, and tooltip
  precedence.
- `docs/di-defaults.md`: root size behavior and the documented Field-size inheritance claim.
- `projects/ui/src/lib/components/slider/kui-slider.directive.ts`: input types/resolution, Field
  wiring, browser-only wrapper creation, native state synchronization, fill calculation, tooltip
  lifecycle, and generated DOM.
- `projects/ui/src/lib/components/slider/kui-slider.directive.spec.ts`: wrapper/fill/variant/labels,
  explicit `max=0` and omitted-bound defaults, dynamic standalone and Signal Forms disabled-state
  transitions, Signal Forms model updates from an input event, and Field id/ARIA/invalid unit coverage.
  It does not test tooltip behavior, native keyboard behavior, reduced motion, or SSR.
- `projects/kikita-ui-playground/e2e/slider-playground.visual.spec.ts`: the named `fills a native
range to 100% when max is zero` case verifies the visible `min=-100`, `max=0`, `value=0` example
  has a `100%` fill. Hover/focus tooltip captures use bounded clips containing their Slider wrapper
  and thumb; the keyboard case also asserts tooltip placement above the focused thumb.
- Signal Forms model propagation is asserted by the library unit test; page E2E only verifies the
  native range's keyboard-driven value and does not inspect the form model signal.
- `projects/ui/src/styles/slider.css`: track/thumb geometry, semantic colors, active/focus states,
  disabled styling, label layout, and reduced-motion transition.
- `projects/ui/src/styles/tooltip.css` and
  `projects/ui/src/lib/utils/kui-tooltip-overlay.util.ts`: shared tooltip overlay and reduced motion.
- `projects/ui/src/lib/theme/create-kui-theme.ts`: theme token values for Slider shadows and semantic
  colors.
- `projects/kikita-ui-playground/src/app/app.config.ts`: root provider does not set a default size.
- `projects/kikita-ui-playground/.agents/accessibility.md`: touch targets are at least 44×44px on
  touch viewports. The page's layout wrapper does not meet this rule on behalf of the smaller native
  Slider control; the source sizing limitation remains unresolved.

## Self-Review Checklist

- [x] The minimally configured default comes first, has no hint/error ARIA reference, and every
      supported size/color pair is visible.
- [x] Every Slider input/default is mapped above; native attributes, Field integration, and
      Signal Forms are separated from directive-owned inputs.
- [x] Endpoint labels, native endpoints, invalid/disabled states, value/static tooltip behavior,
      keyboard operation, focus-visible state, and browser enhancement are mapped to real examples.
- [x] Source/documentation discrepancies and omitted states have specific reasons.
- [x] Page copy is scoped in English and Russian; E2E checks runtime locale changes and accessible
      labels/descriptions.
- [x] Layout uses token-based, page-local rules and keeps the shipped track/thumb design. The
      page-only 44px row is layout spacing, not an interactive target; the native control remains
      below the touch-size guidance and is recorded as an unresolved source limitation.
- [x] Scoped Prettier and `git diff --check` pass.
- [ ] Scoped ESLint and Stylelint checks pass.
- [x] Parent-owned repository static audit is clean.
- [x] Fresh production build and focused Slider browser suite pass: 11/11 on 2026-09-29 with the
      refreshed snapshots. The parent reviewed all eight changed PNGs at original resolution;
      tooltip captures include the slider anchor and focused state, and responsive captures have no
      clipping or overlap. The `/components/slider` SSR/hydration route check passed on 2026-09-27.
- [ ] Parent-owned full integration gate and final cross-page review remain pending.
- [ ] Formal screen-reader/assistive-technology, forced-colors/Windows High Contrast, and contrast
      review; the native range keyboard check is Chromium-only.

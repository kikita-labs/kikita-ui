# Progress Contract Inventory

This inventory maps the public Progress contract to the fixed Playground examples. Progress is a
presentational indicator; consumers own value updates, labels, live announcements, and any
surrounding task controls.

## Public inputs, types, and resolution

| Input   | Public type and default                                                                                  | Resolution and behavior                                                                                                                                                                                                                   | Page coverage                                                                                                                                                       |
| ------- | -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `type`  | `KuiProgressType`: `'linear' \| 'circular'`; default `'linear'`.                                         | Selects a horizontal fill or circular SVG ring.                                                                                                                                                                                           | The minimal default and the complete linear and circular matrices.                                                                                                  |
| `value` | `number \| null`; default `null`.                                                                        | The input transform maps nullish, non-numeric, and non-finite values to `null`. `null` means indeterminate. Finite values are clamped to `0..100` for geometry and `aria-valuenow`; zero and one hundred are valid determinate endpoints. | Default and invalid samples are indeterminate; the value catalogue shows `-20`, `0`, `12.5`, `50`, `100`, and `120`. The live range updates a consumer-owned value. |
| `color` | `KuiProgressColor`: `'primary' \| 'success' \| 'warning' \| 'danger' \| 'neutral'`; default `'primary'`. | Applies the semantic fill color.                                                                                                                                                                                                          | Each shape shows every color at every accepted size.                                                                                                                |
| `size`  | `KuiProgressSize \| undefined`: `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'`; omitted by default.              | Resolves explicit size, then a supported `provideKikitaUi({ defaults: { size } })`, then `'md'`. Progress accepts root defaults only for `xs`, `sm`, `md`, and `lg`. This app config has no root size default.                            | Both matrices show all five public values. Linear `xl` and circular `xs` are labeled with their implementation fallback. The omitted-size example resolves to `md`. |

The public aliases and component are exported from the Progress barrel, component barrel, and package
root public API. There are no outputs, models, methods, marker directives, or public content-slot
directives. There is no `buffer` input or buffered-progress state; Progress only renders one value
and one fill/ring.

## Semantics and supported composition

- Every host has `role="progressbar"`, `aria-valuemin="0"`, and `aria-valuemax="100"`. A
  determinate host exposes the clamped `aria-valuenow`; an indeterminate host omits it and sets
  `data-kui-indeterminate="true"`.
- Consumers must give each progressbar an accessible name with `aria-label` or `aria-labelledby`.
  The component does not set `aria-live` or announce changing values.
- Progress is not focusable and has no hover, active, pressed, disabled, invalid, selected, or
  keyboard state. Focus and keyboard interaction belong to the consumer range control in the live
  example.
- Linear Progress has no `ng-content` slot. Consumers place visible task text and percentages beside
  or below the bar. Circular Progress projects content into a centered visual label; its accessible
  name remains on the host.
- The live example uses the public `KuiSlider` on a native range input, with a native label
  and a visible percentage readout. The slider owns keyboard focus and updates the consumer's
  Progress `value` signal.
- The live Slider inherits a 22px vertical target at its default `md` size: its source styles use
  9px vertical padding around a 4px track, and the native input overlays that host. This is below
  the Playground's 44×44px touch-target guidance. It is a composed Slider limitation, not a Progress
  target; this page documents it without changing library or page styling or claiming compliance.
- The default value is unknown/indeterminate; the page keeps this minimal default and gives its
  progressbar an explicit accessible name.

## Complete visual domain

The full color × size matrix is shown for both `type` values: five colors across `xs`, `sm`, `md`,
`lg`, and `xl`. Each cell is determinate at 60%. The rows stay visible in normal page flow and wrap
locally on narrow viewports. E2E captures every row at 1440px and 320px, and each complete matrix at
768px; the 320px test scrolls the shell workspace to each row so its screenshot stays inside the
scrollport. It also checks document overflow at 768px and 320px.

Two accepted input values do not produce their named geometry in the current source:

- Linear `xl` keeps the base 6px thickness, the same as linear `md`, because the stylesheet only
  defines explicit linear thicknesses for `xs`, `sm`, `md`, and `lg`.
- Circular `xs` keeps `data-kui-size="xs"`, but its SVG geometry falls back to the `md` 36px
  configuration because circular geometry is defined only for `sm`, `md`, `lg`, and `xl`.

These source-backed fallbacks are labeled in the matrix and are not corrected in this page-only
change. They are absent from the current Progress docs. The rest of the accepted size domains are
`xs`/`sm`/`md`/`lg` for linear thickness and `sm`/`md`/`lg`/`xl` for circular geometry.

The concrete source geometry is linear `xs` 2px, `sm` 4px, `md` 6px, `lg` 8px, and `xl` 6px;
circular `sm` is 24px, `md` is 36px, `lg` is 48px, and `xl` is 64px, with circular `xs` using the
36px `md` configuration. Circular stroke widths are 2.5px, 3px, 3.5px, and 4px for `sm`, `md`,
`lg`, and `xl` respectively. These measurements come from the component stylesheet and SVG config;
the page does not reproduce them with its own CSS.

## Value, lifecycle, and motion states

- Value cases cover both boundaries, a fractional number, ordinary progress, and finite under/over
  values. E2E verifies the fill's inline width and `aria-valuenow` both clamp to the same endpoint.
- A malformed static value reproduces the unit-tested numeric-attribute coercion edge and becomes
  indeterminate. It has no `aria-valuenow`.
- Separate linear and circular samples show the indeterminate state. Under
  `prefers-reduced-motion: reduce`, the stylesheet intends to disable animation, but the later,
  equal-specificity linear indeterminate rule overrides `animation: none`: the fill still reports
  `kui-progress-slide` with infinite iterations and remains 35% wide instead of the reduced-motion
  rule's 50%. Circular motion is disabled by its `!important` declaration and displays a static
  quarter ring. This is a KUI stylesheet defect; the Playground records the actual result without a
  page-level shim. E2E checks the reduced-motion media preference and these computed results, plus
  confirms the linear slide/circular spin animations are active with `no-preference`. The visual spec
  emulates reduced motion before taking screenshots.
- There is no internal loading lifecycle, completion event, timer, or value animation control.
  Determinate linear width transitions use the library's normal duration token.

## CSS behavior observed in source

Progress styles are imported through `projects/ui/src/styles/kikita-ui.css`. The stylesheet consumes
`--kui-progress-track`, `--kui-progress-radius`, `--kui-progress-fill-primary`,
`--kui-progress-fill-success`, `--kui-progress-fill-warning`, `--kui-progress-fill-danger`,
`--kui-progress-fill-neutral`, and `--kui-progress-duration`, with Kikita token fallbacks. The width
transition also uses `--kui-duration-normal`. The page does not override these component styles or
create a token editor. Light and dark appearance comes from the Playground shell theme.

The fill fallbacks are `--kui-color-primary-fill`, `--kui-color-success-fill`,
`--kui-color-warning-fill`, `--kui-color-danger-fill`, and `--kui-color-text-secondary` for primary,
success, warning, danger, and neutral respectively. The track falls back to
`--kui-color-border`; linear radius falls back to `--kui-radius-full`.

## Contract-to-example map and omissions

| Example              | Coverage                                                                                                                                                                                               |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Default              | Omitted `type`, `value`, `color`, and `size`; indeterminate linear/primary/md and a consumer accessible name.                                                                                          |
| Linear variants      | All 25 color × size combinations at 60%, including the labeled `xl` thickness fallback.                                                                                                                |
| Circular variants    | All 25 color × size combinations at 60%, including the labeled `xs` geometry fallback.                                                                                                                 |
| Value boundaries     | `-20`, `0`, `12.5`, `50`, `100`, `120`, and an invalid static numeric attribute; verifies clamp and indeterminate semantics.                                                                           |
| Indeterminate        | Both visual types under reduced-motion emulation and no-preference animation checks; documents the current linear reduced-motion cascade defect.                                                       |
| Consumer composition | External linear text/percentage and projected circular center text with host accessible names.                                                                                                         |
| Live consumer value  | Keyboard-operable native range control updates the progressbar and visible percentage readout; English and runtime Russian range/progress names are checked; focus belongs to the range, not Progress. |

There is no buffer input or secondary loaded track, hover/focus/pressed/disabled/invalid component
state, output/model, label slot for linear, percentage text API, or consumer-controlled animation
input to demonstrate. Density is not a Progress input. Duplicate visual states that differ only by
out-of-range inputs are included in the value catalogue because clamping is meaningful API behavior;
no arbitrary-props editor is added.

## Source audit

- [Progress docs](../../../../../../../../../docs/progress.md) provide the import, examples, input
  domains/defaults, accessible-name requirement, and public style entrypoint note.
- [Component source](../../../../../../../../../projects/ui/src/lib/components/progress/kui-progress.ts),
  [Progress barrel](../../../../../../../../../projects/ui/src/lib/components/progress/index.ts),
  [component exports](../../../../../../../../../projects/ui/src/lib/components/index.ts), and
  [public API](../../../../../../../../../projects/ui/src/public-api.ts) establish signal inputs,
  aliases, exports, transforms, geometry, ARIA attributes, and projection behavior.
- [Progress CSS](../../../../../../../../../projects/ui/src/lib/components/progress/kui-progress.css) and the
  [style entrypoint](../../../../../../../../../projects/ui/src/styles/kikita-ui.css) establish
  colors, linear thicknesses, circular geometry styling, motion, reduced motion, and CSS hooks.
- The [Progress unit spec](../../../../../../../../../projects/ui/src/lib/components/progress/kui-progress.spec.ts)
  checks type default, role, determinate/indeterminate ARIA, linear fill/clamping, host size/color,
  circular markup/dimensions/dash offsets, static-number coercion, and invalid static value fallback.
  The [root defaults integration spec](../../../../../../../../../projects/ui/src/lib/providers/kikita-ui-defaults.integration.spec.ts)
  checks that a root `sm` applies to omitted Progress size. Neither test covers the two size geometry
  fallbacks or reduced-motion CSS.
- The legacy Progress playground page (removed legacy file `playground/src/app/pages/progress/progress.page.html`)
  demonstrates color/size matrices, labels, circular center content, indeterminate samples, and a
  live slider. The replacement Playground config has no root size default. [File Upload](../../../../../../../../../projects/ui/src/lib/components/file-upload/kui-file-upload.html)
  uses Progress for consumer-owned upload feedback.
- `docs/design-provenance.md` has no Progress-specific visual decision. This page reuses the shipped
  Progress rendering and the agreed card-based entity-page contract; it introduces no component
  restyling.
- The Playground [accessibility guidance](../../../../../../../../../projects/kikita-ui-playground/.agents/accessibility.md)
  sets the 44×44px touch-target expectation; the default-md Slider source geometry noted above does
  not meet its vertical dimension.

## Self-review checklist

- [x] Every public input, type alias, default, resolution rule, coercion rule, and clamp behavior is mapped above.
- [x] No output, model, method, or unsupported interaction state is presented.
- [x] Both complete type × color × size matrices are visible, and the `linear xl` / `circular xs` implementation fallbacks are explicit.
- [x] Accessible names, progressbar range semantics, omitted indeterminate value, consumer-owned label composition, and live range keyboard ownership are covered.
- [x] Finite-value E2E cases check both the visual linear fill width and the clamped `aria-valuenow`; runtime Russian coverage checks the live range label and changing progressbar name.
- [x] The composed default-md Slider's source-measured 22px vertical hit target is recorded as below Playground touch guidance; the page does not restyle it or claim target-size compliance.
- [x] Reduced-motion screenshots use an explicit Playwright media preference; page code uses no browser globals or time-dependent state.
- [x] All visible copy has matching English and Russian scope keys; catalogues are structurally identical.
- [x] Page styles arrange layout with Kikita tokens and do not restyle Progress.
- [x] Root-owned fresh production SSR build and focused Progress browser suite passed for the shared worktree on 2026-09-28; all 10 E2E cases passed, including direct-route SSR/hydration.
- [x] Root reviewed the current default dark/light/320 captures, full linear/circular color-size matrices, documented size fallbacks, composition, reduced motion, and live keyboard state; no visual clipping was found.
- [x] Scoped Prettier, `git diff --check`, and static audit passed. Local ESLint could not run because the installed ESLint dependency tree is missing `debug`; no ESLint pass is claimed.
- [ ] Parent-owned route integration remains outside this page task.
- [ ] No real assistive-technology review was performed; the page verifies DOM semantics and keyboard operation only.

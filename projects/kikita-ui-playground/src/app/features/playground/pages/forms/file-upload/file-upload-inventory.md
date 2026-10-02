# File Upload page inventory

This inventory maps the public `KuiFileUploadComponent` contract to the fixed
catalogue at `/components/file-upload`. It records library behavior from the
local source and docs; the page does not redefine the component contract.

## Public inputs, model, and output

| Surface                 | Type and resolution                                                                                                                                                                                                      | Page coverage                                                                                                                                                                                                                                            |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `variant`               | `KuiFileUploadVariant`: `'dropzone' \| 'compact'`; defaults to `'dropzone'`.                                                                                                                                             | Default group plus the dropzone/compact matrix, each in multiple and single mode.                                                                                                                                                                        |
| `mode`                  | `'single' \| 'multiple'`; defaults to `'multiple'`.                                                                                                                                                                      | Matrix shows both. Single replacement demonstrates that a second selection replaces the first and ignores `maxCount`.                                                                                                                                    |
| `accept`                | Optional `readonly string[]`; omitted or empty accepts any type. Selection validation uses exact `File.type` membership.                                                                                                 | Unrestricted examples, exact `image/png` validation, a literal `image/*` example, and a PDF field composition. A dedicated E2E check selects `image/png` under `image/*` and expects rejection.                                                          |
| `acceptLabel`           | Optional string; rendered as a hint and included in the dropzone accessible name.                                                                                                                                        | Short English and Russian hints appear in the matrix, validation, wildcard, single, disabled, and field groups.                                                                                                                                          |
| `maxSize`               | Optional byte count, transformed with `numberAttribute`; only finite positive parsed numbers survive, then the value is floored. The same transform is used by `maxCount`.                                               | Validation uses 1024 bytes and selects an oversized PNG. The fractional-positive-below-one case is a source edge: it passes positivity and then floors to zero, so it is recorded here rather than presented as normal behavior.                         |
| `maxCount`              | Optional count, transformed like `maxSize`; applies in multiple mode. Positive fractions below one also floor to zero.                                                                                                   | Validation accepts two files, reports the third as over the count, and clears the polite live error after a file is removed. Single mode demonstrates the limit is ignored.                                                                              |
| `size`                  | Optional `KuiSize` (`xs`, `sm`, `md`, `lg`). Effective size is local input, then global `defaults.size`, then `'md'`. The Playground root provider sets only styled scrollbars, so the omitted value resolves to `'md'`. | Default instance resolves to `md`. Seeded rows compare explicit `sm`, `md`, and `lg`. `xs` has no dedicated File Upload CSS selector and renders with base sizing, so it is omitted as visually identical. The page does not override the root provider. |
| `disabled`              | Boolean input with `booleanAttribute`; defaults to `false`.                                                                                                                                                              | Dropzone and compact triggers are disabled while an existing error row remains actionable. This reflects source behavior: disabled blocks picker/drop interactions, not row actions.                                                                     |
| `files` / `filesChange` | `model<readonly KuiUploadFile[]>([])`; Angular supplies the `filesChange` output for two-way binding.                                                                                                                    | Picker and removal change the model. Seeded rows show pending, uploading, success, and error. The lifecycle buttons and retry handler write consumer-owned statuses and progress back to the model.                                                      |
| `retry`                 | `output<KuiUploadFile>()`; emits the errored entry without changing the model itself.                                                                                                                                    | A seeded ZIP error exposes Retry. The page's consumer handler changes it to uploading at a fixed 35%; the same retry action remains enabled when the picker is disabled.                                                                                 |

`KuiUploadFile` carries `id`, native `file`, `name`, `size`, `type`, and
`status` (`pending`, `uploading`, `success`, or `error`), plus optional
`progress` and `errorMsg`. New valid selections start pending; validation
failures start in error. The page seeds deterministic metadata and a native SVG
preview after `afterNextRender`; the browser creates its object URL only after
that client-only seed appears. The component revokes cached preview URLs on
removal and destroy.

Uploading progress is rounded and clamped to `0..100`; the catalogue uses
fixed values `35`, `68`, and `100`. Error text is consumer-owned and is shown
for error rows; the seeded network failure and picker validation messages
cover those cases without introducing timed upload work.

The public discriminated types are `KuiFileUploadVariant` (`dropzone`,
`compact`), `KuiFileUploadMode` (`single`, `multiple`), and
`KuiUploadFileStatus` (`pending`, `uploading`, `success`, `error`).

The audit found documentation/source differences worth retaining: the docs
input table lists `size` as fixed at `md`, while source resolves the root size
provider first (the Playground app currently has no root size override); the docs outputs table lists `retry` but omits the
`filesChange` output generated by the `files` model; and the input docs say
invalid/non-positive limits are omitted without mentioning the positive
fraction-to-zero floor edge. The keyboard table also omits the Retry button,
although source renders it as a native `type="button"` and the page exercises
it with Enter.

## Behavior, accessibility, and composition

- The validation group selects real files through the native picker. It covers
  MIME rejection, size rejection, max count, clear-on-remove, picker Enter and
  Space, the absence of a third row after exceeding `maxCount`, and the
  consumer-owned pending → uploading → success lifecycle. The E2E captures
  both the max-count error and its cleared state after a file is removed.
- The wildcard group separately records that `accept=['image/*']` does not
  match `image/png` in the current exact-membership implementation. This is
  verified by a file-selection E2E assertion, not only by the hint text.
- The single group replaces one picked file with the next. It makes no claim
  that `maxCount` limits single mode; the source ignores that input there.
- The validation dropzone uses real browser `DragEvent`/`DataTransfer` objects
  to cover valid `over`, invalid drag, leave/drop reset, one accepted dropped
  file, and a rejected dropped file. Screenshot assertions cover valid `over`,
  invalid drag, and rejected drop. The accepted entry is removed before the
  rejected-drop assertion so the scenarios stay deterministic.
- The state group covers image preview, PDF/DOC/ZIP/other file kinds, and all
  four consumer-owned statuses. Progress is fixed at 68% for the seeded image;
  retry uses fixed 35% progress. No network transport, random values, or
  timers are involved.
- The size group compares `sm`, `md`, and `lg`. The disabled group includes a
  disabled dropzone and compact trigger with an existing error row; it verifies
  the picker controls are disabled and that Retry still works.
- The Field group shows `kui-file-upload` as plain projected content under
  `kui-field`, with required, hint, and consumer-owned error text. Its local
  `files` model clears the required error when a file is selected and restores
  it when the file is removed. The page owns this feedback logic; the upload
  model alone does not update Field validation state. The compact trigger is
  activated by its rendered `Attach file` button name.
- The native hidden file input remains the selection mechanism. E2E checks its
  `multiple`, `accept`, `disabled`, and `tabindex` attributes against the
  rendered examples, and verifies that selecting the same file twice works
  because the input value is cleared after each selection. The dropzone
  has a button role, label, disabled state, and Enter/Space handling; list
  changes and max-count errors use polite live regions; progress has a named
  progressbar; Remove and Retry are native named buttons. E2E captures the
  default dropzone's keyboard focus ring and covers keyboard removal with
  Delete and Backspace, plus a keyboard-focused remove control.
- English and Russian page text comes from the `file-upload` Transloco scope.
  The component itself currently renders built-in English strings such as
  “Drag files here”, “Choose file”, “Attach file”, “Queued”, “Done”, “Retry”,
  and validation messages; the page does not present those library-owned
  strings as translated.
- The page evidence contains 18 catalogue captures (nine named sections at
  desktop and 320px) plus eight interaction captures, for 26 snapshots. The
  768px tablet and ordinary-height 320×844 cases are responsive overflow
  assertions, not screenshot requirements. The long mobile captures keep all
  example content in frame without changing the Playground workspace scroll.
  The added valid-drag, max-count-error, and max-count-cleared captures were
  generated from the named live interactions and visually reviewed at full
  resolution. The focused SSR/browser spec then passed cleanly: 17/17, without
  snapshot updates. The SSR check loads the page with JavaScript disabled and
  confirms the seeded preview file is absent from server HTML; after browser
  hydration it waits for the seeded upload progressbar and checks for runtime
  errors.

## Source limitations and deliberate omissions

- The dropzone is a `div[role=button]` containing a native “Choose file”
  button (currently removed from tab order with `tabindex=-1`). This is nested
  interactive content and remains a source accessibility limitation; the page
  documents and exercises current behavior without masking it.
- Removing a file does not restore focus to the dropzone or another row
  control. The keyboard test verifies removal and focus before removal; it does
  not present the missing restoration as supported behavior.
- No external assistive-technology or screen-reader review is recorded for this
  page. E2E role and live-region assertions do not establish the behavior of a
  supported browser/screen-reader combination.
- The component source revokes cached preview object URLs on removal and
  destroy, but the component tests do not assert that lifecycle cleanup. The
  page only seeds a preview after client rendering; its SSR check does not
  verify object-URL revocation.
- The Field label, hint, and error are not programmatically associated with the
  File Upload control. `kui-field` points its label at its generated `controlId`,
  but File Upload exposes no matching ID or `aria-describedby` wiring for its
  hidden input or compact trigger. The example demonstrates consumer-owned
  required feedback only, not automatic label or description association.
- The shipped small picker buttons are 32px tall and the remove action is
  24×24px; the Retry link is also below the Playground's 44×44px touch-target
  rule. These are library-owned action styles. The page does not alter those
  visuals or claim the internal controls meet the touch-size requirement; a
  source-level fix or approved touch-target treatment is still needed.
- A nonempty `accept` value is compared literally. Wildcard expansion and
  extension-based matching are not implemented. For a drag item with no MIME
  type, the transient drag indicator can show valid while the dropped File is
  then rejected by exact selection validation; this source edge is not given a
  separate catalogue scenario.
- When both MIME and size checks fail, MIME validation wins because it runs
  first. A simultaneous-failure visual is omitted because it adds no distinct
  supported state to the page.
- `acceptLabel` is a hint only; it does not update the native picker filter or
  validation rules. The `accept` input controls both.
- The page does not add upload transport, automatic timers, random progress,
  generic prop controls, automatic Field validation, root-size configuration,
  or documentation-style API prose. The library owns upload transport and
  state; the persistent shell owns provider configuration; API prose belongs
  in `docs/file-upload.md`.

## Source references

- Public contract and examples: `docs/file-upload.md`.
- Inputs, `files` model, `retry` output, validation, drag/drop, preview URL
  lifecycle, keyboard handlers, and default-size resolution:
  `projects/ui/src/lib/components/file-upload/kui-file-upload.component.ts`.
- Native control structure, role/name/live regions, progress, retry, and remove
  controls: `projects/ui/src/lib/components/file-upload/kui-file-upload.component.html`.
- File entry fields and lifecycle types:
  `projects/ui/src/lib/components/file-upload/kui-upload-file.interface.ts`.
- Base, size, hover, drag, disabled, status, and focus styling:
  `projects/ui/src/styles/file-upload.css`.
- Root-size injection: `projects/ui/src/lib/utils/kui-defaults.util.ts` and
  `projects/ui/src/lib/providers/kikita-ui-options.token.ts`.
- Component tests and current focused behavior coverage:
  `projects/ui/src/lib/components/file-upload/kui-file-upload.component.spec.ts`.
- Page examples and client-only deterministic seed data live beside this
  inventory under `file-upload.ts`, `components/`, and `helpers/`.
- Page-owned browser behavior and screenshot assertions:
  `projects/kikita-ui-playground/e2e/file-upload-playground.visual.spec.ts`.

The page-owned E2E spec currently contains 26 screenshot expectations. This
follow-up adds three interaction captures; the clean focused SSR/browser run
passed 17/17, and all 26 captures were visually reviewed. The rollout tracker
records commit `13ef266` as the original page commit. The parent integrated the
Forms route, translation scope, and shared SSR route registration; the final
shared SSR/browser integration gate remains with the parent integrator.

## Self-review checklist

- [x] The page has a minimal default and decomposed examples for variants, selection modes, validation, lifecycle states, sizes, disabled behavior, and Field composition.
- [x] Inputs, defaults, model/output behavior, picker attributes/reset, accepted/rejected drag-drop, keyboard/pointer states, accessibility limits, SSR boundaries, and source discrepancies are mapped or explicitly omitted.
- [x] The route, locale scope, shared SSR registry, real file-selection/drag/keyboard E2E scenarios, and matching locale keys are present.
- [x] The original page inventory records local formatting/locale checks, and the rollout tracker records the original 17/17 focused E2E run for page commit `13ef266`; these historical checks do not validate the subsequently edited spec.
- [x] The focused E2E spec passes 17/17; all 26 desktop/320px catalogue and interaction captures are present and visually reviewed, including the three added interaction captures.
- [ ] Independent review of the current page and its screenshots is complete.
- [ ] Parent SSR/browser integration checks pass after the updated page evidence is reviewed.
- [ ] A clean page-scoped follow-up commit is complete.

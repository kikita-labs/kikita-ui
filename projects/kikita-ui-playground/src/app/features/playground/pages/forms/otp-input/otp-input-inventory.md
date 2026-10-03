# OTP Input Inventory

Status: implemented. The contract audit was reviewed and accepted by the parent before implementation.

## Contract sources

- Public contract: [`docs/otp-input.md`](../../../../../../../../../docs/otp-input.md),
  [`docs/field.md`](../../../../../../../../../docs/field.md), and
  [`docs/forms.md`](../../../../../../../../../docs/forms.md).
- Implementation:
  [`kui-otp-input.component.ts`](../../../../../../../../../projects/ui/src/lib/components/otp-input/kui-otp-input.component.ts),
  unit suite
  [`kui-otp-input.component.spec.ts`](../../../../../../../../../projects/ui/src/lib/components/otp-input/kui-otp-input.component.spec.ts),
  styles [`otp-input.css`](../../../../../../../../../projects/ui/src/styles/otp-input.css), the
  `positiveIntegerAttribute` transform in
  [`kui-input-transform.util.ts`](../../../../../../../../../projects/ui/src/lib/utils/kui-input-transform.util.ts),
  and root size resolution in
  [`kui-defaults.util.ts`](../../../../../../../../../projects/ui/src/lib/providers/kui-defaults.util.ts).
- Existing browser tests to keep covered but not duplicate (legacy app,
  [`tests/e2e/behavior.spec.ts`](../../../../../../../../../tests/e2e/behavior.spec.ts)): label click
  focuses the first cell; keyboard navigation and paste distribution across cells.
- Legacy reference for scenarios only: `projects/playground/src/app/pages/otp-input`.

## Public API, defaults, and coverage map

`KuiOtpInputComponent` (`kui-otp-input`) is a composite component, not a directive. Its template
renders one `input[kuiInput]` per cell, plus a `kuiLoader` span while `loading`. It implements
`FormValueControl<string>`; `[formField]` goes on `kui-otp-input` itself.

| Member                | Type, default, resolution, observed behavior                                                                                                                                                                                                                                                                                                                                | Planned coverage                                                                                                                                                                                                                                                          |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `length` (input)      | `number`, default `6`, transform `positiveIntegerAttribute`: non-finite or `< 1` becomes `1`, fractions floor. Cell count follows it; a change reseeds cell state from `value`.                                                                                                                                                                                             | Lengths card: 4, default 6, and 8 cells. The normalized fallback (`length="0"` becomes one cell) is not a supported value and is intentionally not shown.                                                                                                                 |
| `size` (input)        | `KuiSize \| undefined`; resolves local, then root `provideKikitaUi` default, then `md`. Sets `data-kui-size` on the host and every cell. Cell size tokens: xs 28px / sm 32px / md 40px / lg 44px.                                                                                                                                                                           | Sizes card with xs, sm, md, lg (4 cells each); default omits the input and shows `md`. Root-provider override omitted (this app sets no size default).                                                                                                                    |
| `mask` (input)        | `boolean`, default `false`. Cells become `type="password"`.                                                                                                                                                                                                                                                                                                                 | Masked 4-cell PIN example; test asserts every cell has `type=password` and typed value is not visible as text.                                                                                                                                                            |
| `integerOnly` (input) | `boolean`, default `true`. `true`: digits only, `inputmode="numeric"`. `false`: `[a-zA-Z0-9]`, uppercased, `inputmode="text"`, host `data-kui-alpha`, CSS uppercase.                                                                                                                                                                                                        | Default numeric example rejects letters (real typing); 8-cell backup code example accepts letters and uppercases them.                                                                                                                                                    |
| `autoFocus` (input)   | `boolean`, default `false`. Provided by the `KuiAutoFocusDirective` host directive: focuses the first cell that can take focus after the first render and again on every `false` to `true` change (browser only). Also `required` (input) marks the first cell required and `focus()` focuses the first usable cell.                                                        | An on-demand example (button mounts a group with `autoFocus`) so page load never steals focus; test asserts cell 1 focused after mount.                                                                                                                                   |
| `ariaLabel` (input)   | `string`, default `'Verification code'`. Host `aria-label`, host `role="group"`.                                                                                                                                                                                                                                                                                            | Default keeps the library label; PIN and backup examples pass translated custom labels. Tests locate groups by these names.                                                                                                                                               |
| `value` (model)       | `string`, default `''`. Joined cell characters. External writes reseed cells through an effect; commits write `chars.join('')`. Clearing a middle cell collapses later cells in the joined string (documented, accepted).                                                                                                                                                   | Live readout next to the default group; collapse-on-clear demonstrated in the keyboard scenario and asserted in a test (documented limitation, not a defect).                                                                                                             |
| `disabled` (input)    | `boolean`, default `false`. Every cell gets native `disabled`; host `data-kui-disabled`. Set by `[formField]`.                                                                                                                                                                                                                                                              | States card: disabled with seeded value; test asserts every cell disabled and not focusable via Tab.                                                                                                                                                                      |
| `readonly` (input)    | `boolean`, default `false`. Renamed from `readOnly` in v2 to match the Signal Forms contract, which now binds it. Cells get native readonly; paste and cross-cell Backspace are explicitly blocked.                                                                                                                                                                         | States card: read-only with seeded value; real paste and Backspace tests assert value unchanged, cell remains focusable.                                                                                                                                                  |
| `loading` (input)     | `boolean`, default `false`. Cells disabled, host `data-kui-loading`, cells blurred (`filter: blur`), absolutely positioned `kuiLoader` labelled `Verifying code` (library-owned English) overlays the group, group size unchanged.                                                                                                                                          | States card: static seeded loading example; verification scenario toggles it for a deterministic fixed-clock period. Test asserts cells disabled, loader present, group box size identical before and after loading.                                                      |
| `invalid` (input)     | `boolean`, default `false`. Without `[formField]`: `invalid() \|\| field.invalid()`. With `[formField]`: raw Signal Forms invalid gated by `touched()`. Sets `data-kui-invalid` and `aria-invalid` on every cell.                                                                                                                                                           | States card: standalone invalid. Field card: ambient Field error alone marks cells invalid. Forms card: untouched shows no invalid, touched shows invalid.                                                                                                                |
| `errors` (input)      | `readonly WithOptionalFieldTree<ValidationError>[]`, default `[]`. Written by `[formField]`; not read by the component template.                                                                                                                                                                                                                                            | Written by the Signal Forms binding in the forms card; error text rendered by `kui-field` (asserted).                                                                                                                                                                     |
| `touched` (input)     | `boolean`, default `false`. Written by `[formField]`; gates `effectiveInvalid` when bound.                                                                                                                                                                                                                                                                                  | Forms card: real Tab-away or blur produces touched state.                                                                                                                                                                                                                 |
| `touch` (output)      | `void`. Emitted after every commit (typing, Backspace clear, paste), not on focus or blur.                                                                                                                                                                                                                                                                                  | Not shown as a counter. Effect covered through Signal Forms (touch marks the field touched) and asserted in the forms scenario. Direct output omitted as an event log has no user value.                                                                                  |
| `complete` (output)   | `string`. Emitted from `commit` when the code transitions from not complete to complete; not re-emitted while complete (including replacing a full code with another full code), re-emitted after becoming incomplete and refilled.                                                                                                                                         | Completion card: visible counter of completions and last completed value, plus verification scenario. Tests type 6 digits (1 emit), overwrite a digit while complete (still 1), clear and refill (2).                                                                     |
| Host semantics        | `role="group"`, `aria-label`, `aria-describedby` from ancestor `kui-field` hint/error ids, `data-kui-size/alpha/invalid/disabled/loading`. Cells: `aria-label="Digit N of M"` (library English), cell 0 `autocomplete="one-time-code"`, others `off`, `maxlength=1`. Cell 0 id equals the ancestor Field `controlId`, so the Field label focuses it.                        | Field card: label click focuses cell 1 (real click), `aria-describedby` ids resolve to rendered hint and error. Default and Field examples assert group role and per-cell labels.                                                                                         |
| Keyboard              | Typing valid char fills and advances; invalid char is reverted with no commit; Backspace on empty cell N>0 clears N-1 and focuses it (blocked when read-only); Backspace on a filled cell clears only itself; Arrow Left/Right clamp at the ends; Home/End jump; focus selects the cell content so typing replaces it; Tab leaves the group. Paste always starts at cell 0. | Keyboard scenario card with real key presses; tests assert focus and value after each step (see test plan).                                                                                                                                                               |
| Paste                 | Whitespace and disallowed characters stripped, alpha uppercased, truncated to `length`, distributed from cell 0, focus goes to `min(text.length, length-1)`; text with no valid characters is ignored (default prevented, no commit).                                                                                                                                       | Paste scenario using the real clipboard (`Ctrl+V` after `navigator.clipboard.writeText` with granted permission) for `12 34 56`, a too-long code, junk text, and an alphanumeric code; DataTransfer dispatch only as fallback if the clipboard permission is unavailable. |
| Signal Forms          | `FormValueControl<string>`; `[formField]` on `kui-otp-input`; with `required`, invalid state and Field error text appear only once touched.                                                                                                                                                                                                                                 | Forms card: required OTP in a `kui-field`; before/after touch, then complete valid value clears the error; model readout.                                                                                                                                                 |

## Visual, interaction, and lifecycle states

- Default: 6 empty cells, `md`, digits only, no autofocus.
- Filled (partial and complete), with the joined `value` shown outside the component.
- Sizes xs/sm/md/lg; lengths 1 (via coercion), 4, 6, 8; masked; alphanumeric uppercased.
- Idle, focus-visible (real Tab and click focus, cell selected), hover (real pointer, taken from the
  shared Input styling), invalid, disabled, read-only, loading (blur plus centered loader).
- Field composition: label, hint, error, required marker if the Field `required` input applies.
- Lifecycle: on-demand mount with `autoFocus`; `length` and external `value` reseeding (verification
  reset clears the code from outside); reset while loading.
- Overflow: `overflow-x: auto` on the group keeps a long `length` at `lg` inside narrow viewports;
  the 8-cell backup code at 320px must not create page-level horizontal overflow.

## Edge cases

- `length="0"` renders one cell (coercion). Not a supported value, so not shown on the page.
- Invalid characters typed into a cell are reverted without a commit and without `touch`.
- Typing into a filled focused cell replaces it (focus selects the character).
- A programmatic external `value` longer than `length` is truncated for display but the model is not
  rewritten; external values with disallowed characters are shown unsanitized. Neither is a
  documented supported path; not exercised on the page.
- Replacing a complete code with another complete code (overwrite one digit, or paste over) does not
  re-emit `complete`. This matches the docs wording but matters for retry-after-error flows;
  recorded as an observation, not a defect claim.
- Read-only blocks paste and cross-cell Backspace, loading and disabled block all input natively.

## Source discrepancies found

1. `docs/otp-input.md` "Value semantics and known limitation" states that the Field label does not
   focus the group. Implementation (`cellId` adopts `KuiFieldComponent.controlId` for cell 0), the
   unit test, `docs/state-coverage.md`, and the legacy browser test all say clicking the label
   focuses the first cell. The docs paragraph is stale. The page test follows the implementation.
   The paragraph was corrected in `docs/otp-input.md` in the same commit.
2. `docs/otp-input.md` "Known gaps" says `/otp-input` has no committed visual baselines; the new
   page will add them for the replacement app only.
3. Verified in the browser: `size` is documented as the "same scale as Input", but the component does not read the ambient Field size (`effectiveSize = size ?? rootDefault ?? 'md'`); cells inside `kui-field size="lg"` stayed `data-kui-size="md"` and 40px. `input.css` Field-size rules use `:not([data-kui-size])`, which the cells never match. Library finding, kept out of the page assertions.
4. `KuiOtpInputComponent` selector class exports and JSDoc are complete; the `errors` and `touched`
   inputs have no page-visible effect of their own (form plumbing).
5. The cell labels (`Digit N of M`), the loader label (`Verifying code`), and the default group label
   are library-owned English strings and stay English in the Russian locale, as recorded for other
   pages.

## Page catalogue and evidence map

All examples are visible at once as `app-playground-example-card` groups with `role="group"`
and translated labels (scope `otp-input`).

| Section                 | Content                                                                                     | Evidence                                                                                                                                         |
| ----------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Default                 | Field-labelled default 6-cell group and value readout.                                      | Server-rendered heading and cell count, hydration, group role, per-cell labels, `md` size, letters rejected, digits accepted.                    |
| Lengths                 | 4, 6, and 8 cells.                                                                          | Cell counts, screenshots desktop and 320px (no page overflow; cells shrink below square, see library findings).                                  |
| Sizes                   | xs, sm, md, lg, all 4 cells.                                                                | `data-kui-size` and measured cell heights 28/32/40/44px.                                                                                         |
| Masked and alphanumeric | Masked PIN, uppercased backup code.                                                         | `type=password`, `inputmode`, uppercase after typing lowercase.                                                                                  |
| States                  | Invalid, disabled, read-only, loading (all seeded `482913`).                                | Attributes per cell, disabled and loading cells disabled, read-only ignores typing, paste and Backspace, loading keeps group size, screenshots.  |
| Field wiring            | Field with label, hint, and error around the OTP group.                                     | Real label click focuses cell 1, `aria-describedby` resolves, cells invalid from ambient error.                                                  |
| Keyboard                | Empty group plus readout; real typing, Backspace, arrows, Home/End.                         | Focus and value assertions, collapse-on-clear, focus-visible screenshot from real Tab.                                                           |
| Paste                   | Group plus readout for real paste.                                                          | Distribution, whitespace/junk stripping, truncation, alpha uppercasing, focus placement.                                                         |
| Completion and loading  | Group with completion counter; consumer-owned verification using fixed clock; reset button. | `complete` once, no re-emit while complete, re-emit after refill, loading toggled with `page.clock`, before/after screenshots.                   |
| Autofocus               | Button that mounts a group with `autoFocus`.                                                | First cell focused after activation.                                                                                                             |
| Signal Forms            | Required OTP in Field bound with `[formField]` and model readout.                           | No invalid before touch, Field error and invalid cells after the first edit (touch fires on edit, not on blur), cleared after a full valid code. |
| Locale and responsive   | EN/RU catalogues with identical keys.                                                       | Language switch via accessible control, heading and group names, overflow at 320, 768, and desktop.                                              |

E2E file: `e2e/otp-input-playground.visual.spec.ts` (behavior tests plus `@visual` captures per
named section at desktop and 320px and before/after interaction states). Axe is run against the
route through the shared sweep.

## Omitted combinations

- Root-provider `size` override: the app sets no size default.
- Every `size` at every `length`: sizes and lengths are independent axes; the long-group 320px
  behavior is recorded as a library finding.
- `length="0"`: a normalized fallback, not a supported value.
- Direct `touch` output log and `errors` display: no visible effect beyond the Field integration.
- Disabled or read-only through Signal Forms schema: the component reads the same `disabled` and
  `readonly` inputs, already covered by direct examples.
- Dark theme screenshots: theme is owned by the shell; captures use the default theme.

## Library findings recorded by this page (not fixed)

- Every cell is a tab stop: Tab moves between cells although the docs say Tab leaves the group. Reproduced by the fixme test "leaves the whole group on Tab as documented".
- At 320px an 8-cell group shrinks its cells to about 23px wide (height stays 40px) instead of keeping square cells and scrolling as the `otp-input.css` comment describes. Reproduced by the fixme test "keeps cells square in a long group at 320px".
- The Field size is not inherited (see discrepancy 3).
- Typing a character and pressing Backspace within one render tick can leave a stale character in the previous cell DOM although state and value are cleared (the `[value]` binding does not change, so Angular does not rewrite the DOM). Only reproducible with synthetic input speed; the tests wait for the rendered readout between the two keys.
- After a code is complete the focus stays in the last cell with the caret after its character, so typing another character is ignored until the cell is re-focused (which selects it).
- The completed code cannot be replaced by typing or pasting another complete code without `complete` firing again (documented, recorded as an observation).

## Self-review

- [x] Every public input, model, and output is mapped to an example, a browser check, or a recorded omission.
- [x] Re-read against `kui-otp-input.component.ts`, its unit spec, `otp-input.css`, and `docs/otp-input.md`; the stale Field-label paragraph in the docs was corrected in the same commit.
- [x] EN and RU catalogues have identical key sets. Library-owned strings (cell labels, loader label, default group label) stay English.
- [x] Behavior tests use real keyboard, real clipboard paste, real clicks, and `page.clock` for the verification timer; no fixed sleeps.
- [x] Desktop and 320px captures for every card plus focus, typed, pasted, hover, loading, accepted, rejected, validation, and mounted-autofocus states were opened and inspected.

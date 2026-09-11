# OTP Input

Row of single-character cells for entering a one-time verification code (SMS/email/authenticator)
or a PIN. Each cell renders the kit's own native `input[kuiInput]` styling unmodified -- only cell
layout (square size, centered digit) is overridden -- while `kui-otp-input` owns roving keyboard
navigation, paste distribution across cells, and coordinated value state as a single composite
control.

## Import

```ts
import { KuiOtpInputComponent } from '@kikita-labs/ui';
```

Import runtime styles once:

```ts
import '@kikita-labs/ui/styles';
```

## Usage

```html
<kui-otp-input [(value)]="code" (complete)="verify($event)" autoFocus />
```

```ts
protected readonly code = signal('');

protected verify(code: string): void {
  // ...
}
```

`value` is the joined string of every cell's character, in cell order. `(complete)` fires exactly
once, with the completed value, the moment every cell becomes filled -- it does not re-fire while
the code stays complete, and fires again only after the code becomes incomplete and is refilled.

## Sizes

```html
<kui-otp-input size="lg" [(value)]="code" />
```

`size` uses the same `xs | sm | md | lg` scale as `Input` (default `'md'`).

## Mask and backup codes

```html
<!-- Hides entered characters (type="password" per cell) -->
<kui-otp-input mask [length]="4" [(value)]="pin" ariaLabel="PIN code" />

<!-- Letters and digits, uppercased, for backup/recovery codes -->
<kui-otp-input [integerOnly]="false" [length]="8" [(value)]="backupCode" ariaLabel="Backup code" />
```

`length` defaults to `6`, the most common SMS/email code length. `integerOnly` defaults to `true`
(digits only, numeric mobile keyboard); set it to `false` for alphanumeric codes.

## Loading

```html
<kui-otp-input [(value)]="code" [loading]="verifying()" (complete)="startVerify($event)" />
```

`loading` disables every cell (an async server check is running), blurs the entered code in place
(still visible, just softened, not hidden or covered), and shows a `Loader` centered over the
group -- the group's own size never changes (unlike putting the `Loader` beside it, which would
widen the component). `kui-otp-input` has no built-in success/error status display -- it cannot
know a server verification result on its own -- so render that next to the group from the
consumer's own state, the same way the playground's `/otp-input` page demonstrates it.

## Inside `kui-field`

Label, hint, error, and required state stay `kui-field`'s job; `kui-otp-input` only owns the cell
group:

```html
<kui-field
  label="Code from email"
  hint="We sent a 6-digit code to your email"
  error="Code is wrong or expired -- request a new one"
>
  <kui-otp-input [(value)]="code" [invalid]="true" />
</kui-field>
```

## Signal Forms

`kui-otp-input` implements `FormValueControl<string>`, so it takes `[formField]` directly (it is
not a native element, so `[formField]` goes on `kui-otp-input` itself, not on `kui-field` -- the
same pattern `kui-segmented` uses):

```html
<kui-field label="Verification code">
  <kui-otp-input [formField]="signInForm.code" />
</kui-field>
```

A `required`/custom validator's message renders through `kui-field`'s own error text exactly as it
does for a plain `input[kuiInput]` (`kui-field` reads the projected `[formField]` directly, since
`kui-otp-input` is `kui-field`'s direct child) -- both the error text and the cells' own invalid
styling stay hidden until the field is touched.

## API

| Input         | Type                         | Default               | Description                                                                                         |
| ------------- | ---------------------------- | --------------------- | --------------------------------------------------------------------------------------------------- |
| `length`      | `number`                     | `6`                   | Number of cells.                                                                                    |
| `size`        | `KuiSize`                    | `'md'`                | Cell size. Same scale as `Input`.                                                                   |
| `mask`        | `boolean`                    | `false`               | Renders every cell as `type="password"`, hiding entered characters.                                 |
| `integerOnly` | `boolean`                    | `true`                | Restricts input to digits with a numeric mobile keyboard. `false` accepts letters too (uppercased). |
| `autoFocus`   | `boolean`                    | `false`               | Focuses the first cell after mount.                                                                 |
| `ariaLabel`   | `string`                     | `'Verification code'` | Accessible name for the cell group (`role="group"`).                                                |
| `value`       | `string`                     | `''`                  | Two-way model: joined characters of every cell, in order. Set by `[formField]` or `[(value)]`.      |
| `disabled`    | `boolean`                    | `false`               | Disables every cell. Set by `[formField]` or directly.                                              |
| `readOnly`    | `boolean`                    | `false`               | Makes every cell read-only.                                                                         |
| `loading`     | `boolean`                    | `false`               | Disables every cell (like `disabled`), blurs it in place, and shows a centered `Loader`.            |
| `invalid`     | `boolean`                    | `false`               | Marks every cell invalid. Set by `[formField]` or directly.                                         |
| `errors`      | `readonly ValidationError[]` | `[]`                  | Current validation errors. Set by `[formField]`.                                                    |
| `touched`     | `boolean`                    | `false`               | Whether the control has been touched. Set by `[formField]`.                                         |

| Output     | Payload  | Description                                                                   |
| ---------- | -------- | ----------------------------------------------------------------------------- |
| `touch`    | `void`   | Fires after any cell edit; marks the control touched in the form system.      |
| `complete` | `string` | Fires exactly once, with the completed value, when every cell becomes filled. |

## Accessibility

- The group is `role="group"` with an `aria-label` (default `"Verification code"`).
- Each cell is a plain `<input>` with its own `aria-label="Digit N of M"`.
- Keyboard:
  - Typing a valid character fills the cell and advances focus to the next empty cell.
  - `Backspace` on an already-empty cell clears and refocuses the previous cell (a non-empty cell
    just clears itself, native browser behavior).
  - `ArrowLeft`/`ArrowRight` move focus between cells without changing any value.
  - `Home`/`End` jump to the first/last cell.
  - `Tab`/`Shift+Tab` leave the whole group (arrow keys, not Tab, move between cells).
  - `Ctrl`/`Cmd+V` distributes a pasted code across cells starting at the first cell, regardless of
    which cell had focus.
- The first cell carries `autocomplete="one-time-code"` for WebOTP-based SMS autofill on iOS/
  Android.
- `invalid` is a plain manual input for standalone use; whether a code is wrong is normally a
  server response, which no client-side validator can know ahead of time. When bound through
  `[formField]`, Signal Forms writes its raw, untouched-gated validity into `invalid` (the same
  interop `input[kuiInput]` documents); `kui-otp-input` gates that specific case by `touched()`
  itself before showing it on the cells, so a required-but-empty code does not paint every cell red
  before the user has interacted with the group -- matching `kui-field`'s own gated error text.
- `readOnly` blocks pasting a new code and blocks the cross-cell Backspace clear (the native
  `readonly` attribute alone only blocks a cell's own direct keystroke, not those two component-
  level behaviors, so both are guarded explicitly).
- Disabled/loading use the native `disabled` attribute on every cell, so they are excluded from the
  tab order, not merely dimmed.

## Value semantics and known limitation

Clearing a cell while later cells stay filled collapses those positions once `value` is joined
(e.g. clearing cell 3 of a filled 6-cell code moves cells 4-6 left in the reported string). This
matches the Claude Design spec's own reference behavior and is accepted, not fixed, the same way
industry OTP inputs (e.g. PrimeNG's `InputOtp`) behave.

`kui-field`'s `label[for]` points at a `controlId` that no cell actually carries -- `kui-otp-input`
is a composite, non-native control, the same case `kui-segmented` already has (see
`docs/segmented.md`). Clicking the label does not move focus into the group; `hint`/`error` still
reach the group correctly through `aria-describedby`.

## CSS custom properties

| Token                      | Default (per `size`)                                            | Description                                             |
| -------------------------- | --------------------------------------------------------------- | ------------------------------------------------------- |
| `--kui-otp-gap`            | `--kui-space-2`                                                 | Gap between cells.                                      |
| `--kui-otp-cell-size`      | `--kui-input-height` (`md`) / `--kui-control-height-{xs,sm,lg}` | Cell inline-size/block-size (square).                   |
| `--kui-otp-cell-font-size` | `--kui-text-{sm,base,xl,2xl}-size` for `xs`/`sm`/`md`/`lg`      | Digit font size.                                        |
| `--kui-otp-loading-blur`   | `2px`                                                           | `filter: blur()` applied to every cell while `loading`. |

## Known gaps

- No built-in success/error status icon after verification -- see "Loading" above; this is an
  intentional scope decision, not a deferred gap.
- `/otp-input` has been reviewed in the browser at desktop width in both light and dark theme with
  no console errors; committed visual regression baselines and a formal assistive-technology review
  are not yet run.
